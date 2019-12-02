const fs = require('fs');

const content = fs.readFileSync('input.txt', 'utf-8');
const originalProgram = content.split(',').map(i => +i);

const targetOutput = 19690720;

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

function runProgram(noun, verb) {
    const program = [...originalProgram];

    let instPtr = 0;

    program[1] = noun;
    program[2] = verb;

    while(instPtr < program.length) {
        const opCode = program[instPtr];

        if (opCode == 99) break;

        const instruction = instructions[opCode];
        const params = program.slice(instPtr + 1, instPtr + 1 + instruction.params);
        instruction.execute(program, ...params);

        instPtr += instruction.params + 1;
    }

    return program[0];
}

let found = false;

const MAX_VAL = 100;

for (let noun=0; noun<MAX_VAL && !found; noun++) {
    for (let verb=0; verb<MAX_VAL && !found; verb++) {
        const result = runProgram(noun, verb);
        if (result === targetOutput) {
            console.log(`Found result: noun=${noun}, verb=${verb}`);
            console.log(`Answer=${100 * noun + verb}`);
            found = true;
        }
    }
}

if (!found) console.log('No solution found');
