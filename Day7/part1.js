const fs = require('fs');

const content = fs.readFileSync('input.txt', 'utf-8');
let originalProgram = content.split(',').map(i => +i);

// originalProgram = [3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0];

function paramConverter(p, modes) {
    return (param, i) => modes[i] ? param : p[param];
}

const instructions = (p, input, output) => ({
    // addition
    1: {
        params: 3,
        execute: (modes, params) => {
            const vals = params.slice(0, 2).map(paramConverter(p, modes));
            const [a, b] = vals;
            const c = params[2];
            
            p[c] = a + b;
        }
    },
    // multiplication
    2: {
        params: 3,
        execute: (modes, params) => {
            const vals = params.slice(0, 2).map(paramConverter(p, modes));
            const [a, b] = vals;
            const c = params[2];

            p[c] = a * b;
        }
    },
    // input
    3: {
        params: 1,
        execute: (_, params) => {
            const [addr] = params;
            p[addr] = input.pop();
        }
    },
    // output
    4: {
        params: 1,
        execute: (_, params) => {
            const [addr] = params;
            const val = p[addr];
            output.push(val);
        }
    },
    // jump-if-true
    5: {
        params: 2,
        execute: (modes, params) => {
            const [test, instPtr] = params.map(paramConverter(p, modes));

            if (test) {
                return instPtr;
            }
        }
    },
    // jump-if-false
    6: {
        params: 2,
        execute: (modes, params) => {
            const [test, instPtr] = params.map(paramConverter(p, modes));

            if (test === 0) {
                return instPtr;
            }
        }
    },
    // less than
    7: {
        params: 3,
        execute: (modes, params) => {
            const [a, b] = params.map(paramConverter(p, modes));
            const addr = params[2];
            p[addr] = a < b ? 1 : 0;
        }
    },
    // equals
    8: {
        params: 3,
        execute: (modes, params) => {
            const [a, b] = params.map(paramConverter(p, modes));
            const addr = params[2];
            p[addr] = a === b ? 1 : 0;
        }
    }
});

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

function runProgram(program, input) {
    let instPtr = 0;
    const output = [];
    const executor = instructions(program, input, output);

    while(instPtr < program.length) {
        const {opCode, modes} = parseInstruction(program[instPtr]);

        if (opCode == 99) break;

        const instruction = executor[opCode];
        const params = program.slice(instPtr + 1, instPtr + 1 + instruction.params);
        const newPtr = instruction.execute(modes, params);

        if (newPtr === undefined) {
            instPtr += instruction.params + 1;
        } else {
            instPtr = newPtr;
        }
    }

    return output.pop();
}

function executeSequence(sequence) {
    let nextInput = 0;
    
    for(let i=0; i<sequence.length; i++) {
        nextInput = runProgram([...originalProgram], [nextInput,sequence[i]]);
    }

    return nextInput;
}

var permArr = [],
  usedChars = [];

function permute(input) {
  var i, ch;
  for (i = 0; i < input.length; i++) {
    ch = input.splice(i, 1)[0];
    usedChars.push(ch);
    if (input.length == 0) {
      permArr.push(usedChars.slice());
    }
    permute(input);
    input.splice(i, 0, ch);
    usedChars.pop();
  }
  return permArr
};

const sequences = permute([0,1,2,3,4]);
let best = undefined;
let bestScore = 0;

for (let i=0; i<sequences.length; i++) {
    const output = executeSequence(sequences[i]);
    if (output > bestScore) {
        best = sequences[i];
        bestScore = output;
    }
}

console.log(best.join(''));
console.log(bestScore);