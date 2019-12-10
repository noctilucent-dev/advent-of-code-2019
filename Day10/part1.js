const fs = require('fs');

let content = fs.readFileSync('input.txt', 'utf-8').trim();
content = `
.#..#
.....
#####
....#
...##`;
const map = content.split('\n').map(l => l.split('').map(c => c === '#' ? 1 : 0));

const height = map.length;
const width = map[0].length;

const asteroids = [];
for(let row=0; row<height; row++) {
    for(let col=0; col<width; col++) {
        if (map[row][col]) asteroids.push([col, row]);
    }
}

// function gcd(a, b) {
//     if (a === 0) return b;
//     return gcd(b % a, a);
// }

function gcd(a, b) {
    while(b) {
        let t = b;
        b = a % b;
        a = t;
    }
    return a;
}

// function commonDivisors(a, b) {
//     const n = gcd(a, b);

//     const divisors = [];

//     for(let i=1; i<=Math.sqrt(n); i++) {
//         if (n % i === 0) {
//             divisors.push(i);
//             if (n / i !== i) divisors.push(n);
//         }
//     }

//     divisors.sort();
//     divisors.reverse();

//     console.log(divisors);

//     return divisors;
// }

// // console.log(asteroids);

// function pointsToOrigin(x, y) {
//     const divisors = commonDivisors(x, y);
//     return divisors.map(d => [x/d, y/d]);
// }

// function pointsToOrigin2(x, y) {
//     const min = Math.min(x, y);
//     const points = [];
//     for(let i=2; i<min; i++) {
//         if (x % i === 0 && y % i === 0) {
//             points.push([x/i, y/i]);
//         }
//     }

//     return points;
// }

// function gcdExtended(a, b) {
//     if (a === 0) {
//         return {
//             gcd: b,
//             x: 0,
//             y: 1
//         };
//     }

//     const {gcd, x, y} = gcdExtended(b % a);

//     return {
//         gcd,
//         x: y - (b/a) * x,
//         y: x
//     };
// }

// function pointsBetween(start, end) {
//     let A = start[1] - end[1];
//     let B = end[0] - start[0];
//     let C = start[0] * (start[1] - end[1]) + start[1] * (end[0] - start[0]);

//     const {gcd, x, y} = gcdExtended(A, B);

//     if (C % gcd !== 0) return [];



//     // calculate slope
//     const m = (y2 - y1) / (x2 - x1);
    
// }

function pointsBetween(start, end) {
    const [x0, y0] = start;
    const [x1, y1] = end;

    const dx = x1 - x0;
    const dy = y1 - y0;
    // const n = gcd(dx, dy);
    // console.log(n);
    const slope = dy/dx;
    const derr = Math.abs(dy / dx);
    let error = 0;
    const points = [];
    // console.log(slope);

    for(let x = x0; x1 > x0 ? x <= x1 : x >= x1; x1 > x0 ? x++ : x--) {
        //if (y % dx !== 0) continue;
        const y = slope * (x - x0) + y0;

        // console.log(`${x},${y}`);
        if (y === ~~y) points.push([x, y]);
    }

    return points;
}

function isBlocked(start, target) {
    const points = pointsBetween(start, target);
    for(let i=1; i < points.length -1; i++) {
        const [x, y] = points[i];

        if (map[y][x]) {
            console.log(`Blocked at ${x},${y}`);
            return true;
        }
    }
    return false;
}

let max = 0;
let best;

asteroids.map((a, i) => {
    console.log(`Considering asteroid ${i} (${a[0]},${a[1]})`);
    const visible = asteroids.reduce((p, other, otherIndex) => {
        if (i === otherIndex) return p;
        console.log(`Looking to ${other[0]},${other[1]}`);
        if (isBlocked(a, other)) return p;
        console.log(`Visible`);
        return p + 1;
    }, 0);
    console.log(`${visible} visible`);
    console.log('');

    if (visible > max) {
        max = visible;
        best = a;
    }
})

console.log(best);
console.log(max);
