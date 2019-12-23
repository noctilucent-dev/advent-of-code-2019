const fs = require('fs');

let content = fs.readFileSync('input.txt', 'utf-8');
let program = content.trim().split(',').map(Number);

const { Machine } = require('../intcode');

// Checks whether the given coordinates contain a beam
// Returns 1 (true) or 0 (false)
function isBeam(x, y) {
    const machine = new Machine([...program], [x,y]);
    
    interrupt = machine.runToInterrupt();

    if (interrupt !== 'output')
        throw new Error(`Unexpect interrupt during output phase: ${interrupt}`);

    return machine.dequeueOutput();
}

// Scans the row y for the first position with a beam, starting at x
function findBeam(x, y, maxX) {
    for(; x<=maxX; x++) {
        if (isBeam(x, y)) return x;
    }
}

let x = 500; // 'safe' starting points given the minimum x -> width relationship
let y = 700; // as above

const targetWidth = 100;
const targetHeight = 100;

// Find the first row where the width is at least 100
while (true) {
    x = findBeam(x, y, y*y);
    if (isBeam(x+targetWidth-1,y)) break;
    y++;
}

console.log(`First row with 100: ${x},${y}`);

let coords;

// Find the first location that is the top-left of a 100x100 area within the beam
boxLoop:
while (true) {
    // Look for an x-coordinate along the current line with 100 beams below it
    xLoop:
    for(let i=0; i<=x; i++) {
        if (!isBeam(x+i+targetWidth-1, y)) break xLoop;     // run out of width on this line
        if (!isBeam(x+i, y+targetHeight-1)) continue xLoop; // run out of depth on this column

        console.log(`Found ${targetWidth}x${targetHeight} at ${x+i}, ${y} (x offset: ${i})`);
        coords = [x+i,y];
        break boxLoop;
    }
 
    // Move to next line, and scan for the start of the beam
    y++;
    x = findBeam(x-2, y, x*x);
}

const answer = (coords[0]*10000)+coords[1];
console.log(`Answer: ${answer}`);
