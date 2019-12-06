const fs = require('fs');

let content = fs.readFileSync('input.txt', 'utf-8');
// content = `COM)B
// B)C
// C)D
// D)E
// E)F
// B)G
// G)H
// D)I
// E)J
// J)K
// K)L`;
const fileLines = content.split('\n');
let bodies = fileLines.map(line => line.split(')'));

const graph = {};

bodies.forEach(pair => {
    const [parent, child] = pair;
    if (!graph[parent]) {
        graph[parent] = [];
    }
    graph[parent].push(child);
});

let totalDepths = 0;

function countChildren(root, depth) {
    totalDepths += depth;
    if (!graph[root]) return;
    graph[root].forEach(child => countChildren(child, depth + 1));
}

countChildren('COM', 0);

console.log(totalDepths);