const fs = require('fs');
let content = fs.readFileSync('input.txt', 'utf-8');

// Change the middle bit
const lineLength = content.search('\n') + 1;
const numLines = content.length / lineLength;
const centreRow = Math.floor((numLines-1) / 2);
const centreCol = content.search('@') % lineLength;
content = content.substring(0,(centreRow-1)*lineLength + centreCol - 1) + '@#@' + content.substring((centreRow-1)*lineLength + centreCol + 2);
content = content.substring(0,centreRow*lineLength + centreCol - 1) + '###' + content.substring(centreRow*lineLength + centreCol + 2);
content = content.substring(0,(centreRow+1)*lineLength + centreCol - 1) + '@#@' + content.substring((centreRow+1)*lineLength + centreCol + 2);

// Split into four maps
let topLeft = '', topRight = '', bottomLeft = '', bottomRight = '';
for (let i=0; i<=centreRow; i++) {
    topLeft += content.substring((lineLength * i), (lineLength * i)+centreCol+1) + '\n';
    topRight += content.substring((lineLength * i) + centreCol, lineLength * (i +1));
    bottomLeft += content.substring(lineLength * (i + centreRow), lineLength * (i + centreRow)+centreCol+1) + '\n';
    bottomRight += content.substring((lineLength * (i + centreRow)) + centreCol, lineLength * (i + centreRow +1));
}

const quadContent = [topLeft, topRight, bottomLeft, bottomRight];

let overallMap = content.trim().split('\n').map(l => l.split(''));
let quadMaps = quadContent.map(c => c.trim().split('\n').map(l => l.split('')));

function isDoor(symbol) {
    return /[A-Z]/.test(symbol);
}

function isKey(symbol) {
    return /[a-z]/.test(symbol);
}

function getKeyLocations(map) {
    const keyLocations = {};
    for(let y=0; y<map.length; y++) {
        for(let x=0; x<map[y].length; x++) {
            const symbol = map[y][x];
            if (isKey(symbol) || symbol === '@') keyLocations[symbol] = [x, y];
        }
    }
    return keyLocations;
}

const allKeyLocations = getKeyLocations(overallMap);
const quadKeyLocations = quadMaps.map(getKeyLocations);
const keyCount = Object.keys(allKeyLocations).filter(isKey).length;

// Creates a basic graph from the specified map.
// Each node links to its non-wall neighbours
function createGraph(map) {
    const g = [];
    for(let row=0; row<map.length; row++) {
        g[row] = new Array(map[row].length);
        for(let col=0; col<map[row].length; col++) {
            g[row][col] = {
                symbol: map[row][col],
                x: col,
                y: row,
                neighbours: new Set()
            };
        }
    }

    for(let row=0; row<map.length; row++) {
        for(let col=0; col<map[row].length; col++) {
            if (g[row][col].symbol === '#') {
                g[row][col].neighbours = [];
                continue;
            }

            if (g[row-1][col].symbol !== '#') g[row][col].neighbours.add(g[row-1][col]);
            if (g[row+1][col].symbol !== '#') g[row][col].neighbours.add(g[row+1][col]);
            if (g[row][col-1].symbol !== '#') g[row][col].neighbours.add(g[row][col-1]);
            if (g[row][col+1].symbol !== '#') g[row][col].neighbours.add(g[row][col+1]);

            g[row][col].neighbours = Array.from(g[row][col].neighbours);
        }
    }

    return g;
}

// Creates a graph from the given start (symbol).
// Each node in the graph includes its position, symbol, distance to the start.
// Additionally, each records a list of doors that block the path to it.
// Uses dijkstra's algorithm, with slight modifications.
// Requires the original map plus a pre-calculated graph (see createGraph).
function mapFromPoint(map, graph, start) {
    const [startX, startY] = start;

    // Convert all locations on map to a 'node'
    // Each starts with infinite distance (apart from the start location)
    const nodes = map.map((r, ri) => r.map((c, ci) => ({symbol: c, distance: Infinity, visited: false, x: ci, y: ri, blockedBy: []})));
    nodes[startY][startX].distance = 0;

    // Helper function that finds the unvisited node with smallest distance
    const next = () => nodes.flat().filter(n => !n.visited && n.symbol !== '#').sort((a, b) => a.distance - b.distance)[0];

    let current = nodes[startY][startX];
    while (current) {
        // Find visitable neighbours
        const neighbours = graph[current.y][current.x].neighbours.map(i => nodes[i.y][i.x]).filter(n => !n.visited);

        neighbours.forEach(n => {
            // update the distance if needed
            if(n.symbol !== '#' && n.distance > current.distance + 1) {
                n.distance = current.distance + 1;
            }

            // Update list of blocking doors
            n.blockedBy = n.blockedBy.concat(current.blockedBy);
            if (isDoor(n.symbol)) n.blockedBy.push(n.symbol);
        });

        // Mark this node as visited, and move onto next-best node
        current.visited = true;
        current = next();
    }

    return nodes;
}

