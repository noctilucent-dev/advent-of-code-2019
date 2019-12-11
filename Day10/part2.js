const fs = require('fs');

let content = fs.readFileSync('input.txt', 'utf-8').trim();

// Construct a 2-d map of asteroid locations using 1-bit values
const map = content.split('\n').map(l => l.split('').map(c => c === '#' ? 1 : 0));

const height = map.length;
const width = map[0].length;

// Co-ords of the monitoring station
const monitoringStation = [29, 28];

// Create a list of all asteroid co-ordinates
let asteroids = [];
for(let row=0; row<height; row++) {
    for(let col=0; col<width; col++) {
        if (map[row][col]) {
            if (col === monitoringStation[0] && row === monitoringStation[1]) continue; // ignore monitoring station
            asteroids.push([col, row]);
        }
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
    // console.log(`Checking ${target}`);
    const points = pointsBetween(start, target);
    // console.log(points);
    for(let i=1; i < points.length -1; i++) { // ignore first and last points
        const [x, y] = points[i];

        // Check the map
        if (map[y][x]) {
            return true;
        }
    }
    
    return false;
}

function getAngle(origin, target) {
    const dx = target[0] - origin[0];
    const dy = target[1] - origin[1];

    // determine quadrant
    if (dy < 0 && dx > 0) { // upper-right
        return dx / (-dy);
    }
    if (dy > 0 && dx > 0) { // bottom-right
        return width + (dy / dx);
    }
    if (dy > 0 && dx < 0) { // bottom-left
        return (2*width) + ((-dx)/dy);
    }
    if (dy < 0 && dx < 0) { // top-left
        return (3*width) + (dy/dx);
    }
    if (dx === 0 && dy < 0) { // straight up
        return 0;
    }
    if (dx === 0 && dy > 0) { // straight down
        return 2 * width;
    }
    if (dy === 0 && dx > 0) { // right
        return width;
    }
    if (dy === 0 && dx < 0) { // left
        return 3 * width;
    }

    return 0; // itself
}

// Calculate 'angle' of each asteroid
asteroids.forEach(a => a.angle = getAngle(monitoringStation, a));

// Sort asteroids by angle (clockwise from straight up)
asteroids = asteroids.sort((a, b) => {
    return a.angle - b.angle;
});

let removed = 0;

while (removed < 200) {
    let visible = asteroids.filter(a => !isBlocked(monitoringStation, a));
    if (visible.length === 0) {
        console.log('No asteroids left');
        break;
    }

    if (visible.length + removed >= 200) {
        console.log(visible[200-removed-1]);
        break;
    }

    // Remove visible asteroids from map
    visible.forEach(a => {
        const [x, y] = a;
        map[y][x] = 0;
    });

    removed += visible.length;
}
