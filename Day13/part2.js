const fs = require('fs');

const content = fs.readFileSync('input.txt', 'utf-8');
let originalProgram = content.split(',').map(i => +i);

var stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

let lastKey;

stdin.on('data', key => {
    lastKey = key;

    if (key == '\u0003') { // ctrl-c
        process.exit();
    }
});

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function getDirectionFromUser() {
    const promise = new Promise(resolve => {
        setTimeout(() => {
            if (lastKey == '\u001B\u005B\u0043') { // right arrow
                resolve(1);
                lastKey = '';
            } else if (lastKey == '\u001B\u005B\u0044') { // left arrow
                resolve(-1);
                lastKey = '';
            } else if (lastKey == '\u0003') { // ctrl-c
                process.exit();
            } else {
                resolve(0);
            }
        }, 500);
    });
    return promise;
}

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
    constructor(program, screen, playable) {
        this.program = [...program];
        this.input = [];
        this.output = [];
        this.instPtr = 0;
        this.relativeBase = 0;
        this.screen = screen;
        this.screenMax = [-1,-1];
        this.score = 0;
        this.batPos;
        this.ballPos;
        this.playable = playable;
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

    getDirection() {
        const d = this.ballPos[0] - this.batPos[0];
        if (d > 0) return 1;
        if (d < 0) return -1;
        return 0;
    }

    async runToEnd() {
        let loopCount = 0;
        while(true) {
            const result = this.executeNext();

            switch (result) {
                case 'halt':
                    return;

                case 'input':
                    let direction;
                    if (this.playable) {
                        this.draw();
                        direction = await getDirectionFromUser();
                    } else {
                        direction = this.getDirection();
                    }
                    this.input.push(direction);
                    continue;
            }
        }
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
        if (x === -1 && y === 0) {
            this.score = obj;
        } else {
            this.screen[y][x] = obj;
        }

        if (obj === 3) {
            this.batPos = [x,y];
        }
        if (obj === 4) {
            this.ballPos = [x, y];
        }

        if (x > this.screenMax[0]) this.screenMax[0] = x;
        if (y > this.screenMax[1]) this.screenMax[1] = y;

        this.output = this.output.slice(3);
    }

    draw() {
        // clear the screen   
        process.stdout.write('\x1b[2J');
        process.stdout.write('\x1b[0f');

        rl.write(`${this.score}`);
        rl.write('\n');

        for(let row=0; row<=this.screenMax[1]; row++) {
            let line = '';
            for (let col=0; col<=this.screenMax[0]; col++) {
                const index = !this.screen[row] || !this.screen[row][col] ? 0 : this.screen[row][col];
                line += OBJECT_CHARS[index];
            }

            rl.write(line);
            rl.write('\n');
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

let program = [...originalProgram];
program[0] = 2;

const playable = process.argv.length > 2;

const machine = new Machine(program, screen, playable);

try {
    machine.runToEnd()
        .then(() => {
            machine.draw();
            process.exit(0);
        });
} catch (err) {
    console.log(err);
    console.log(machine);
}