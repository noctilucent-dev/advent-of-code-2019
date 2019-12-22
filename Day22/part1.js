const fs = require('fs');

function cut(deck, n) {
    return deck.slice(n).concat(deck.slice(0, n));
}

function dealWithIncrement(deck, increment) {
    const newDeck = new Array(deck.length);
    for(let i=0; i<deck.length; i++) {
        newDeck[(i * increment) % deck.length] = deck[i];
    }
    return newDeck;
}

function checkDeck(deck) {
    const check = new Array(deck.length);
    for(let i=0; i<deck.length; i++) {
        const num = deck[i];
        if (check[num]) throw new Error(`${num} appears more than once`);
        check[num] = 1;
    }
    for(let i=0; i<deck.length; i++) {
        if(!check[i]) throw new Error(`${i} did not appear in the deck`);
    }

    console.log('Deck OK');
}

let content = fs.readFileSync('input.txt', 'utf-8');
const lines = content.trim().split('\n');
let deck = Array.from(Array(10007).keys());

for(let i=0; i<lines.length; i++) {
    const line = lines[i];
    if(line === 'deal into new stack') {
        deck.reverse();
    } else if (line.startsWith('cut')) {
        const n = Number(line.substring(4));
        deck = cut(deck, n);
    } else if (line.startsWith('deal with increment')) {
        const increment = Number(line.substring(20))
        deck = dealWithIncrement(deck, increment);
    } else {
        throw new Exception(`Unrecognised command '${line}'`);
    }
}

// Make sure we haven't made any mistakes
checkDeck(deck);

// Find the position of number 2019
const i = deck.findIndex(n => n === 2019);
console.log(`2019 at position ${i}`);

