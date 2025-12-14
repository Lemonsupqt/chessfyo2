// Stockfish Web Worker Wrapper
// This file provides a simple interface to Stockfish.js

class StockfishEngine {
    constructor() {
        this.engine = null;
        this.ready = false;
        this.onMessage = null;
        this.messageQueue = [];
    }

    init() {
        return new Promise((resolve, reject) => {
            try {
                // Load Stockfish from CDN
                if (typeof STOCKFISH === 'undefined') {
                    // Fallback: use Stockfish.js from CDN via worker
                    this.engine = new Worker('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js');
                } else {
                    this.engine = STOCKFISH();
                }

                this.engine.onmessage = (event) => {
                    const message = event.data || event;
                    
                    if (message === 'uciok') {
                        this.ready = true;
                        resolve();
                    }
                    
                    if (this.onMessage) {
                        this.onMessage(message);
                    }
                };

                this.engine.onerror = (error) => {
                    console.error('Stockfish error:', error);
                    reject(error);
                };

                // Initialize UCI
                this.send('uci');
            } catch (error) {
                console.error('Failed to initialize Stockfish:', error);
                reject(error);
            }
        });
    }

    send(command) {
        if (this.engine) {
            this.engine.postMessage(command);
        }
    }

    setPosition(fen) {
        this.send(`position fen ${fen}`);
    }

    setPositionMoves(moves) {
        this.send(`position startpos moves ${moves}`);
    }

    async getBestMove(difficulty = 10) {
        return new Promise((resolve) => {
            const depth = difficulty;
            let bestMove = null;

            const originalHandler = this.onMessage;
            this.onMessage = (message) => {
                if (originalHandler) originalHandler(message);
                
                if (typeof message === 'string' && message.startsWith('bestmove')) {
                    const parts = message.split(' ');
                    bestMove = parts[1];
                    this.onMessage = originalHandler;
                    resolve(bestMove);
                }
            };

            this.send(`go depth ${depth}`);
        });
    }

    stop() {
        this.send('stop');
    }

    quit() {
        if (this.engine) {
            this.send('quit');
            if (this.engine.terminate) {
                this.engine.terminate();
            }
        }
    }
}

// Export for use in main game file
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StockfishEngine;
}
