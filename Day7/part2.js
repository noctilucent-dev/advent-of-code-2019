const fs = require('fs');

const content = fs.readFileSync('input.txt', 'utf-8');
let originalProgram = content.split(',').map(i => +i);

// originalProgram = [3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,
//     27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5];

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

class Machine {
    constructor(program, firstInput) {
        this.program = [...program];
        this.input = [firstInput];
        this.output = [];
        this.instPtr = 0;
        this.executor = instructions(this.program, this.input, this.output);
    }

    queueInput(val) {
        this.input.unshift(val);
    }

    dequeueOutput() {
        return this.output[this.output.length-1];
    }

    executeNext() {
        const {opCode, modes} = parseInstruction(this.program[this.instPtr]);

        switch(opCode) {
            case 99:
                return 'halt';

            case 3:
                // abort if our input queue is empty
                if (this.input.length === 0) return 'input';
        }

        const instruction = this.executor[opCode];
        const params = this.program.slice(this.instPtr + 1, this.instPtr + 1 + instruction.params);
        const newPtr = instruction.execute(modes, params);

        if (newPtr === undefined) {
            this.instPtr += instruction.params + 1;
        } else {
            this.instPtr = newPtr;
        }

        // Flag if we've output something
        if(opCode === 4) {
            return 'output';
        }
    }
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

function runSequence(sequence) {
    const amplifiers = sequence.map(s => new Machine(originalProgram, s));
    amplifiers[0].queueInput(0);

    let activeAmplifierIndex = 0
    const nextIndex = (index) => (index + 1) % sequence.length;
    let haltCount = 0;

    // Iterate through the amplifiers, looping back round
    amplifierLoop:
    while(true) {
        let activeAmplifier = amplifiers[activeAmplifierIndex];
        
        // Execute instructions on the ative amplifier until:
        // - machine halts
        // - machine produces output
        // - machine requires input (and hasn't received any)
        instructionLoop:
        while(true) {
            const result = activeAmplifier.executeNext();

            switch (result) {
                case 'halt':
                    haltCount++;
                    break instructionLoop;
                
                case 'output':
                    // pipe the output into the next machine's input
                    const val = activeAmplifier.dequeueOutput();
                    const nextAmp = amplifiers[nextIndex(activeAmplifierIndex)];
                    nextAmp.queueInput(val);
                    
                    break instructionLoop;

                case 'input':
                    break instructionLoop;
            }
        }

        if (haltCount >= amplifiers.length) break amplifierLoop;

        activeAmplifierIndex = nextIndex(activeAmplifierIndex);
    }

    const lastOutput = amplifiers[amplifiers.length-1].dequeueOutput();
    return lastOutput;
}

const sequences = permute([5, 6, 7, 8, 9]);
const outputs = sequences.map(runSequence);
const largest = Math.max(...outputs);

console.log(largest);