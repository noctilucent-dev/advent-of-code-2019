const fs = require('fs');

let content = fs.readFileSync('input.txt', 'utf-8');
let program = content.trim().split(',').map(Number);

const Machine = require('../intcode');

const MAX_X = 49;
const MAX_Y = 49;

function isBeam(x, y) {
    const machine = new Machine([...program], [x,y]);
    
    interrupt = machine.runToInterrupt();

    if (interrupt !== 'output')
        throw new Error(`Unexpect interrupt during output phase: ${interrupt}`);

    return machine.dequeueOutput();
}

function drawMap(beam) {
    for (let y=0; y<=MAX_Y; y++) {
        console.log(beam[y].join(''));
    }
}

const map = [];
let y = 0;

for (let y=0; y<=MAX_Y; y++) {
    map[y] = [];
    for(let x=0; x<=MAX_X; x++) {
        map[y][x] = isBeam(x, y) ? '#' : '.';
    }
}

//drawMap(map);

const beamCount = map.flat().filter(c => c === '#').length;
console.log(beamCount);