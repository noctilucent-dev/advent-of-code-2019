const fs = require('fs');

const content = fs.readFileSync('input.txt', 'utf-8');
const fileLines = content.split('\n');
const bodies = fileLines.map(line => line.split(')'));

const graph = {};

// Map child -> parent
bodies.forEach(pair => {
    const [parent, child] = pair;
    graph[child] = parent;
});

function getPath(start, finish) {
    let path = [];
    while (start !== finish) {
        path.push(start);
        start = graph[start];
    }
    path.push(finish);
    return path;
}

// Get 'path' of jumps required from me and santa to COM
const pathFromMe = getPath('YOU', 'COM');
const pathFromSan = getPath('SAN', 'COM');

let jumps = 0;

// Find first body we both orbit
for(let santaJumps=1; santaJumps<pathFromSan.length; santaJumps++) {
    const santaBody = pathFromSan[santaJumps];
    const myJumps = pathFromMe.findIndex(myBody => myBody === santaBody);

    if (myJumps === -1) continue;
    
    // Sum number of jumps to common body
    console.log(`Found common ancestor ${santaBody} at SAN-${santaJumps}, YOU-${myJumps}`);
    jumps = santaJumps + myJumps - 2;
    break;
}

console.log(jumps);
