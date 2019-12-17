const fs = require('fs');

let content = fs.readFileSync('input.txt', 'utf-8');
let program = content.trim().split(',').map(Number);

const Machine = require('../intcode');

program[0] = 2;
const machine = new Machine([...program]);

const toCharCodes = f => f.split('').map(s => s.charCodeAt(0));

// Functions derived manually (good old grid paper)
const mainFunction = 'A,B,B,C,C,A,B,B,C,A';
const a = 'R,4,R,12,R,10,L,12';
const b = 'L,12,R,4,R,12';
const c = 'L,12,L,8,R,10';
const videoFeed = 'n';

// Check we haven't exceeded the max function length
const parts = [mainFunction, a, b, c, videoFeed];
if (parts.some(p => p.length > 20)) {
    console.log('Too long');
    process.exit(1);
}

// Queue up the functions into the machine's input
const full = [mainFunction, a, b, c, videoFeed].join('\n') + '\n';
machine.queueInputArr(toCharCodes(full));

let line = '';

while (true) {
    const interrupt = machine.runToInterrupt();
    
    if (interrupt === 'halt') break;
    if (interrupt === 'output') {
        const char = machine.dequeueOutput();
        if (char > 200) {
            console.log(`Dust: ${char}`);
            break;
        } else if (char === 10) {
            console.log(line);
            line = '';
        } else {
            line += String.fromCharCode(char);
        }
    } else {
        throw new Error(`Unexpected interrupt ${interrupt}`);
    }
}

