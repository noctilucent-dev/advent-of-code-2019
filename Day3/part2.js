const fs = require('fs');

const content = fs.readFileSync('input.txt', 'utf-8');
const fileLines = content.split('\n');
let paths = fileLines.map(line => line.split(','));

// paths = [
//     ['R8','U5','L5','D3'],
//     ['U7','R6','D4','L4']
// ];

function getLines(path) {
    const lines = [];
    let start = {
        x: 0,
        y: 0
    };
    for (let i=0; i<path.length; i++) {
        const length = path[i].substring(1) * 1;
        const end = {...start};
        switch (path[i][0]) {
            case 'U':
                end.y += length;
                break;
            case 'R':
                end.x += length;
                break;
            case 'D':
                end.y -= length;
                break;
            case 'L':
                end.x -= length;
                break;
        }
        lines.push({start, end, length});
        start = {...end};
    }
    return lines;
}

function isHorizontal(line) {
    return line.start.y === line.end.y;
}

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function findIntersection(line1, line2, line1Steps, line2Steps) {

    // check if lines are parallel
    if (isHorizontal(line1) === isHorizontal(line2)) return;
    
    // identify horizontal and vertical line
    let horizontalLine, verticalLine;
    if (isHorizontal(line1)) {
        horizontalLine = deepCopy(line1);
        verticalLine = deepCopy(line2);
    } else {
        horizontalLine = deepCopy(line2);
        verticalLine = deepCopy(line1);
    }

    // make sure vertical lines runs bottom to top
    if (verticalLine.start.y > verticalLine.end.y) {
        const tmp = verticalLine.end.y;
        verticalLine.end.y = verticalLine.start.y;
        verticalLine.start.y = tmp;
    }

    // make sure the horizontal line runs left to right
    if (horizontalLine.start.x > horizontalLine.end.x) {
        const tmp = horizontalLine.end.x;
        horizontalLine.end.x = horizontalLine.start.x;
        horizontalLine.start.x = tmp;
    }

    // check if vertical line starts above horizontal line
    if (verticalLine.start.y > horizontalLine.start.y) return;

    // check if vertical line ends below horizontal line
    if (verticalLine.end.y < horizontalLine.start.y) return;

    // check if horizontal line starts right of the vertical line
    if (horizontalLine.start.x > verticalLine.start.x) return;

    // check if horizontal line ends left of the vertical line
    if (horizontalLine.end.x < verticalLine.start.x) return;

    const point = {
        x: verticalLine.start.x,
        y: horizontalLine.start.y
    };

    line1Steps += Math.abs(line1.start.x - point.x) + Math.abs(line1.start.y - point.y);
    line2Steps += Math.abs(line2.start.x - point.x) + Math.abs(line2.start.y - point.y);

    point.steps = line1Steps + line2Steps;

    return point;
}

const lines = paths.map(getLines);
const intersections = [];
let line1Steps = 0;

for(let i=0; i<lines[0].length; i++) {
    const line1 = lines[0][i];
    let line2Steps = 0;

    for (let j=0; j<lines[1].length; j++) {
        const line2 = lines[1][j];

        const intersection = findIntersection(line1, line2, line1Steps, line2Steps);
        if (intersection) intersections.push(intersection);
        
        line2Steps += line2.length;
    }

    line1Steps += line1.length;
}

intersections.sort((a, b) => a.steps - b.steps);
const min = intersections[0].steps;
console.log(min);
