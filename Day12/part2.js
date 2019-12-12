function arrayEquals(a, b) {
    for (let i=0; i<a.length; i += 1) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function gcd(x, y) {
    x = Math.abs(x);
    y = Math.abs(y);
    while(y) {
      var t = y;
      y = x % y;
      x = t;
    }
    return x;
}

function lcm(x, y) {
    return (!x || !y) ? 0 : Math.abs((x * y) / gcd(x, y));
}

function lcmMany(...nums) {
    let l = lcm(nums[0], nums[1]);
    for(let i=2; i<nums.length; i++) {
        l = lcm(l, nums[i]);
    }
    return l;
}

class Body {
    constructor(id, x, y, z) {
        this.id = id;
        this.pos = [x,y,z];
        this.vel = [0,0,0];
    }

    print() {
        console.log(`${this.id}: [${this.pos}], [${this.vel}]`);
    }

    calculateVelocity(bodies) {
        bodies.forEach(other => {
            if (this.id === other.id) return;

            const deltas = other.pos.map((v, i) => v - this.pos[i]);
            deltas.forEach((v, i) => {
                if (v > 0) this.vel[i]++;
                if (v < 0) this.vel[i]--;
            });
        });
    }

    stepTime() {
        this.vel.forEach((v, i) => {
            this.pos[i] += v;
        });
    }

    energy() {
        const sumAbsolute = (p, c) => Math.abs(p) + Math.abs(c);
        return this.pos.reduce(sumAbsolute) * this.vel.reduce(sumAbsolute);
    }
}

// const bodies =[
//     new Body('A', -8,-10,0),
//     new Body('B', 5,5,10),
//     new Body('C', 2,-7,3),
//     new Body('D', 9,-8,-3)
// ];

const bodies =[
    new Body('A', 0,6,1),
    new Body('B', 4,4,19),
    new Body('C', -11,1,8),
    new Body('D', 2,19,15)
];

let stepsTaken = 0;
let stepCounts = [];

let initialState = [0,1,2].map(d => bodies.flatMap(b => [b.pos[d], b.vel[d]]));

while (true) {
    bodies.forEach(b => b.calculateVelocity(bodies));
    bodies.forEach(b => b.stepTime());
    stepsTaken++;

    // Iterate through dimensions
    for (let d=0; d<3; d++) {
        if (stepCounts[d]) continue;

        // Get the position/velocities in this dimension for all bodies
        const state = bodies.flatMap(b => [b.pos[d], b.vel[d]]);

        // Compare to initial positions/velocities
        if (arrayEquals(initialState[d], state)) {
            // Record the number of steps taken to 'loop' in this dimension
            stepCounts[d] = stepsTaken;
        }
    }

    // Stop when we have found loops for all 3 dimensions
    if (stepCounts[0] && stepCounts[1] && stepCounts[2]) break;
}

const totalStepsToLoop = lcmMany(...stepCounts);

console.log(totalStepsToLoop);
