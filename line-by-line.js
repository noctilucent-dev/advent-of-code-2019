const fs = require('fs');
const readline = require('readline');

async function byLine(file, callback) {
    const rs = fs.createReadStream(file);
    const rl = readline.createInterface({
        input: rs,
        crlfDelay: Infinity
    });

    for await(const line of rl) {
        callback(line);
    }
}

// Example - sum the int values in the file 'input.txt'
let total = 0;

byLine(
    'input.txt',
    line => total += parseInt(line)
).then(
    () => console.log(total)
);
