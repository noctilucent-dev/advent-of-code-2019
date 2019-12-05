const fs = require('fs');

const content = fs.readFileSync('input.txt', 'utf-8');
let program = content.split(',').map(i => +i);

// Tests
/*
program = [1002,4,3,4,33];
program = [1001,4,66,4,33];

program = [3,225,4,225,99];

// Compare tests
program = [3,9,8,9,10,9,4,9,99,-1,8]; // == 8 => 1, != 8 => 0 (position)
program = [3,9,7,9,10,9,4,9,99,-1,8]; // < 8 => 1, <> 8 => 0 (position)
program = [3,3,1108,-1,8,3,4,3,99]; // == 8 => 1, != 8 => 0 (immediate)
program = [3,3,1107,-1,8,3,4,3,99]; // < 8 => 1, <> 8 => 0 (immedaite)

// Jump tests: 0 => 0, !0 => 1
program = [3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9]; // position mode
program = [3,3,1105,-1,9,1101,0,0,12,4,12,99,1];      // immediate mode

// 0 => 0, !0 => 1
program = [3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,
    1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,
    999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99];
*/

let input = [5];
let output = [];

function paramConverter(p, modes) {
    return (param, i) => modes[i] ? param : p[param];
}

const instructions = {
    // addition
    1: {
        params: 3,
        execute: (p, modes, params) => {
            const vals = params.slice(0, 2).map(paramConverter(p, modes));
            const [a, b] = vals;
            const c = params[2];
            
            p[c] = a + b;
        }
    },
    // multiplication
    2: {
        params: 3,
        execute: (p, modes, params) => {
            const vals = params.slice(0, 2).map(paramConverter(p, modes));
            const [a, b] = vals;
            const c = params[2];

            p[c] = a * b;
        }
    },
    // input
    3: {
        params: 1,
        execute: (p, _, params) => {
            const [addr] = params;
            p[addr] = input[0];
            input = input.slice(1);
        }
    },
    // output
    4: {
        params: 1,
        execute: (p, _, params) => {
            const [addr] = params;
            const val = p[addr];
            output.push(val);
        }
    },
    // jump-if-true
    5: {
        params: 2,
        execute: (p, modes, params) => {
            const [test, instPtr] = params.map(paramConverter(p, modes));

            if (test) {
                return instPtr;
            }
        }
    },
    // jump-if-false
    6: {
        params: 2,
        execute: (p, modes, params) => {
            const [test, instPtr] = params.map(paramConverter(p, modes));

            if (test === 0) {
                return instPtr;
            }
        }
    },
    // less than
    7: {
        params: 3,
        execute: (p, modes, params) => {
            const [a, b] = params.map(paramConverter(p, modes));
            const addr = params[2];
            p[addr] = a < b ? 1 : 0;
        }
    },
    // equals
    8: {
        params: 3,
        execute: (p, modes, params) => {
            const [a, b] = params.map(paramConverter(p, modes));
            const addr = params[2];
            p[addr] = a === b ? 1 : 0;
        }
    }
};

function parseInstruction(inst) {
    const opCode = inst % 100;
    inst = ~~(inst / 100);
    const modes = [];
    for (let i=0; i<3; i++) {
        modes.push(inst % 10);
        inst = ~~(inst / 10); 
    }
    return {
        opCode,
        modes
    };
}

function runProgram() {
    let instPtr = 0;

    while(instPtr < program.length) {
        const {opCode, modes} = parseInstruction(program[instPtr]);

        if (opCode == 99) break;

        const instruction = instructions[opCode];
        const params = program.slice(instPtr + 1, instPtr + 1 + instruction.params);
        const newPtr = instruction.execute(program, modes, params);

        if (newPtr === undefined) {
            instPtr += instruction.params + 1;
        } else {
            instPtr = newPtr;
        }
    }
}

runProgram();

console.log(output);
