/**
 * DOSTOEVSKY CHESS - Quote Manager
 * Literary quotes from Fyodor Dostoevsky's works
 */

class QuoteManager {
    constructor() {
        this.quotes = [
            // Crime and Punishment
            {
                text: "Pain and suffering are always inevitable for a large intelligence and a deep heart.",
                source: "Crime and Punishment"
            },
            {
                text: "The darker the night, the brighter the stars, The deeper the grief, the closer is God!",
                source: "Crime and Punishment"
            },
            {
                text: "To go wrong in one's own way is better than to go right in someone else's.",
                source: "Crime and Punishment"
            },
            {
                text: "Man grows used to everything, the scoundrel!",
                source: "Crime and Punishment"
            },
            {
                text: "Power is given only to him who dares to stoop and take it.",
                source: "Crime and Punishment"
            },
            {
                text: "Taking a new step, uttering a new word, is what people fear most.",
                source: "Crime and Punishment"
            },
            {
                text: "It takes something more than intelligence to act intelligently.",
                source: "Crime and Punishment"
            },
            {
                text: "Man is sometimes extraordinarily, passionately, in love with suffering.",
                source: "Crime and Punishment"
            },

            // The Brothers Karamazov
            {
                text: "The soul is healed by being with children.",
                source: "The Brothers Karamazov"
            },
            {
                text: "Above all, don't lie to yourself.",
                source: "The Brothers Karamazov"
            },
            {
                text: "Love in action is a harsh and dreadful thing compared with love in dreams.",
                source: "The Brothers Karamazov"
            },
            {
                text: "If God does not exist, everything is permitted.",
                source: "The Brothers Karamazov"
            },
            {
                text: "The mystery of human existence lies not in just staying alive, but in finding something to live for.",
                source: "The Brothers Karamazov"
            },
            {
                text: "I love mankind, but I find to my amazement that the more I love mankind as a whole, the less I love man in particular.",
                source: "The Brothers Karamazov"
            },
            {
                text: "What is hell? I maintain that it is the suffering of being unable to love.",
                source: "The Brothers Karamazov"
            },
            {
                text: "A man who lies to himself is often the first to take offense.",
                source: "The Brothers Karamazov"
            },

            // The Idiot
            {
                text: "Beauty will save the world.",
                source: "The Idiot"
            },
            {
                text: "Don't let us forget that the causes of human actions are usually immeasurably more complex and varied than our subsequent explanations of them.",
                source: "The Idiot"
            },
            {
                text: "It is better to be unhappy and know the worst, than to be happy in a fool's paradise.",
                source: "The Idiot"
            },
            {
                text: "Compassion is the chief law of human existence.",
                source: "The Idiot"
            },
            {
                text: "There is something at the bottom of every new human thought, every thought of genius, or even every earnest thought that springs up in any brain.",
                source: "The Idiot"
            },

            // Notes from Underground
            {
                text: "I am a sick man... I am a spiteful man. I am an unattractive man.",
                source: "Notes from Underground"
            },
            {
                text: "Talking nonsense is the sole privilege mankind possesses over the other organisms.",
                source: "Notes from Underground"
            },
            {
                text: "Every man has reminiscences which he would not tell to everyone, but only to his friends.",
                source: "Notes from Underground"
            },
            {
                text: "Man only likes to count his troubles; he doesn't calculate his happiness.",
                source: "Notes from Underground"
            },
            {
                text: "The best definition of man is: a being that goes on two legs and is ungrateful.",
                source: "Notes from Underground"
            },

            // Demons (The Possessed)
            {
                text: "The secret of human existence is not only to live, but to have something to live for.",
                source: "Demons"
            },
            {
                text: "One can know a man from his laugh, and if you like a man's laugh before you know anything of him, you may say with confidence that he is a good man.",
                source: "Demons"
            },

            // The Gambler
            {
                text: "Money is everything.",
                source: "The Gambler"
            },

            // General wisdom
            {
                text: "To love someone means to see them as God intended them.",
                source: "Various Works"
            },
            {
                text: "Much unhappiness has come into the world because of bewilderment and things left unsaid.",
                source: "Various Works"
            }
        ];

        this.gameOverQuotes = {
            win: [
                { text: "The darker the night, the brighter the stars.", source: "Crime and Punishment" },
                { text: "Power is given only to him who dares to stoop and take it.", source: "Crime and Punishment" },
                { text: "The soul is healed by being with children... and with victory.", source: "The Brothers Karamazov" }
            ],
            lose: [
                { text: "Man grows used to everything, the scoundrel!", source: "Crime and Punishment" },
                { text: "Pain and suffering are always inevitable for a large intelligence and a deep heart.", source: "Crime and Punishment" },
                { text: "It is better to be unhappy and know the worst, than to be happy in a fool's paradise.", source: "The Idiot" }
            ],
            draw: [
                { text: "The mystery of human existence lies not in just staying alive, but in finding something to live for.", source: "The Brothers Karamazov" },
                { text: "Don't let us forget that the causes of human actions are usually immeasurably more complex.", source: "The Idiot" },
                { text: "Compassion is the chief law of human existence.", source: "The Idiot" }
            ]
        };

        this.usedIndices = [];
    }

    getRandomQuote() {
        // Reset if all quotes used
        if (this.usedIndices.length >= this.quotes.length) {
            this.usedIndices = [];
        }

        // Find an unused quote
        let index;
        do {
            index = Math.floor(Math.random() * this.quotes.length);
        } while (this.usedIndices.includes(index));

        this.usedIndices.push(index);
        return this.quotes[index];
    }

    getGameOverQuote(result) {
        let category;
        
        if (result.includes('checkmate') || result.includes('wins') || result.includes('resignation')) {
            // Determine if it's a win or lose for the player
            if (result.includes('White wins') && window.game?.playerColor === 'white' ||
                result.includes('Black wins') && window.game?.playerColor === 'black') {
                category = 'win';
            } else if (result.includes('White wins') || result.includes('Black wins')) {
                category = 'lose';
            } else {
                category = Math.random() > 0.5 ? 'win' : 'lose';
            }
        } else {
            category = 'draw';
        }

        const quotes = this.gameOverQuotes[category];
        return quotes[Math.floor(Math.random() * quotes.length)];
    }

    getQuoteBySource(source) {
        const filtered = this.quotes.filter(q => q.source === source);
        if (filtered.length === 0) return this.getRandomQuote();
        return filtered[Math.floor(Math.random() * filtered.length)];
    }

    getAllSources() {
        const sources = new Set(this.quotes.map(q => q.source));
        return Array.from(sources);
    }
}

// Create global instance
window.quotes = new QuoteManager();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuoteManager;
}
