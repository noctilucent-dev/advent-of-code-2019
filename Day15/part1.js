const fs = require('fs');

const content = fs.readFileSync('input.txt', 'utf-8');
let originalProgram = content.split(',').map(i => +i);

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// outputs itself
//originalProgram = [109, 1, 204, -1, 1001, 100, 1, 100, 1008, 100, 16, 101, 1006, 101, 0, 99];

// outputs 16-digit number
//originalProgram = [1102,34915192,34915192,7,4,7,99,0];

// outputs large number
//originalProgram = [104,1125899906842624,99];

function parseInstruction(inst) {
    const opCode = inst % 100;
    inst = ~~(inst / 100);
    const modes = [];
    for (let i = 0; i < 3; i++) {
        modes.push(inst % 10);
        inst = ~~(inst / 10);
    }
    return {
        opCode,
        modes
    };
}

class Machine {
    constructor(program, firstInput) {
        this.program = [...program];
        this.input = firstInput === undefined ? [] : [firstInput];
        this.output = [];
        this.instPtr = 0;
        this.relativeBase = 0;
    }

    queueInput(val) {
        this.input.unshift(val);
    }

    dequeueOutput() {
        return this.output.pop();
    }

    executeNext() {
        const { opCode, modes } = parseInstruction(this.program[this.instPtr]);

        switch (opCode) {
            case 99:
                return 'halt';

            case 3:
                // abort if our input queue is empty
                if (this.input.length === 0) return 'input';
        }

        const instruction = this.instructions[opCode];
        if (!instruction) {
            throw Error(`Instruction ${opCode} not recognised`);
        }

        const params = this.program.slice(this.instPtr + 1, this.instPtr + 1 + instruction.params);
        const newPtr = instruction.execute(modes, params);

        if (newPtr === undefined) {
            this.instPtr += instruction.params + 1;
        } else {
            this.instPtr = newPtr;
        }

        // Flag if we've output something
        if (opCode === 4) {
            return 'output';
        }
    }

    paramConverter(modes) {
        return (param, i) => {
            const mode = modes[i];
            if (mode === undefined) throw Error(`No mode set for index ${i} - modes: ${modes}`);

            let val;

            switch(mode) {
                case 0:
                    val = this.getValue(param);
                    break;
                case 1:
                    val = param;
                    break;
                case 2:
                    val = this.program[this.relativeBase + param];
                    break;
                default:
                    throw Error(`Unrecognised mode ${mode}`);
            }

            if (val === undefined) {
                throw Error(`Failed to evaluate param`);
            }

            return val;
        }
    }

    getValue(addr) {
        const val = this.program[addr];
        if (val === undefined) return 0;
        return val;
    }

    instructions = {
        // addition
        1: {
            params: 3,
            execute: (modes, params) => {
                const vals = params.slice(0, 2).map(this.paramConverter(modes));
                const [a, b] = vals;
                let c = params[2];
                if (modes[2] === 2) c += this.relativeBase;

                this.program[c] = a + b;
            }
        },
        // multiplication
        2: {
            params: 3,
            execute: (modes, params) => {
                const vals = params.slice(0, 2).map(this.paramConverter(modes));
                const [a, b] = vals;
                let c = params[2];
                if (modes[2] === 2) c += this.relativeBase;

                this.program[c] = a * b;
            }
        },
        // input
        3: {
            params: 1,
            execute: (modes, params) => {
                //const [addr] = params;
                //const [addr] = params.map(this.paramConverter(modes));
                let addr = params[0];
                if (modes[0] === 2) {
                    addr = this.relativeBase + addr;
                }

                this.program[addr] = this.input.pop();
            }
        },
        // output
        4: {
            params: 1,
            execute: (modes, params) => {
                const [val] = params.map(this.paramConverter(modes));
                //const val = this.getValue(addr);
                this.output.push(val);
            }
        },
        // jump-if-true
        5: {
            params: 2,
            execute: (modes, params) => {
                const [test, instPtr] = params.map(this.paramConverter(modes));

                if (test) {
                    return instPtr;
                }
            }
        },
        // jump-if-false
        6: {
            params: 2,
            execute: (modes, params) => {
                const [test, instPtr] = params.map(this.paramConverter(modes));

                if (test === 0) {
                    return instPtr;
                }
            }
        },
        // less than
        7: {
            params: 3,
            execute: (modes, params) => {
                const [a, b] = params.map(this.paramConverter(modes));
                let addr = params[2];
                if (modes[2] === 2) addr = this.relativeBase + addr;
                this.program[addr] = a < b ? 1 : 0;
            }
        },
        // equals
        8: {
            params: 3,
            execute: (modes, params) => {
                const [a, b] = params.map(this.paramConverter(modes));
                let addr = params[2];
                if (modes[2] === 2) addr = this.relativeBase + addr;
                this.program[addr] = a === b ? 1 : 0;
            }
        },
        // Adjust relative base
        9: {
            params: 1,
            execute: (modes, params) => {
                const [val] = params.map(this.paramConverter(modes));
                this.relativeBase += val;
            }
        }
    };
}

