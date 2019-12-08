const fs = require('fs');

const content = fs.readFileSync('input.txt', 'utf-8');
const pixels = content.trim().split('').map(c => +c);

// Chunker courtesy of SO: https://stackoverflow.com/a/10456644
Object.defineProperty(Array.prototype, 'chunk', {
    value: function(chunkSize) {
      var R = [];
      for (var i = 0; i < this.length; i += chunkSize)
        R.push(this.slice(i, i + chunkSize));
      return R;
    }
  });

function count(arr, predicate) {
    return arr.reduce((p, c) => predicate(c) ? p + 1 : p, 0);
}

const width = 25;
const height = 6;

const layers = pixels.chunk(width * height);

let layerWithFewestZeros;
let minZeros = Infinity;

layers.forEach(layer => {
    const zeros = count(layer, p => p === 0);
    if (zeros < minZeros) {
        layerWithFewestZeros = layer;
        minZeros = zeros;
    }
});

const ones = count(layerWithFewestZeros, p => p === 1);
const twos = count(layerWithFewestZeros, p => p === 2);

console.log(ones * twos);