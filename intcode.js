function parseInstruction(inst) {
    const opCode = inst % 100;
    inst = ~~(inst / 100);
    const modes = [];
    for (let i = 0; i < 3; i++) {
        modes.push(inst % 10);
        inst = ~~(inst / 10);
    }
    return {
        opCode,
        modes
    };
}

const OPCODE_HALT = 99;
const OPCODE_ADD = 1;
const OPCODE_MUL = 2;
const OPCODE_INPUT = 3;
const OPCODE_OUTPUT = 4;
const OPCODE_JUMP_IF_TRUE = 5;
const OPCODE_JUMP_IF_FALSE = 6;
const OPCODE_LESS_THAN = 7;
const OPCODE_EQUALS = 8;
const OPCODE_ADJUST_RELATIVE_BASE = 9;

class Machine {
    constructor(program, input) {
        this.program = [...program];
        this.input = input === undefined ? [] : input;
        this.output = [];
        this.instPtr = 0;
        this.relativeBase = 0;
    }

    queueInput(val) {
        this.input.push(val);
    }

    queueInputArr(arr) {
        this.input = arr.concat(this.input);
    }

    dequeueOutput() {
        return this.output.pop();
    }

    executeNext() {
        const result = this.tryExecuteNext();
        if (result.opCode === OPCODE_HALT) return 'halt';
        if (result.opCode === OPCODE_INPUT && !result.didExecute) return 'input';
        if (result.opCode === OPCODE_OUTPUT) return 'output';
    }

    tryExecuteNext() {
        const { opCode, modes } = parseInstruction(this.program[this.instPtr]);

        switch (opCode) {
            case 99:
                return {
                    didExecute: false,
                    opCode
                };

            case 3:
                // abort if our input queue is empty
                if (this.input.length === 0) return {
                    didExecute: false,
                    opCode
                };
        }

        const instruction = this.instructions[opCode];
        if (!instruction) {
            throw Error(`Instruction ${opCode} not recognised`);
        }

        const params = this.program.slice(this.instPtr + 1, this.instPtr + 1 + instruction.params);
        try {
            const newPtr = instruction.execute(modes, params);

            if (newPtr === undefined) {
                this.instPtr += instruction.params + 1;
            } else {
                this.instPtr = newPtr;
            }
        } catch (err) {
            console.log(`Error thrown executing instruction ${this.instPtr}: ${JSON.stringify(this.program.slice(this.instPtr, this.instPtr + instruction.params + 1))}`);
            throw err;
        }

        return {
            didExecute: true,
            opCode
        };
    }

    runToInterrupt(maxLoops = Infinity) {
        let loopCount = 0;
        while(loopCount < maxLoops) {
            const result = this.executeNext();
            if (result) return result;

            loopCount++;
        }

        throw Error(`Max loops exceeded`);
    }

    paramConverter(modes) {
        return (param, i) => {
            const mode = modes[i];
            if (mode === undefined) throw Error(`No mode set for index ${i} - modes: ${modes}`);

            let val;

            switch(mode) {
                case 0:
                    val = this.getValue(param);
                    break;
                case 1:
                    val = param;
                    break;
                case 2:
                    const addr = this.relativeBase + param;
                    if (addr < 0) {
                        throw Error(`Address out of bounds: relative base: ${this.relativeBase}, relative address: ${param}`);
                    }
                    val = this.program[this.relativeBase + param] || 0;
                    break;
                default:
                    throw Error(`Unrecognised mode ${mode}`);
            }

            if (val === undefined) {
                throw Error(`Failed to evaluate param ${param} with mode ${mode}`);
            }

            return val;
        }
    }

    getValue(addr) {
        const val = this.program[addr];
        if (val === undefined) return 0;
        return val;
    }

    instructions = {
        // addition
        [OPCODE_ADD]: {
            params: 3,
            execute: (modes, params) => {
                const vals = params.slice(0, 2).map(this.paramConverter(modes));
                const [a, b] = vals;
                let c = params[2];
                if (modes[2] === 2) c += this.relativeBase;

                this.program[c] = a + b;
            }
        },
        // multiplication
        [OPCODE_MUL]: {
            params: 3,
            execute: (modes, params) => {
                const vals = params.slice(0, 2).map(this.paramConverter(modes));
                const [a, b] = vals;
                let c = params[2];
                if (modes[2] === 2) c += this.relativeBase;

                this.program[c] = a * b;
            }
        },
        // input
        [OPCODE_INPUT]: {
            params: 1,
            execute: (modes, params) => {
                //const [addr] = params;
                //const [addr] = params.map(this.paramConverter(modes));
                let addr = params[0];
                if (modes[0] === 2) {
                    addr = this.relativeBase + addr;
                }

                this.program[addr] = this.input.shift();
            }
        },
        // output
        [OPCODE_OUTPUT]: {
            params: 1,
            execute: (modes, params) => {
                const [val] = params.map(this.paramConverter(modes));
                //const val = this.getValue(addr);
                this.output.push(val);
            }
        },
        // jump-if-true
        [OPCODE_JUMP_IF_TRUE]: {
            params: 2,
            execute: (modes, params) => {
                const [test, instPtr] = params.map(this.paramConverter(modes));

                if (test) {
                    return instPtr;
                }
            }
        },
        // jump-if-false
        [OPCODE_JUMP_IF_FALSE]: {
            params: 2,
            execute: (modes, params) => {
                const [test, instPtr] = params.map(this.paramConverter(modes));

                if (test === 0) {
                    return instPtr;
                }
            }
        },
        // less than
        [OPCODE_LESS_THAN]: {
            params: 3,
            execute: (modes, params) => {
                const [a, b] = params.map(this.paramConverter(modes));
                let addr = params[2];
                if (modes[2] === 2) addr = this.relativeBase + addr;
                this.program[addr] = a < b ? 1 : 0;
            }
        },
        // equals
        [OPCODE_EQUALS]: {
            params: 3,
            execute: (modes, params) => {
                const [a, b] = params.map(this.paramConverter(modes));
                let addr = params[2];
                if (modes[2] === 2) addr = this.relativeBase + addr;
                this.program[addr] = a === b ? 1 : 0;
            }
        },
        // Adjust relative base
        [OPCODE_ADJUST_RELATIVE_BASE]: {
            params: 1,
            execute: (modes, params) => {
                const [val] = params.map(this.paramConverter(modes));
                this.relativeBase += val;
            }
        }
    };
}

module.exports = {
    Machine,
    opCodes: {
        OPCODE_HALT,
        OPCODE_ADD,
        OPCODE_MUL,
        OPCODE_INPUT,
        OPCODE_OUTPUT,
        OPCODE_JUMP_IF_TRUE,
        OPCODE_JUMP_IF_FALSE,
        OPCODE_LESS_THAN,
        OPCODE_EQUALS,
        OPCODE_ADJUST_RELATIVE_BASE
    }
};