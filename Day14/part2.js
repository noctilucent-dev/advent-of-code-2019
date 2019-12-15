// let content = `10 ORE => 10 A
// 1 ORE => 1 B
// 7 A, 1 B => 1 C
// 7 A, 1 C => 1 D
// 7 A, 1 D => 1 E
// 7 A, 1 E => 1 FUEL`;

// let content = `157 ORE => 5 NZVS
// 165 ORE => 6 DCFZ
// 44 XJWVT, 5 KHKGT, 1 QDVJ, 29 NZVS, 9 GPVTF, 48 HKGWZ => 1 FUEL
// 12 HKGWZ, 1 GPVTF, 8 PSHF => 9 QDVJ
// 179 ORE => 7 PSHF
// 177 ORE => 5 HKGWZ
// 7 DCFZ, 7 PSHF => 2 XJWVT
// 165 ORE => 2 GPVTF
// 3 DCFZ, 7 NZVS, 5 HKGWZ, 10 PSHF => 8 KHKGT`;

let content = `10 LSZLT, 29 XQJK => 4 BMRQJ
22 HCKS => 1 GQKCZ
1 HCKS, 8 WZWRV, 18 HVZR => 7 BGFR
1 LSZLT, 1 WRKJ, 3 LJFP, 3 RNLPB, 1 NZGK, 3 LDSV, 5 RJDN, 8 HGFGC => 3 QZTXD
1 BRSGQ, 1 XGLF, 1 ZHSK, 20 LSZLT, 16 WFCPT, 3 KTWV, 1 QRJC => 4 XPKX
1 DCLR, 6 RNLPB => 5 HCKS
1 HFHFV => 3 SHLMF
2 LTMZQ, 21 FGCXN => 6 QKFKV
3 BGFR => 7 WRKJ
3 KHSB => 2 XQJL
3 SHLMF => 2 LPLG
12 SVHWT, 20 BXPSZ => 9 NBMF
2 FGCXN, 32 DCSVN => 8 TBDWZ
1 KHSB, 3 HGFGC => 6 WZWRV
27 WFCPT, 4 KTWV, 14 BRSGQ, 1 MFNK, 1 WRKJ, 2 NZGK, 24 FBFLK => 5 TRLCK
2 SVHWT => 3 QRJC
1 MNVR, 1 FKBMW => 2 FGCXN
4 GJXW => 9 JXFS
3 XQJK => 5 WNJM
1 WZVWZ, 1 XQJL => 9 SHKJV
2 DCSVN => 4 HDVC
2 GJXW => 2 RNLPB
1 QKFKV, 1 PBRWB => 5 WTZQ
14 QKFKV => 6 RDFTD
166 ORE => 1 QDSXV
2 DCSVN => 5 BXPSZ
113 ORE => 6 LTMZQ
13 MNVR => 7 RJDN
2 NZGK, 9 XQJK, 18 WRKJ => 9 KTWV
1 NZGK => 8 XQJK
6 RZCGN, 6 HDVC, 1 DLKR => 9 DSLXW
18 HVZR => 8 LJFP
7 XQJL => 1 NPDS
15 DLKR, 1 DSLXW, 26 MJFVP => 3 FBFLK
125 ORE => 9 MNVR
3 RJDN => 4 HFHFV
1 TBDWZ, 1 DCLR => 2 HVZR
2 SHKJV => 5 GJXW
7 LTMZQ, 1 QDSXV, 1 FKBMW => 3 DCSVN
9 LPLG, 11 JXFS => 3 BRSGQ
5 JXFS, 1 ZHSK, 25 XGLF => 4 MFNK
5 PBRWB => 2 SVHWT
15 SHKJV => 5 XGLF
1 XQJL, 2 NPDS => 4 DLKR
39 JXFS => 5 KSHF
6 GJXW, 1 FBFLK => 7 HGFGC
3 JXFS => 1 LSZLT
3 NBMF, 1 BMRQJ => 2 LDSV
1 JXFS, 25 GJXW, 10 HGFGC => 4 NZGK
8 QZTXD, 26 KSHF, 60 WNJM, 6 GJXW, 9 TRLCK, 20 XPKX, 21 FGCXN, 57 GQKCZ, 6 WRKJ => 1 FUEL
4 SVHWT, 1 RZCGN => 3 ZHSK
1 BXPSZ => 7 DCLR
8 RDFTD, 1 SHKJV, 1 HFHFV => 6 MJFVP
1 LTMZQ => 9 KHSB
5 WTZQ, 4 HGFGC, 4 HCKS => 9 WFCPT
184 ORE => 4 FKBMW
4 XQJL => 3 WZVWZ
12 QDSXV => 9 RZCGN
1 FBFLK, 7 HVZR => 9 PBRWB`;

const lines = content.split('\n');

function parseElement(elem) {
    elem = elem.trim();
    const [quant, e] = elem.split(' ');
    return [e, +quant];
}

const reactions = {};

lines.forEach(l => {
    const sides = l.split('=>');
    const [product, quantity] = parseElement(sides[1]);
    const reactants = sides[0].split(',').map(parseElement);
    reactions[product] = {
        quantity,
        reactants
    };
});

function oreOnly(quantities) {
    return !Object.keys(quantities).some(e => {
        return e !== 'ORE' && quantities[e] > 0;
    });
}

function calculateOre(quantities) {
    while (!oreOnly(quantities)) {
        const product = Object.keys(quantities).find(p => p !== 'ORE' && quantities[p] > 0);

        const toProduce = quantities[product];
        const producedPerReaction = reactions[product].quantity;
        const reactionsRequired = Math.ceil(toProduce / producedPerReaction);

        quantities[product] -= producedPerReaction * reactionsRequired;

        reactions[product].reactants.forEach(rq => {
            const [r, q] = rq;
            if (!quantities[r]) quantities[r] = 0;
            quantities[r] += q * reactionsRequired;
        });
    }

    return quantities;
}

const ONE_TRILLION = 1000000000000;
const MIN_ORE_PER_FIELD = 337862; // answer from part1
const FUEL_UPPER_BOUND = Math.ceil(ONE_TRILLION / MIN_ORE_PER_FIELD) * 2;

// Binary search for correct fuel quantity
let start = 1;
let end = FUEL_UPPER_BOUND;

while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    const quantities = {FUEL: mid};
    const oreRequired = calculateOre(quantities).ORE;

    if (oreRequired > ONE_TRILLION) {
        end = mid - 1;
    } else {
        start = mid + 1;
    }
}

// Unless fuel requires exactly 1T ore, binary search will stop when start and end swap
// Fuel generated will always be the lower value
console.log(Math.min(start, end));

