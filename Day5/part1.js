const fs = require('fs');

const content = fs.readFileSync('input.txt', 'utf-8');
let program = content.split(',').map(i => +i);

let input = [1];
let output = [];

const instructions = {
    1: {
        params: 3,
        execute: (p, modes, params) => {
            const vals = params.slice(0, 2).map((param, i) => modes[i] ? param : p[param]);
            const [a, b] = vals;
            const c = params[2];
            
            p[c] = a + b;
        }
    },
    2: {
        params: 3,
        execute: (p, modes, params) => {
            const vals = params.slice(0, 2).map((param, i) => modes[i] ? param : p[param]);
            const [a, b] = vals;
            const c = params[2];

            p[c] = a * b;
        }
    },
    3: {
        params: 1,
        execute: (p, modes, params) => {
            const [addr] = params;
            p[addr] = input[0];
            input = input.slice(1);
        }
    },
    4: {
        params: 1,
        execute: (p, modes, params) => {
            const [addr] = params;
            const val = p[addr];
            output.push(val);
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
        instruction.execute(program, modes, params);

        instPtr += instruction.params + 1;
    }
}

runProgram();

console.log(output.pop());
