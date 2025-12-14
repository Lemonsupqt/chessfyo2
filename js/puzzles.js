/**
 * DOSTOEVSKY CHESS - Puzzle Manager
 * Classic chess puzzles with literary themes
 */

class PuzzleManager {
    constructor() {
        this.currentPuzzle = null;
        this.currentMoveIndex = 0;
        this.puzzlesSolved = 0;
        this.puzzlesFailed = 0;
        
        // Classic chess puzzles collection
        this.puzzles = [
            // Mate in 1
            {
                id: 1,
                name: "Raskolnikov's Redemption",
                description: "Find the path to salvation. White to move and mate in 1.",
                fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
                solution: [{ from: { row: 0, col: 7 }, to: { row: 1, col: 5 } }], // Qxf7#
                difficulty: 1,
                theme: "Scholar's Mate",
                quote: { text: "Pain and suffering are always inevitable for a large intelligence and a deep heart.", source: "Crime and Punishment" }
            },
            {
                id: 2,
                name: "The Brothers' Sacrifice",
                description: "Sometimes sacrifice leads to victory. White to move.",
                fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
                solution: [{ from: { row: 5, col: 5 }, to: { row: 1, col: 5 } }], // Qxf7#
                difficulty: 1,
                theme: "Checkmate Pattern",
                quote: { text: "The darker the night, the brighter the stars.", source: "Crime and Punishment" }
            },
            // Mate in 2
            {
                id: 3,
                name: "Ivan's Dilemma",
                description: "The Grand Inquisitor poses a challenge. White mates in 2.",
                fen: "r1b1kb1r/pppp1ppp/5q2/4n3/3KP3/2N3PN/PPP4P/R1BQ1B1R b kq - 0 1",
                solution: [
                    { from: { row: 2, col: 5 }, to: { row: 5, col: 2 } }, // Qc3+
                    { from: { row: 3, col: 3 }, to: { row: 4, col: 4 } }, // Ke5
                    { from: { row: 4, col: 4 }, to: { row: 4, col: 3 } }  // Qd4#
                ],
                difficulty: 2,
                theme: "Queen Checkmate",
                quote: { text: "If God does not exist, everything is permitted.", source: "The Brothers Karamazov" }
            },
            {
                id: 4,
                name: "Myshkin's Innocence",
                description: "Pure of heart, sharp of mind. White to mate in 2.",
                fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 2 3",
                solution: [
                    { from: { row: 5, col: 5 }, to: { row: 1, col: 5 } }, // Qxf7+
                    { from: { row: 0, col: 4 }, to: { row: 1, col: 5 } }, // Kxf7
                    { from: { row: 4, col: 2 }, to: { row: 1, col: 5 } }  // Bxf7#
                ],
                difficulty: 2,
                theme: "Bishop and Queen",
                quote: { text: "Beauty will save the world.", source: "The Idiot" }
            },
            // Tactical puzzles
            {
                id: 5,
                name: "The Underground Man",
                description: "From the depths comes insight. Find the winning move.",
                fen: "r1bqkb1r/ppppnppp/5n2/4p1N1/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 4 4",
                solution: [{ from: { row: 2, col: 6 }, to: { row: 1, col: 5 } }], // Nxf7
                difficulty: 2,
                theme: "Fork",
                quote: { text: "I am a sick man... I am a spiteful man.", source: "Notes from Underground" }
            },
            {
                id: 6,
                name: "Sonya's Faith",
                description: "Through suffering comes salvation. Find the light.",
                fen: "r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5",
                solution: [{ from: { row: 5, col: 5 }, to: { row: 4, col: 6 } }], // Ng5
                difficulty: 2,
                theme: "Attack",
                quote: { text: "To go wrong in one's own way is better than to go right in someone else's.", source: "Crime and Punishment" }
            },
            {
                id: 7,
                name: "Dmitri's Passion",
                description: "Passion drives action. White to play.",
                fen: "r2qkb1r/ppp2ppp/2n1bn2/3pp3/4P3/1PN2N2/PBPP1PPP/R2QKB1R w KQkq - 0 6",
                solution: [{ from: { row: 5, col: 5 }, to: { row: 3, col: 4 } }], // Nxe5
                difficulty: 1,
                theme: "Center Control",
                quote: { text: "I love mankind, but I find to my amazement that the more I love mankind as a whole, the less I love man in particular.", source: "The Brothers Karamazov" }
            },
            {
                id: 8,
                name: "Alyosha's Light",
                description: "Find the path of righteousness.",
                fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
                solution: [{ from: { row: 0, col: 6 }, to: { row: 2, col: 5 } }], // Nf6
                difficulty: 1,
                theme: "Development",
                quote: { text: "Love in action is a harsh and dreadful thing compared with love in dreams.", source: "The Brothers Karamazov" }
            },
            {
                id: 9,
                name: "The Possessed",
                description: "Chaos consumes. Find order in madness.",
                fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP4/PPP2PPP/R1BQK1NR w KQkq - 0 5",
                solution: [{ from: { row: 7, col: 4 }, to: { row: 6, col: 3 } }], // Be3
                difficulty: 2,
                theme: "Development",
                quote: { text: "Talking nonsense is the sole privilege mankind possesses over the other organisms.", source: "Crime and Punishment" }
            },
            {
                id: 10,
                name: "Notes from the Endgame",
                description: "In the final analysis, technique prevails.",
                fen: "8/8/8/4k3/8/2K5/5Q2/8 w - - 0 1",
                solution: [{ from: { row: 5, col: 5 }, to: { row: 3, col: 5 } }], // Qf5+
                difficulty: 3,
                theme: "Queen Endgame",
                quote: { text: "Power is given only to him who dares to stoop and take it.", source: "Crime and Punishment" }
            }
        ];
        
        this.loadProgress();
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem('dostoevsky-puzzles-progress');
            if (saved) {
                const data = JSON.parse(saved);
                this.puzzlesSolved = data.solved || 0;
                this.puzzlesFailed = data.failed || 0;
            }
        } catch (e) {
            console.warn('Could not load puzzle progress');
        }
    }

    saveProgress() {
        try {
            localStorage.setItem('dostoevsky-puzzles-progress', JSON.stringify({
                solved: this.puzzlesSolved,
                failed: this.puzzlesFailed
            }));
        } catch (e) {
            console.warn('Could not save puzzle progress');
        }
    }

    getRandomPuzzle(difficulty = null) {
        let available = this.puzzles;
        
        if (difficulty !== null) {
            available = this.puzzles.filter(p => p.difficulty === difficulty);
        }
        
        if (available.length === 0) {
            available = this.puzzles;
        }
        
        const index = Math.floor(Math.random() * available.length);
        return available[index];
    }

    getPuzzleById(id) {
        return this.puzzles.find(p => p.id === id);
    }

    startPuzzle(puzzle) {
        this.currentPuzzle = puzzle;
        this.currentMoveIndex = 0;
        
        return {
            fen: puzzle.fen,
            name: puzzle.name,
            description: puzzle.description,
            difficulty: puzzle.difficulty,
            quote: puzzle.quote
        };
    }

    checkMove(move) {
        if (!this.currentPuzzle) return { correct: false, message: 'No puzzle active' };
        
        const expectedMove = this.currentPuzzle.solution[this.currentMoveIndex];
        
        const isCorrect = 
            move.from.row === expectedMove.from.row &&
            move.from.col === expectedMove.from.col &&
            move.to.row === expectedMove.to.row &&
            move.to.col === expectedMove.to.col;
        
        if (isCorrect) {
            this.currentMoveIndex++;
            
            if (this.currentMoveIndex >= this.currentPuzzle.solution.length) {
                // Puzzle solved!
                this.puzzlesSolved++;
                this.saveProgress();
                
                return {
                    correct: true,
                    solved: true,
                    message: 'Excellent! Puzzle solved!',
                    quote: this.currentPuzzle.quote
                };
            } else {
                // More moves to go
                return {
                    correct: true,
                    solved: false,
                    message: 'Correct! Continue...',
                    nextMove: this.currentPuzzle.solution[this.currentMoveIndex]
                };
            }
        } else {
            this.puzzlesFailed++;
            this.saveProgress();
            
            return {
                correct: false,
                solved: false,
                message: 'Not quite. Try again.',
                hint: this.getHint()
            };
        }
    }

    getHint() {
        if (!this.currentPuzzle) return null;
        
        const move = this.currentPuzzle.solution[this.currentMoveIndex];
        return {
            from: move.from,
            to: move.to
        };
    }

    getProgress() {
        return {
            solved: this.puzzlesSolved,
            failed: this.puzzlesFailed,
            total: this.puzzles.length,
            accuracy: this.puzzlesSolved + this.puzzlesFailed > 0 
                ? Math.round((this.puzzlesSolved / (this.puzzlesSolved + this.puzzlesFailed)) * 100)
                : 0
        };
    }

    resetProgress() {
        this.puzzlesSolved = 0;
        this.puzzlesFailed = 0;
        this.saveProgress();
    }
}

// Create global instance
window.puzzles = new PuzzleManager();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PuzzleManager;
}
