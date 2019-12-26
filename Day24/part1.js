const fs = require('fs');

function countAdjacentBugs(x, y, map) {
    let count = 0;
    if (y > 0 && map[y-1][x] === '#') count++;
    if (y < map.length - 1 && map[y+1][x] === '#') count ++;
    if (x > 0 && map[y][x-1] === '#') count++;
    if (x < map[y].length - 1 && map[y][x+1] === '#') count++;

    return count;
}

function mapsEqual(a, b) {
    for(let y=0; y<a.length; y++) {
        for(let x = 0; x<a[y].length; x++) {
            if (a[y][x] !== b[y][x]) return false;
        }
    }
    return true;
}

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function calculateBiodiversity(map) {
    // const bin = map.flat().map(v => v === '#' ? 1 : 0).join('');
    // return parseInt(bin, 2);
    // console.log(map.flat().map(v => v === '#' ? 1 : 0).join(''));


    let diversity = 0;
    let count = 0;
    for(let y=0; y<map.length; y++) {
        for(let x=0; x<map[y].length; x++) {
            if (map[y][x] === '#') {
                diversity += Math.pow(2, count);
            }
            count++;
        }
    }
    return diversity;
}

let content = fs.readFileSync('input.txt', 'utf8');

// let content = `
// ....#
// #..#.
// #..##
// ..#..
// #....`;

let map = content.trim().split('\n').map(l => l.split(''));

let history = [map];

while (true) {
    // map.forEach(row => console.log(row.join('')));
    // console.log('');

    const counts = map.map((row, y) => row.map((col, x) => countAdjacentBugs(x, y, map)));
    // counts.forEach(row => console.log(row.join('')));
    // console.log('');

    const newMap = counts.map((row, y) => row.map((count, x) => {
        const isBug = map[y][x] === '#';
        if (isBug && count !== 1) return '.';
        if (!isBug && (count === 1 || count === 2)) return '#';
        return map[y][x];
    }));
    
    
    
    if (history.some(i => mapsEqual(i, newMap))) {
        console.log(`Found repeat:`);
        newMap.forEach(row => console.log(row.join('')));
        console.log('');
        console.log(calculateBiodiversity(newMap));
        break;
    }

    history.push(newMap);
    map = newMap;
}

// console.log(history.length);

// history.forEach((m, i) => console.log(`${'   '.substring(0, 3 - (i.toString().length)) + i} = ${calculateBiodiversity(m)}`));
