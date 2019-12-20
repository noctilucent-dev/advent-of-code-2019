const fs = require('fs');

function isLetter(val) {
    return /[A-Z]/.test(val);
}

function findAllAdjacent(x, y, test) {
    const locations = [];
    const t = (x, y) => !test || test(map[y][x], x, y);

    if(x > 0 && t(x-1, y)) locations.push([x-1, y]);
    if(x < map[y].length - 1 && t(x+1, y)) locations.push([x+1, y]);
    if(y > 0 && t(x, y-1)) locations.push([x, y-1]);
    if(y < map.length-1 && t(x, y+1)) locations.push([x, y+1]);

    return locations;
}

function getPortal(x, y) {
    const firstLetter = map[y][x];

    // outer-top
    if (y === 0) {
        return {
            name: firstLetter + map[y+1][x],
            entrance: [x, y+2],
            level: -1
        };
    }

    // outer-left
    if (x === 0) {
        return {
            name: firstLetter + map[y][x+1],
            entrance: [x+2, y],
            level: -1
        };
    }

    // outer-bottom
    if(y === map.length - 2) {
        return {
            name: firstLetter + map[y+1][x],
            entrance: [x, y-1],
            level: -1
        };
    }

    // outer-right
    if(x === map[y].length - 2) {
        return {
            name: firstLetter + map[y][x+1],
            entrance: [x-1, y],
            level: -1
        };
    }

    const above = map[y-1][x];
    const below = map[y+1][x];
    const left = map[y][x-1];
    const right = map[y][x+1];

    // inner-top
    if (above === '.') {
        return {
            name: firstLetter + below,
            entrance: [x,y-1],
            level: +1
        };
    }

    // inner-bottom
    if (isLetter(below)) {
        return {
            name: firstLetter + below,
            entrance: [x,y+2],
            level: +1
        };
    }

    // inner-left
    if (left === '.') {
        return {
            name: firstLetter + right,
            entrance: [x-1,y],
            level: +1
        };
    }

    // inner-right
    if (isLetter(right)) {
        return {
            name: firstLetter + right,
            entrance: [x+2,y],
            level: +1
        };
    }
}

function coordsMatch(a, b) {
    const [x1, y1] = a;
    const [x2, y2] = b;
    return x1 === x2 && y1 === y2;
}

function findPortal(x, y) {
    return portals.find(p => coordsMatch(p.entrance, [x,y]));
}

Set.prototype.some = function(predicate) {
    for(const item of this.values()) {
        if(predicate(item)) return true;
    }
    return false;
}

function findAdjacentWithPortals(x, y, level, visited) {
    const adjacent = findAllAdjacent(x, y, (v, ax, ay) => {
        if (v !== '.') return false;
        if (visited.some(v => v.level === level && v.x === ax && v.y === ay)) return false;
        return true;
    });
    let portal = findPortal(x, y);

    if (portal && visited.some(v => v.level === (level + portal.level) && coordsMatch([v.x, v.y], portal.exit))) {
        portal = undefined;
    }

    return {
        adjacent,
        portal
    };
}

// Parse input
let content = fs.readFileSync('input.txt', 'utf-8');
const map = content.split('\n').filter(l => l.trim().length > 0).map(l => l.split(''));

// Find portals
const portals = [];
let AA, ZZ;

for(let y=0; y<map.length-1; y++) {
    for(let x=0; x<map[y].length-1; x++) {
        if (isLetter(map[y][x])) {
            const portal = getPortal(x, y);
            if (!portal) continue;

            if (portal.name === 'AA') {
                AA = portal.entrance;
            } else if (portal.name === 'ZZ') {
                ZZ = portal.entrance;
            } else {
                portals.push(portal);
            }
        }
    }
}

// Match up portal ends
portals.forEach(start => {
    if (start.exit) return;

    const end = portals.find(end => end !== start && start.name === end.name);
    start.exit = end.entrance;
    end.exit = start.entrance;
});

// Find shortest path using Dijkstra's algorithm
let current = {
    x: AA[0],
    y: AA[1],
    level: 0,
    distance: 0,
};

const [targetX, targetY] = ZZ;
const visited = new Set();
let unvisited = new Set();

const LEVEL_WEIGHTING = 1000; // Artificial 'distance' to apply when moving up a level

while (true) {
    let {x, y, level, distance} = current;

    // Check if we've reached the end
    if (level === 0 && x === targetX && y === targetY) break;

    // Add adjacent places to unvisited list
    const {adjacent, portal} = findAdjacentWithPortals(x, y, level, visited);
    adjacent.forEach(a => {
        unvisited.add({
            x: a[0],
            y: a[1],
            distance: distance + 1,
            level
        });
    });

    // Add portal if there is one (and its level is appropriate)
    if (portal && level + portal.level >= 0) {
        unvisited.add({
            x: portal.exit[0],
            y: portal.exit[1],
            distance: distance + 1 + (portal.level * LEVEL_WEIGHTING), // fudge distance to discourage moving up levels
            level: level + portal.level,
            portal: portal.name
        });
    }

    // Update visited/unvisited for this position
    visited.add(current);
    unvisited.delete(current);

    if (unvisited.size === 0) {
        console.log('Run out of nodes to visit');
        break;
    }

    // Find the unvisited node with smallest distance
    let minDistance = Infinity;
    let next;
    unvisited.forEach(u => {
        if (u.distance < minDistance) {
            next = u;
            minDistance = u.distance;
        }
    });

    current = next;
}

console.log(current.distance);
