const fs = require('fs');
let content = fs.readFileSync('input.txt', 'utf-8');

// content = `
//          A           
//          A           
//   #######.#########  
//   #######.........#  
//   #######.#######.#  
//   #######.#######.#  
//   #######.#######.#  
//   #####  B    ###.#  
// BC...##  C    ###.#  
//   ##.##       ###.#  
//   ##...DE  F  ###.#  
//   #####    G  ###.#  
//   #########.#####.#  
// DE..#######...###.#  
//   #.#########.###.#  
// FG..#########.....#  
//   ###########.#####  
//              Z       
//              Z       
// `;

const map = content.split('\n').filter(l => l.trim().length > 0).map(l => l.split(''));

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

function findAdjacent(x, y, test) {
    // const t = (x, y) => test(map[y][x]);
    // if(x > 0 && t(x-1, y)) return [x-1, y];
    // if(x < map[y].length - 1 && t(x+1, y)) return [x+1, y];
    // if(y > 0 && t(x, y-1)) return [x, y-1];
    // if(y < map.length-1 && t(x, y+1)) return [x, y+1];
    return findAllAdjacent(x, y, test)[0];
}

// Find portals
const portals = {};

for(let y=0; y<map.length; y++) {
    for(let x=0; x<map[y].length; x++) {
        if (isLetter(map[y][x])) {
            const [ox, oy] = findAdjacent(x, y, isLetter);
            const letters = [map[y][x], map[oy][ox]];
            const name = letters.sort().join('');
            
            let entrance = findAdjacent(x, y, v => v === '.');
            if (!entrance) entrance = findAdjacent(ox, oy, v => v === '.');
            if (!entrance) throw new Error(`Could not find portal entrance for ${name}`);

            if (!portals[name]) {
                portals[name] = [entrance];
            } else {
                if (!portals[name].some(p => p[0] === entrance[0] && p[1] === entrance[1]))
                    portals[name].push(entrance);
            }
        }
    }
}

function serialize(x, y) {
    return x * 1000 + y;
}

console.log(portals);

function coordsMatch(a, b) {
    const [x1, y1] = a;
    const [x2, y2] = b;
    return x1 === x2 && y1 === y2;
}

function findPortal(x, y) {
    const names = Object.keys(portals);
    for(let i=0; i<names.length; i++) {
        const name = names[i];
        const portal = portals[name];
        if (portal.length === 1) continue;
        if (coordsMatch(portal[0], [x, y])) return portal[1];
        if (coordsMatch(portal[1], [x, y])) return portal[0];
    }
}

function findAdjacentWithPortals(x, y, visited) {

    const adjacent = findAllAdjacent(x, y, (v, ax, ay) => v === '.' && !Array.from(visited).some(v => v.x === ax && v.y === ay));
    const portal = findPortal(x, y);
    if (portal) adjacent.push(portal);
    return adjacent;
}

// Find shortest path using Dijkstra's algorithm
let [x, y] = portals.AA[0];
let current = {
    x, y, distance: 0    
};

const [targetX, targetY] = portals.ZZ[0];
const visited = new Set();
let unvisited = new Set();


while (true) {
    x = current.x;
    y = current.y;
    // console.log(`Visiting ${x},${y}`);

    if (x === targetX && y === targetY) break;

    const adjacent = findAdjacentWithPortals(x, y, visited);
    // console.log(adjacent);
    adjacent.forEach(a => {
        unvisited.add({
            x: a[0],
            y: a[1],
            distance: current.distance + 1
        });
    });

    visited.add(current);
    unvisited.delete(current);

    if (unvisited.size === 0) {
        console.log('Run out of nodes to visit');
        break;
    }

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

console.log(current);