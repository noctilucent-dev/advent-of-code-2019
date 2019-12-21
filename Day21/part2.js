const fs = require('fs');
const Machine = require('../intcode');

const toCharCodes = f => f.split('').map(s => s.charCodeAt(0));

let content = fs.readFileSync('input.txt', 'utf-8');
let program = content.trim().split(',').map(Number);

// Builds the following logic:
// J = D && (H || (E && I) || (E && F)) # First jump is 'safe' as far as we can tell
//       && !(A && B && C)              # Avoid 'unecessary' jumps
let script = `
# (E && I)
OR E J
AND I J

# || (E && F)
OR E T
AND F T
OR T J

# || H
OR H J

# && D
AND D J

# && !(A && B && C)
NOT A T
NOT T T
AND B T
AND C T
NOT T T
AND T J

RUN
`;

const formatted = script.trim().split('\n').filter(l => l.length > 0 && l[0] !== '#').join('\n') + '\n'
let input = toCharCodes(formatted);
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