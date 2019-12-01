const fs = require('fs');
const readline = require('readline');

function calculateFuel(mass) {
    let fuel = 0;
    while (mass > 0) {
        mass = ~~(mass / 3) - 2;
        if (mass > 0) fuel += mass;
    }

    return fuel;
}

async function getTotal() {
    let total = 0;

    const rs = fs.createReadStream('input.txt');
    const rl = readline.createInterface({
        input: rs,
        crlfDelay: Infinity
    });

    for await(const line of rl) {
        const weight = parseInt(line);
        const fuel = calculateFuel(weight);
        total += fuel;
    }

    return total;
}

getTotal().then(console.log);
