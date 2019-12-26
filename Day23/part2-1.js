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

let NAT;
let useNat = 0;
let lastNatY;

//let inputQueues = machines.map(_ => []);

function handleOutput(machine) {
    const [address, x, y] = getOutputs(machine);
    if (address === 255) {
        NAT = [x, y];
    } else {
        //if (!inputQueues[address]) throw new Error(`No input queue for address ${address}`);

        machine[address].queueInput(x);
        machine[address].queueInput(y);

        //inputQueues[address].push(x);
        //inputQueues[address].push(y);
    }
}

mainLoop:
while(true) {
    let machinesBlocked = 0;

    machineLoop:
    for(let i=0; i<machines.length; i++) {
        const machine = machines[i];
        let blocked = true;

        inputLoop:
        while (true) {
            let result;

            executeLoop:
            while(true) {
                result = machine.tryExecuteNext();
                if (result.opCode === opCodes.OPCODE_OUTPUT) {
                    handleOutput(machine);
                } else if (result.opCode === opCodes.OPCODE_INPUT && result.didExecute)
                    blocked = false;

                else if (result.opCode === opCodes.OPCODE_INPUT)
                    break executeLoop;
            }

            if (result === "input") {
                if (i === 0 && useNat) {
                    console.log(`Using NAT ${NAT}`);

                    if (NAT[1] === lastNatY) {
                        console.log(`NAT y repeated - ${NAT[1]}`);
                        break mainLoop;
                    }

                    machine.queueInput(NAT[0]);
                    machine.queueInput(NAT[1]);
                    useNat = false;
                    lastNatY = NAT[1];
                } else {
                    machinesBlocked++;
                }

                break inputLoop;

            } else if (result === 'output') {
                handleOutput(machine);
            } else {
                throw new Error(`Unexpected interrupt ${result}`);
            }
        }
    }

    if (machinesBlocked === machines.length) {
        if (!NAT) {
            console.log(`All machines waiting, but no NAT set yet`);
        } else {
            console.log(`All machines waiting - allow use of NAT`);
            useNat = true;
        }
    }
}

// 16264 is too high