const debugDepth = 0;
const cache = {};

// Finds the smallest number of steps required to pick up all the keys (not already picked up).
// Iterates over the 'reachable' keys and calls itself recursively.
// Takes the original map, graph, the start (@ or key) and a list of unlocked doors
// Additionally, the depth variable is used for logging purposes and early infinite recursion detection.
function solve(quadMaps, quadGraphs, starts, unlocked, depth) {
    // Allows for configurable logging
    const log = message => {
        if(depth <= debugDepth) {
            console.log(new Date(Date.now()).toISOString().substring(11,23) + ' ' + '             '.substring(0, depth) + message);
        }
    };

    // Check if we've already solved from this state
    // Note - this cache reduces the solution time by orders of magnitude
    const cacheKey = starts.join(',') + ',' + Array.from(unlocked).sort().join(',');
    if (cache[cacheKey]) {
        log(`Cached: ${cacheKey}`);
        return cache[cacheKey];
    }
    
    log(`Solving for ${starts} with ${JSON.stringify(Array.from(unlocked))}`);

    if (depth > 26) {
        throw new Error(`Depth exceeded`);
    }

    // Create a distance map from this location if not done already
    quadKeyLocations.forEach((keyLocations, i) => {
        const start = starts[i];
        if (!keyLocations[start].nodes) {
            log(`Mapping distances from ${start} in quadrant ${i}`);
            keyLocations[start].nodes = mapFromPoint(quadMaps[i], quadGraphs[i], keyLocations[start]);
        }
    });

    let anyReachable = false;
    let minSteps = Infinity;

    for(let robot=0; robot<4; robot++) {
        const start = starts[robot];
        const keyLocations = quadKeyLocations[robot];

        // Find all the keys we can reach from this location without going through locked doors
        const reachable = keyLocations[start].nodes.flat().filter(n => {
            if(!isKey(n.symbol)) return false;
            if(unlocked.has(n.symbol.toUpperCase())) return false;
            if(n.blockedBy.some(d => !unlocked.has(d))) return false;
            return true;
        });
      
        // No keys left - must be done
        if (reachable.length === 0) {
            log(`Nowhere for robot ${robot} to go`);
            continue;
        }

        log(`Robot ${robot} has ${reachable.length} option(s): ${reachable.map(r => r.symbol)}`);
        anyReachable = true;

        // Recurse for each key, and record best solution
        reachable.forEach(r => {
            // Add the door this key unlocks
            const u = new Set(unlocked);
            u.add(r.symbol.toUpperCase());

            let newStarts = [...starts];
            newStarts[robot] = r.symbol;

            let rSteps = solve(quadMaps, quadGraphs, newStarts, u, depth + 1);

            rSteps += r.distance;
            if (rSteps < minSteps) minSteps = rSteps;
        });
    }

    if (!anyReachable) {
        if (unlocked.size === keyCount) {
            log(`All unlocked`);
            return 0;
        } else {
            log(`Dead end - ${keyCount - unlocked.size} remaining`);
            return Infinity;
        }
    }

    log(`Min steps: ${minSteps}`);

    // Update the cache
    cache[cacheKey] = minSteps;
    return minSteps;
}

/* Pre-calculate distance maps for keys */
// Object.keys(keyLocations).forEach(symbol => {
//     const nodes = mapFromPoint(map, g, keyLocations[symbol]);
//     keyLocations[symbol].nodes = nodes;
// });

const quadGraphs = quadMaps.map(createGraph);

console.log(`Solving`);
const steps = solve(quadMaps, quadGraphs, ['@', '@', '@', '@'], new Set(), 0);
console.log(steps);

// answer = 2154