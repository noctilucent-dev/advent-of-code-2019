const fs = require('fs');
const {
    Machine,
    opCodes
} = require('../intcode');

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

let waiting = machines.map(_ => 0);

let NAT;
let natUsed = false;

mainLoop:
while(true) {
    let machinesNotBlockedCount = 0;

    machineLoop:
    for(let i=0; i<machines.length; i++) {
        const machine = machines[i];
        if (waiting[i] > 0 && machine.input.length === 0) continue machineLoop;

        const result = machine.tryExecuteNext();

        if (result.opCode === opCodes.OPCODE_INPUT) {
            if (result.didExecute && result.input > -1) {
                waiting[i] = 0;
            } else {
                // console.log(`Machine ${i} waiting for input`);
                machine.queueInput(-1);
                waiting[i]++;

                // if (!waiting.some(v => !v) && NAT) {
                //     console.log(`All machines waiting - add ${NAT} to machine 0 input`);
                //     machines[0].queueInputArr(NAT);

                //     if (NAT[0] === lastNATUsed[0] && NAT[1] === lastNATUsed[1]) {
                //         console.log(`First repeated NAT: x = ${NAT[0]}, y = ${NAT[1]}`);
                //         break mainLoop;
                //     }

                //     lastNATUsed = NAT;
                // }
            }
        } else if (result.opCode === opCodes.OPCODE_OUTPUT) {
            waiting[i] = 0;

            const [address, x, y] = getOutputs(machines[i]);

            if (address === 255) {
                console.log(`Adding ${[x, y]} to NAT`);
                if (natUsed && NAT[0] === x && NAT[1] === y) {
                    console.log(`NAT reused - ${NAT}`);
                    break mainLoop;
                }
                NAT = [x, y];
            } else {
                if (address === 0) {
                    natUsed = false;
                }
                machines[address].queueInput(x);
                machines[address].queueInput(y);
            }
        }
    }

    if (!waiting.some(v => v < 1)) {
        if (!NAT) {
            console.log(`All machines waiting, but no NAT set yet`);
        } else {
            console.log(`All machines waiting - add ${NAT} to machine 0 input`);
            machines[0].queueInputArr(NAT);
            natUsed = true;
        }
    }
}