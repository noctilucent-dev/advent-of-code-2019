const fs = require('fs');

const content = fs.readFileSync('input.txt', 'utf-8');
let originalProgram = content.split(',').map(i => +i);

// outputs itself
//originalProgram = [109, 1, 204, -1, 1001, 100, 1, 100, 1008, 100, 16, 101, 1006, 101, 0, 99];

// outputs 16-digit number
//originalProgram = [1102,34915192,34915192,7,4,7,99,0];

// outputs large number
//originalProgram = [104,1125899906842624,99];

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

const OBJECT_CHARS = [
    ' ',
    '#',
    'B',
    '=',
    '*'
];

class Machine {
    constructor(program, screen) {
        this.program = [...program];
        this.input = [];
        this.output = [];
        this.instPtr = 0;
        this.relativeBase = 0;
        this.screen = screen;
        this.screenMax = [-1,-1];
    }

    queueInput(val) {
        this.input.unshift(val);
    }

    dequeueOutput() {
        return this.output[this.output.length - 1];
    }

    executeNext() {
        const { opCode, modes } = parseInstruction(this.program[this.instPtr]);

        switch (opCode) {
            case 99:
                return 'halt';

            case 3:
                // abort if our input queue is empty
                if (this.input.length === 0) return 'input';
        }

        const instruction = this.instructions[opCode];
        if (!instruction) {
            throw Error(`Instruction ${opCode} not recognised`);
        }

        const params = this.program.slice(this.instPtr + 1, this.instPtr + 1 + instruction.params);
        const newPtr = instruction.execute(modes, params);

        if (newPtr === undefined) {
            this.instPtr += instruction.params + 1;
        } else {
            this.instPtr = newPtr;
        }
    }

    runToEnd() {
        let loopCount = 0;
        while(loopCount < Infinity) {
            const result = this.executeNext();
            switch (result) {
                case 'halt':
                    return;
                case 'input':
                    throw Error(`Program halted due to lack of input`);
            }
            loopCount++;
        }

        throw Error(`Infinite loop detected`);
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
                    val = this.program[this.relativeBase + param];
                    break;
                default:
                    throw Error(`Unrecognised mode ${mode}`);
            }

            if (val === undefined) {
                throw Error(`Failed to evaluate param`);
            }

            return val;
        }
    }

    getValue(addr) {
        const val = this.program[addr];
        if (val === undefined) return 0;
        return val;
    }

    updateScreen() {
        if (this.output.length < 3) return;
        const [x, y, obj] = this.output.slice(0,3);

        if (!this.screen[y]) this.screen[y] = [];
        this.screen[y][x] = obj;

        if (x > this.screenMax[0]) this.screenMax[0] = x;
        if (y > this.screenMax[1]) this.screenMax[1] = y;

        this.output = this.output.slice(3);
    }

    draw() {
        for(let row=0; row<=this.screenMax[1]; row++) {
            let line = '';
            for (let col=0; col<=this.screenMax[0]; col++) {
                const index = !this.screen[row] || !this.screen[row][col] ? 0 : this.screen[row][col];
                line += OBJECT_CHARS[index];
            }
            console.log(line);
        }
    }

    instructions = {
        // addition
        1: {
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
        2: {
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
        3: {
            params: 1,
            execute: (modes, params) => {
                //const [addr] = params;
                //const [addr] = params.map(this.paramConverter(modes));
                let addr = params[0];
                if (modes[0] === 2) {
                    addr = this.relativeBase + addr;
                }

                this.program[addr] = this.input.pop();
            }
        },
        // output
        4: {
            params: 1,
            execute: (modes, params) => {
                const [val] = params.map(this.paramConverter(modes));
                //const val = this.getValue(addr);
                this.output.push(val);
                this.updateScreen();
            }
        },
        // jump-if-true
        5: {
            params: 2,
            execute: (modes, params) => {
                const [test, instPtr] = params.map(this.paramConverter(modes));

                if (test) {
                    return instPtr;
                }
            }
        },
        // jump-if-false
        6: {
            params: 2,
            execute: (modes, params) => {
                const [test, instPtr] = params.map(this.paramConverter(modes));

                if (test === 0) {
                    return instPtr;
                }
            }
        },
        // less than
        7: {
            params: 3,
            execute: (modes, params) => {
                const [a, b] = params.map(this.paramConverter(modes));
                let addr = params[2];
                if (modes[2] === 2) addr = this.relativeBase + addr;
                this.program[addr] = a < b ? 1 : 0;
            }
        },
        // equals
        8: {
            params: 3,
            execute: (modes, params) => {
                const [a, b] = params.map(this.paramConverter(modes));
                let addr = params[2];
                if (modes[2] === 2) addr = this.relativeBase + addr;
                this.program[addr] = a === b ? 1 : 0;
            }
        },
        // Adjust relative base
        9: {
            params: 1,
            execute: (modes, params) => {
                const [val] = params.map(this.paramConverter(modes));
                this.relativeBase += val;
            }
        }
    };
}

const screen = [];

const machine = new Machine([...originalProgram], screen);

try {
    machine.runToEnd();
    machine.draw();
    const blockCount = screen.flat().filter(c => c === 2).length;
    console.log(`Blocks: ${blockCount}`);
} catch (err) {
    console.log(err);
    console.log(machine);
}