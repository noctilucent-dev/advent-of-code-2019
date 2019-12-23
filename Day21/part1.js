const fs = require('fs');
const { Machine } = require('../intcode');

const toCharCodes = f => f.split('').map(s => s.charCodeAt(0));

let content = fs.readFileSync('input.txt', 'utf-8');
let program = content.trim().split(',').map(Number);

let script = `
NOT A J
NOT B T
OR T J
NOT C T
OR T J
AND D J
WALK
`;

let input = toCharCodes(script.trimLeft());
let machine = new Machine([...program], input);
let line = '';

while(true) {
    const interrupt = machine.runToInterrupt();
    
    if (interrupt === 'halt') break;
    if (interrupt === 'output') {
        const char = machine.dequeueOutput();
        if (char > 200) {
            console.log(`Damage: ${char}`);
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