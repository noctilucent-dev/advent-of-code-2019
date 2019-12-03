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
        const len = path[i].substring(1) * 1;
        const end = {...start};
        switch (path[i][0]) {
            case 'U':
                end.y += len;
                break;
            case 'R':
                end.x += len;
                break;
            case 'D':
                end.y -= len;
                break;
            case 'L':
                end.x -= len;
                break;
        }
        lines.push({start, end});
        start = {...end};
    }
    return lines;
}

function isHorizontal(line) {
    return line.start.y === line.end.y;
}

function findIntersection(line1, line2) {

    // check if lines are parallel
    if (isHorizontal(line1) === isHorizontal(line2)) return;
    
    // identify horizontal and vertical line
    let horizontalLine, verticalLine;
    if (isHorizontal(line1)) {
        horizontalLine = line1;
        verticalLine = line2;
    } else {
        horizontalLine = line2;
        verticalLine = line1;
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

    // check if vertical line start above horizontal line
    if (verticalLine.start.y > horizontalLine.start.y) return;

    // check if vertical line ends below horizontal line
    if (verticalLine.end.y < horizontalLine.start.y) return;

    // check if horizontal line starts right of the vertical line
    if (horizontalLine.start.x > verticalLine.start.x) return;

    // check if horizontal line ends left of the vertical line
    if (horizontalLine.end.x < verticalLine.start.x) return;

    return ({
        x: verticalLine.start.x,
        y: horizontalLine.start.y
    });
}

function distanceFromOrigin(point) {
    return Math.abs(point.x) + Math.abs(point.y);
}

const lines = paths.map(getLines);

const intersections = [];

for(let i=0; i<lines[0].length; i++) {
    for (let j=0; j<lines[1].length; j++) {
        const intersection = findIntersection(lines[0][i], lines[1][j]);
        if (intersection) intersections.push(intersection);
    }
}

intersections.sort((a, b) => distanceFromOrigin(a) - distanceFromOrigin(b));
const min = distanceFromOrigin(intersections[0])
console.log(min);
