const fs = require('fs');

const content = fs.readFileSync('input.txt', 'utf-8');
const pixels = content.trim().split('').map(c => +c);

const width = 25;
const height = 6;

// Chunker courtesy of SO: https://stackoverflow.com/a/10456644
Object.defineProperty(Array.prototype, 'chunk', {
    value: function(chunkSize) {
      var R = [];
      for (var i = 0; i < this.length; i += chunkSize)
        R.push(this.slice(i, i + chunkSize));
      return R;
    }
  });

function flatten(layer1, layer2) {
    const newLayer = [];
    for (let i=0; i<layer1.length; i++) {
        if (layer1[i] === 2) {
            newLayer[i] = layer2[i];
        } else {
            newLayer[i] = layer1[i];
        }
    }
    return newLayer;
}

function printLayer(layer) {
    let output = '';
    for(let row=0; row<height; row++) {
        for (let col=0; col<width; col++) {
            const pos = (row * width) + col;
            const pixel = layer[pos];
            switch(pixel) {
                case 0:
                    output += ' ';
                    break;
                case 1:
                    output += '#';
                    break;
            }
        }
        output += '\n';
    }
    return output;
}

const layers = pixels.chunk(width * height);

const combined = layers.reduce(flatten);

console.log(printLayer(combined));
