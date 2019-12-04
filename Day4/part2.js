// Input - 134792-675810
const min = 134792;
const max = 675810;

function toArray(num) {
    const digits = new Array(6).fill(0);
    for (let i=5; i>=0; i--) {
        digits[i] = num % 10;
        num = ~~(num / 10);
    }
    return digits;
}

const isNonDecreasing = nums => !nums.some((v, i) => i > 0 && v < nums[i-1]);

function hasDouble(arr) {
    let repeats = 1;
    for (let i=1; i<arr.length; i++) {
        if (arr[i] === arr[i-1]) {
            repeats++
        } else {
            if (repeats === 2) return true;
            repeats = 1;
        }
    }

    return repeats === 2;
}

const allNumbers = Array.from({length: max - min + 1}, (_, i) => min + i);

const count = allNumbers.reduce((p, c, i) => {
    const arr = toArray(c);
    const isValid = isNonDecreasing(arr) && hasDouble(arr);
    return isValid ? p + 1 : p;
}, 0);

console.log(count);
