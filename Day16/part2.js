let content = '59787832768373756387231168493208357132958685401595722881580547807942982606755215622050260150447434057354351694831693219006743316964757503791265077635087624100920933728566402553345683177887856750286696687049868280429551096246424753455988979991314240464573024671106349865911282028233691096263590173174821612903373057506657412723502892841355947605851392899875273008845072145252173808893257256280602945947694349746967468068181317115464342687490991674021875199960420015509224944411706393854801616653278719131946181597488270591684407220339023716074951397669948364079227701367746309535060821396127254992669346065361442252620041911746738651422249005412940728';
//content = '12345678';
//content = '80871224585914546619083218645595';
//content = '03036732577212944063491565474664';
content = '12345';
//const CONTENT_REPLICATIONS = 10000;
const CONTENT_REPLICATIONS = 10;

let input = '';
for(let i=0; i<CONTENT_REPLICATIONS; i++) input += content;

function* getCoe(repitiion, listLength, offset) {
    const base = [0,1,0,-1];
    let i = 0;

    while (true) {
        const baseIndex = (Math.floor((i + offset) / (repitiion + 1))) % base.length;
        yield base[baseIndex];
        i++;
    }
}

function lastDigit(sum) {
    return Math.abs(sum) % 10;
}

let phase = 0;

while (phase < 10) {
    let newDigits = '';
    for (let repitition=0; repitition<input.length; repitition++) {
        let sum = 0;
        const coeIterator = getCoe(repitition, input.length, 1);
        const products = input.split('').map(v => Math.abs(v * coeIterator.next().value));
        sum += products.reduce((p, c) => p + c);
        console.log(products.join(','));

        // for (let i=0; i<input.length; i++) {
        //     const coe = coeIterator.next().value;
        //     sum += input[i] * coe;
        // }

        newDigits += lastDigit(sum).toString();
    }

    input = newDigits;
    phase++;
    console.log('');
}

const offset = (input.substring(0,7) * 1);
console.log(offset);
const val = input.substring(offset, offset + 7);
console.log(val);

console.log(input.substring(0,8));