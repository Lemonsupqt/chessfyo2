const DOSTOEVSKY_QUOTES = [
    "The mystery of human existence lies not in just staying alive, but in finding something to live for.",
    "To go wrong in one's own way is better than to go right in someone else's.",
    "Beauty will save the world.",
    "Pain and suffering are always inevitable for a large intelligence and a deep heart.",
    "Taking a new step, uttering a new word, is what people fear most.",
    "Man is sometimes extraordinarily, passionately, in love with suffering...",
    "If you want to be respected by others, the great thing is to respect yourself.",
    "The cleverest of all, in my opinion, is the man who calls himself a fool at least once a month.",
    "It is better to be unhappy and know the worst, than to be happy in a fool's paradise.",
    "Sarcasm: the last refuge of modest and chaste-souled people when the privacy of their soul is coarsely and intrusively invaded.",
    "The darker the night, the brighter the stars."
];

function getRandomQuote() {
    return DOSTOEVSKY_QUOTES[Math.floor(Math.random() * DOSTOEVSKY_QUOTES.length)];
}

function updateQuote() {
    const quoteBox = document.getElementById('quote-display');
    if (quoteBox) {
        quoteBox.style.opacity = 0;
        setTimeout(() => {
            quoteBox.innerText = `"${getRandomQuote()}"`;
            quoteBox.style.opacity = 1;
        }, 500);
    }
}

// Initial quote
document.addEventListener('DOMContentLoaded', () => {
    updateQuote();
    // Rotate quotes every 30 seconds if idle? Maybe annoying. Let's just do it on game events.
});

// Expose to global scope
window.Theme = {
    updateQuote
};
