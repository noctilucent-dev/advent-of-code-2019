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
/*
Test input:
<x=-1, y=0, z=2>
<x=2, y=-10, z=-7>
<x=4, y=-8, z=8>
<x=3, y=5, z=-1>
[
    new Body('A', -1,0,2),
    new Body('B', 2,-10,-7),
    new Body('C', 4,-8,8),
    new Body('D', 3,5,-1)
]

My input:
<x=0, y=6, z=1>
<x=4, y=4, z=19>
<x=-11, y=1, z=8>
<x=2, y=19, z=15>
[
    new Body('A', 0,6,1),
    new Body('B', 4,4,19),
    new Body('C', -11,1,8),
    new Body('D', 2,19,15)
]
*/

const bodies =[
    new Body('A', 0,6,1),
    new Body('B', 4,4,19),
    new Body('C', -11,1,8),
    new Body('D', 2,19,15)
];

let stepsTaken = 0;

while (true) {
    bodies.forEach(b => b.calculateVelocity(bodies));
    bodies.forEach(b => b.stepTime());
    stepsTaken++;

    // console.log(`Step ${stepsTaken}`);
    // bodies.forEach(b => b.print());
    // console.log('');

    if (stepsTaken === 1000)
        break;
}

const totalEnergy = bodies.reduce((p, c) => p + c.energy(), 0);
console.log(totalEnergy);