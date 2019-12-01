const fs = require('fs');
const readline = require('readline');

async function getTotal() {
    let total = 0;

    const rs = fs.createReadStream('input.txt');
    const rl = readline.createInterface({
        input: rs,
        crlfDelay: Infinity
    });

    for await(const line of rl) {
        const weight = parseInt(line);
        const fuel = ~~(weight / 3) - 2;
        total += fuel;
    }

    return total;
}

getTotal().then(console.log);
