// Stockfish wrapper for chess engine
class StockfishEngine {
    constructor() {
        this.worker = null;
        this.ready = false;
        this.depth = 10;
        this.onBestMove = null;
    }

    init() {
        return new Promise((resolve) => {
            // Use Stockfish.js from CDN via web worker
            const workerScript = `
                importScripts('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js');
                
                let stockfish = null;
                
                self.onmessage = function(e) {
                    const message = e.data;
                    
                    if (message === 'init') {
                        if (typeof STOCKFISH === 'function') {
                            stockfish = STOCKFISH();
                            stockfish.onmessage = function(msg) {
                                self.postMessage(msg);
                            };
                            stockfish.postMessage('uci');
                        }
                    } else if (stockfish) {
                        stockfish.postMessage(message);
                    }
                };
            `;

            const blob = new Blob([workerScript], { type: 'application/javascript' });
            this.worker = new Worker(URL.createObjectURL(blob));

            this.worker.onmessage = (e) => {
                const message = e.data;
                
                if (message.includes('uciok')) {
                    this.ready = true;
                    this.worker.postMessage('setoption name Skill Level value ' + this.depth);
                    this.worker.postMessage('isready');
                    resolve();
                }
                
                if (message.includes('bestmove')) {
                    const match = message.match(/bestmove\s+(\w+)/);
                    if (match && this.onBestMove) {
                        this.onBestMove(match[1]);
                    }
                }
            };

            this.worker.postMessage('init');
        });
    }

    setDifficulty(level) {
        // Easy: 1-5, Medium: 10, Hard: 20
        this.depth = level;
        if (this.worker && this.ready) {
            this.worker.postMessage('setoption name Skill Level value ' + this.depth);
        }
    }

    getBestMove(fen, callback) {
        if (!this.ready) {
            console.error('Stockfish not ready');
            return;
        }

        this.onBestMove = callback;
        this.worker.postMessage('position fen ' + fen);
        this.worker.postMessage('go depth ' + Math.min(this.depth, 15));
    }

    stop() {
        if (this.worker) {
            this.worker.postMessage('stop');
        }
    }

    terminate() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
            this.ready = false;
        }
    }
}
