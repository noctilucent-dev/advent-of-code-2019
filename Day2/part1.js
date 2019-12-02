const fs = require('fs');

const content = fs.readFileSync('input.txt', 'utf-8');
let codes = content.split(',').map(i => +i);

let counter = 0;
let running = true;

codes[1] = 12;
codes[2] = 2;

while(running) {
    const opCode = codes[counter];

    if (opCode == 99) break;

    const num1Pos = codes[counter+1];
    const num2Pos = codes[counter+2];
    const writeTo = codes[counter+3];

    const result = opCode === 1 ? codes[num1Pos] + codes[num2Pos] : codes[num1Pos] * codes[num2Pos];

    codes[writeTo] = result;

    counter += 4;
    
}

console.log(codes[0]);