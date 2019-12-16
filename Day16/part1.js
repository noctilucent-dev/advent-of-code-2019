let content = '59787832768373756387231168493208357132958685401595722881580547807942982606755215622050260150447434057354351694831693219006743316964757503791265077635087624100920933728566402553345683177887856750286696687049868280429551096246424753455988979991314240464573024671106349865911282028233691096263590173174821612903373057506657412723502892841355947605851392899875273008845072145252173808893257256280602945947694349746967468068181317115464342687490991674021875199960420015509224944411706393854801616653278719131946181597488270591684407220339023716074951397669948364079227701367746309535060821396127254992669346065361442252620041911746738651422249005412940728';
//content = '12345678';
//content = '80871224585914546619083218645595';

let input = content.split('').map(n => +n);

function getCoe(repitiion, listLength) {
    const base = [0,1,0,-1];
    const coe = [];

    for(let i=0; i<listLength; i++) {
        const baseIndex = (Math.floor((i + 1) / (repitiion + 1))) % base.length;
        coe[i] = base[baseIndex];
    }
    
    return coe;
}

function product(arr1, arr2) {
    return arr1.map((n, i) => n * arr2[i]);
}

function sumArray(arr) {
    return arr.reduce((p, c) => p + c);
}

function lastDigit(sum) {
    return Math.abs(sum) % 10;
}

console.log(input);
let phase = 0;

while (phase < 100) {
    const newDigits = [];

    for (let repitition=0; repitition<content.length; repitition++) {
        const coe = getCoe(repitition, input.length);
        const output = product(input, coe);
        const sum = sumArray(output);
        const digit = lastDigit(sum);
        newDigits.push(digit);
    }

    input = newDigits;
    phase++;
}

console.log(input.slice(0, 8).join(''));