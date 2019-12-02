const fs = require('fs');

const content = fs.readFileSync('input.txt', 'utf-8');
const program = content.split(',').map(i => +i);

let instPtr = 0;

program[1] = 12;
program[2] = 2;

const instructions = {
    1: {
        params: 3,
        execute: (p, a, b, c) => p[c] = p[a] + p[b]
    },
    2: {
        params: 3,
        execute: (p, a, b, c) => p[c] = p[a] * p[b]
    }
};

while(instPtr < program.length) {
    const opCode = program[instPtr];

    if (opCode == 99) break;

    const instruction = instructions[opCode];
    const params = program.slice(instPtr + 1, instPtr + 1 + instruction.params);
    instruction.execute(program, ...params);

    instPtr += instruction.params + 1;
}

console.log(program[0]);