const fs = require('fs');
const { Machine } = require('../intcode');

let program = fs.readFileSync('input.txt', 'utf8').split(',').map(Number);

let machines = [];
for (let i=0; i<50; i++) machines[i] = new Machine([...program], [i]);

function getOutputs(machine) {
    const address = machine.dequeueOutput();
    
    let result = machine.runToInterrupt();
    if (result !== 'output') throw new Error(`Unexpected interrupt '${result}' when expecting x value from output`);
    const x = machine.dequeueOutput();

    result = machine.runToInterrupt();
    if (result !== 'output') throw new Error(`Unexpected interrupt '${result}' when expecting y value from output`);
    const y = machine.dequeueOutput();

    return [address, x, y];
}

mainLoop:
while(true) {
    machineLoop:
    for(let i=0; i<machines.length; i++) {
        const result = machines[i].executeNext();
        if (!result) continue;
        if (result === 'input') {
            machines[i].queueInput(-1);
        } else if (result === 'output') {
            const [address, x, y] = getOutputs(machines[i]);

            if (address > 50) {
                console.log(`Value written to ${address}`);
                console.log(`x = ${x}, y = ${y}`);
                break mainLoop;
            }

            machines[address].queueInput(x);
            machines[address].queueInput(y);
        }
    }
}