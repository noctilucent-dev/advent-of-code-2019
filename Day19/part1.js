const fs = require('fs');

let content = fs.readFileSync('input.txt', 'utf-8');
let program = content.trim().split(',').map(Number);

const Machine = require('../intcode');

const machine = new Machine([...program]);

const MAX_X = 49;
const MAX_Y = 49;

function findBeamStart(x, y) {
    while(x <= MAX_X) {
        const machine = new Machine([...program]);

        // Input phase
        let interrupt = machine.runToInterrupt();
        if (interrupt !== 'input') throw new Error(`Unexpect interrupt during input phase: ${interrupt}`);

        machine.queueInput(x);
        machine.queueInput(y);

        // Output phase
        interrupt = machine.runToInterrupt();
        if (interrupt !== 'output') throw new Error(`Unexpect interrupt during output phase: ${interrupt}`);

        const output = machine.dequeueOutput();
        if (output === 1) {
            return x;
        }
        x++;
    }
    return -1;
}

function findBeamEnd(x, y) {
    while(x <= MAX_X) {
        const machine = new Machine([...program]);

        // Input phase
        let interrupt = machine.runToInterrupt();
        if (interrupt !== 'input') throw new Error(`Unexpect interrupt during input phase: ${interrupt}`);

        machine.queueInput(x);
        machine.queueInput(y);

        // Output phase
        interrupt = machine.runToInterrupt();
        if (interrupt !== 'output') throw new Error(`Unexpect interrupt during output phase: ${interrupt}`);

        const output = machine.dequeueOutput();
        if (output === 0) {
            return x;
        }
        x++;
    }
    return MAX_X;
}

function isTractor(x, y) {
    const machine = new Machine([...program]);

    // Input phase
    let interrupt = machine.runToInterrupt();
    if (interrupt !== 'input') throw new Error(`Unexpect interrupt during input phase: ${interrupt}`);

    machine.queueInput(x);
    machine.queueInput(y);

    // Output phase
    interrupt = machine.runToInterrupt();
    if (interrupt !== 'output') throw new Error(`Unexpect interrupt during output phase: ${interrupt}`);

    const output = machine.dequeueOutput();
    return output === 1;
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
        map[y][x] = isTractor(x, y) ? '#' : '.';
    }
}

drawMap(map);

const beamCount = map.flat().filter(c => c === '#').length;
console.log(beamCount);