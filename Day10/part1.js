const fs = require('fs');

let content = fs.readFileSync('input.txt', 'utf-8').trim();

// Construct a 2-d map of asteroid locations using 1-bit values
const map = content.split('\n').map(l => l.split('').map(c => c === '#' ? 1 : 0));

const height = map.length;
const width = map[0].length;

// Create a list of all asteroid co-ordinates
const asteroids = [];
for(let row=0; row<height; row++) {
    for(let col=0; col<width; col++) {
        if (map[row][col]) asteroids.push([col, row]);
    }
}

// Calculates all the whole-integer points that fall on the line between the two specified points
function pointsBetween(start, end) {
    // Vertical lines have to be treated differently
    if(start[0] === end[0]) {
        // Simply iterate through each y value
        const points = [];
        for (let y=start[1]; start[1] < end[1] ? y<=end[1] : y >= end[1]; start[1] < end[1] ? y++ : y--) {
            points.push([start[0],y]);
        }
        return points;
    }

    const [x0, y0] = start;
    const [x1, y1] = end;

    const dx = x1 - x0;
    const dy = y1 - y0;
    const slope = dy/dx;

    const points = [];

    // Iterate over each whole x co-order between the start and end
    for(let x = x0; x1 > x0 ? x <= x1 : x >= x1; x1 > x0 ? x++ : x--) {
        // Calculate the y co-ord (using standard formula for a straight line)
        const y = slope * (x - x0) + y0;

        // Check if y is an integer
        if (y === ~~y) points.push([x, y]);
    }

    return points;
}

// Checks whether the is an asteroid on a line between two points (exclusive)
function isBlocked(start, target) {
    const points = pointsBetween(start, target);
    for(let i=1; i < points.length -1; i++) { // ignore first and last points
        const [x, y] = points[i];

        // Check the map
        if (map[y][x]) {
            return true;
        }
    }
    
    return false;
}

let max = 0;
let best;

// Consider each asteroid in turn
asteroids.forEach((a, i) => {
    // count the number of visible asteroids
    const visible = asteroids.reduce((p, other, otherIndex) => {
        if (i === otherIndex) return p;    // this asteroid - ignore
        if (isBlocked(a, other)) return p; // blocked by another asteroid
        return p + 1;
    }, 0);

    // Compare with best so far
    if (visible > max) {
        max = visible;
        best = a;
    }
});

console.log(best);
console.log(max);
