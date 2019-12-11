const fs = require('fs');

const content = fs.readFileSync('input.txt', 'utf-8');
let originalProgram = content.split(',').map(i => +i);

// originalProgram = [
//     4,1, // paint white
//     4,0, // turn left
//     4,1, // paint white
//     4,0, // turn left
//     4,0, // paint black
//     4,0, // turn left
//     4,1,4,0, 4,1,4,0,
//     4,0,4,1, 4,1,4,0, 4,1,4,0,
//     99
// ]; 

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

class Machine {
    constructor(program) {
        this.program = [...program];
        this.instPtr = 0;
        this.relativeBase = 0;
        this.pos = [0, 0];
        this.direction = 0;
        this.panels = [];
        this.moving = false;
        this.paintedCount = 0;
        this.min = [0,0];
        this.max = [0,0];
    }

    executeNext() {
        const { opCode, modes } = parseInstruction(this.program[this.instPtr]);

        if (opCode === 99) return 'halt';

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
        while (loopCount < 100000) {
            const result = this.executeNext();
            if (result === 'halt') return;
            loopCount++;
        }

        throw Error(`Infinite loop detected`);
    }

    paramConverter(modes) {
        return (param, i) => {
            const mode = modes[i];
            if (mode === undefined) throw Error(`No mode set for index ${i} - modes: ${modes}`);

            let val;

            switch (mode) {
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

    print() {
        for(let row = this.max[1]; row >= this.min[1]; row--) {
            let line = '';
            for (let col = this.min[0]; col <= this.max[0]; col++) {
                let c = '#';
                if (this.pos[0] === col && this.pos[1] === row) {
                    switch(this.direction) {
                        case 0:
                            c = '^';
                            break;
                        case 1:
                            c = '>';
                            break;
                        case 2:
                            c = 'v';
                            break;
                        case 3:
                            c = '<';
                            break;
                    }
                }
                else if (!this.panels[row] || !this.panels[row][col]) c = '.';

                line += c;
            }
            console.log(line);
        }
    }

    getValue(addr) {
        const val = this.program[addr];
        if (val === undefined) return 0;
        return val;
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
                const [x, y] = this.pos;

                let addr = params[0];
                if (modes[0] === 2) {
                    addr = this.relativeBase + addr;
                }

                const colour = this.panels[y] === undefined || this.panels[y][x] === undefined ? 0 : this.panels[y][x];

                this.program[addr] = colour;
            }
        },
        // output
        4: {
            params: 1,
            execute: (modes, params) => {
                const [val] = params.map(this.paramConverter(modes));

                if (this.moving) {
                    if (val) { // turn right
                        switch(this.direction) {
                            case 0: // up
                                this.direction = 1;
                                this.pos[0]++;
                                break;
                            case 1: // right
                                this.direction = 2;
                                this.pos[1]--;
                                break;
                            case 2: // down
                                this.direction = 3;
                                this.pos[0]--;
                                break;
                            case 3: // left
                                this.direction = 0;
                                this.pos[1]++;
                                break;
                        }
                    } else { // turn left
                        switch(this.direction) {
                            case 0: // up
                                this.direction = 3;
                                this.pos[0]--;
                                break;
                            case 1: // right
                                this.direction = 0;
                                this.pos[1]++;
                                break;
                            case 2: // down
                                this.direction = 1;
                                this.pos[0]++;
                                break;
                            case 3: // left
                                this.direction = 2;
                                this.pos[1]--;
                                break;
                        }
                    }

                    if (this.pos[0] < this.min[0]) this.min[0] = this.pos[0];
                    if (this.pos[0] > this.max[0]) this.max[0] = this.pos[0];
                    if (this.pos[1] < this.min[1]) this.min[1] = this.pos[1];
                    if (this.pos[1] > this.max[1]) this.max[1] = this.pos[1];

                    // this.print();
                    // console.log();
                } else {
                    //const val = this.getValue(addr);
                    const [x, y] = this.pos;
                    if (this.panels[y] === undefined) {
                        this.panels[y] = [];
                    }
                    if (this.panels[y][x] === undefined) {
                        this.paintedCount++;
                    }
                    this.panels[y][x] = val;
                }

                this.moving = !this.moving;
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

const machine = new Machine([...originalProgram]);

try {
    machine.runToEnd();
    machine.print();
} catch (err) {
    console.log(err);
    console.log(machine);
}
console.log(machine.paintedCount);

// not 4