function getDirection() {
    return new Promise((resolve, reject) => {
        rl.question('Direction? ', answer => {
            switch(answer.toLocaleLowerCase()[0]) {
                case 'n':
                    resolve(1);
                    break;
                case 's':
                    resolve(2);
                    break;
                case 'w':
                    resolve(3);
                    break;
                case 'e':
                    resolve(4);
                    break;
                default:
                    resolve(-1);
                    break;
            }
        });
    })
}

function getCoords(position, direction) {
    const coords = [...position];

    switch(direction){
        case 1: // north
            coords[1]++;
            break;

        case 2: // south
            coords[1]--;
            break;
        
        case 3: // west
            coords[0]--;
            break;
        
        case 4: // east
            coords[0]++;
            break;
    }

    return coords;
}

function drawMap(map, min, max) {
    // clear the screen   
    process.stdout.write('\x1b[2J');
    process.stdout.write('\x1b[0f');

    for(let row=max[1]; row>=min[1]; row--) {
        let line = '';
        for(let col=min[0]; col<=max[0]; col++) {
            if (!map[row] || !map[row][col]) line += '    ';
            else if (map[row][col] === '#') line += '####';
            else {
                let num = map[row][col].toString();
                while (num.length < 4) num = ' ' + num;
                line += num;
            }
        }
        console.log(line);
    }
    console.log('');
}

const NORTH = 1;
const SOUTH = 2;
const WEST = 3;
const EAST = 4;

function getDirectionAuto(map, position, lastDirection) {
    const visitedButFree = [];
    let directions;
    switch(lastDirection) {
        case undefined:
        case NORTH:
            // assume wall was west
            directions = [WEST, NORTH, EAST, SOUTH];
            break;
        case EAST:
            directions = [NORTH, EAST, SOUTH, WEST];
            break;
        case SOUTH:
            directions = [EAST, SOUTH, WEST, NORTH];
            break;
        case WEST:
            directions = [SOUTH, WEST, NORTH, EAST];
            break;
    }
    //const lastDirectionIndex = directions.indexOf(lastDirection)

    for(let i=0; i<4; i++) {
        const direction = directions[i];
        const [x, y] = getCoords(position, direction);

        if (!map[y] || !map[y][x]) return [direction, false];
        switch(map[y][x]) {
            case '.':
                visitedButFree.push(direction);
                continue;
            case '#':
                continue;
            default:
                visitedButFree.push(direction);
                continue;
        }
    }

    if (visitedButFree.length > 0) return [visitedButFree[0], true];
    throw Error('Stuck?');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isOpposite(d1, d2) {
    switch(d1) {
        case NORTH:
            return d2 === SOUTH;
        case SOUTH:
            return d2 === NORTH;
        case WEST:
            return d2 === EAST;
        case EAST:
            return d2 === WEST;
    }
}

async function play(machine) {
    let position = [0,0];
    const min = [0,0];
    const max = [0,0];
    const map = [['D']];
    let direction;
    let loops = 0;
    let lastDirection;
    let steps = 0;
    let depth = 0;
    let backwards = false;

    while (loops < 200000) {       
        const result = machine.executeNext();
        switch (result) {
            case 'halt':
                break;
            case 'input':
                //drawMap(map, min, max);
                // do {
                //     direction = await getDirection();
                // } while (direction === -1);

                [direction, backwards] = getDirectionAuto(map, position, lastDirection);
                // console.log(`Going ${direction}`);
                // console.log(loops);
                // await sleep(500);

                machine.queueInput(direction);
                break;
            case 'output':
                const output = machine.dequeueOutput();
                const [x, y] = getCoords(position, direction);
                if (x < min[0]) min[0] = x;
                if (y < min[1]) min[1] = y;
                if (x > max[0]) max[0] = x;
                if (y > max[1]) max[1] = y;
                if (!map[y]) map[y] = [];

                switch(output) {
                    case 0: // hit wall
                        console.log(`Hit wall`);
                        map[y][x] = '#';
                        break;
                    case 1: // moved
                        console.log(`Moved`);
                        if (backwards) {
                            depth--;
                        } else {
                            depth++;
                        }

                        map[position[1]][position[0]] = depth;
                        position = [x, y];
                        map[y][x] = 'D';
                        lastDirection = direction;
                        steps++;
                        if (position[0] === 0 && position[1] === 0) {
                            drawMap(map, min, max);
                            console.log(`Back to start after ${steps} steps`);
                            return map;
                        }
                        break;
                    
                    case 2: // oxygen system
                        console.log(`Found oxygen system`);
                        if (backwards) {
                            depth--;
                        } else {
                            depth++;
                        }
                        map[position[1]][position[0]] = '.';
                        position = [x, y];
                        map[y][x] = 'o';

                        drawMap(map, min, max);
                        console.log(`Found oxygen system at ${x},${y}, depth ${depth}`);
                        steps++;
                        console.log(`${steps} steps taken`);

                        return map;
                        break;
                }

                drawMap(map, min, max);

                break;
        }
        loops++;
    }
    console.log(loops);
}

const machine = new Machine([...originalProgram]);

try {
    play(machine)
        .then(() => {
            console.log('done')
            process.exit(0);
        })
        .catch(err => {
            console.log(err);
            process.exit(1);
        });
} catch (err) {
    console.log(err);
    console.log(machine);
}

// oxygen system = [-16, 20];
// 380 too high
// 367 too high