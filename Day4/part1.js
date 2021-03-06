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
const hasRepeat = nums => nums.some((v, i, arr) => i > 0 && v === arr[i-1]);

const allNumbers = Array.from({length: max - min + 1}, (_, i) => min + i);

const count = allNumbers.reduce((p, c, i) => {
    const arr = toArray(c);
    const isValid = isNonDecreasing(arr) && hasRepeat(arr);
    return isValid ? p + 1 : p;
}, 0);

console.log(count);