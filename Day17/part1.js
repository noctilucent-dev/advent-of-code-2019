const fs = require('fs');

let content = fs.readFileSync('input.txt', 'utf-8');
let program = content.trim().split(',').map(Number);

const Machine = require('../intcode');

const map = [];
const machine = new Machine([...program]);
let row = 0;

// Get map
while (true) {
    const interrupt = machine.runToInterrupt();
    if (interrupt === 'halt') break;
    if (interrupt === 'output') {
        const char = machine.dequeueOutput();
        // console.log(char);
        switch(char) {
            case 10:
                row++;
                break;
            default:
                if (!map[row]) map[row] = [];
                map[row].push(String.fromCharCode(char));
                break;
        }
    } else {
        throw new Error(`Unexpected interrupt ${interrupt}`);
    }
}

function countSurroundingScaffold(row, col) {
    let count = 0;
    if (row > 0 && map[row-1][col] === '#') count++;               // north
    if (row < map.length-1 && map[row+1][col] === '#') count++;    // south
    if (col > 0 && map[row][col-1] === '#') count++;               // west
    if (col < map[0].length-1 && map[row][col+1] === '#') count++; // east
    return count;
}

// Find intersections
let intersections = [];
for(let row=0; row<map.length; row++) {
    for(let col=0; col<map[0].length; col++) {
        const char = map[row][col];
        if (char !== '#') continue;
        if (countSurroundingScaffold(row, col) >= 3) {
            intersections.push([col,row]);
        }
    }
}

// Draw the map
map.forEach(r => console.log(r.join('')));

// Calculate 'alignments'
const sumOfAlignments = intersections.map(i => i[0] * i[1]).reduce((p, c) => p + c);
console.log(sumOfAlignments);