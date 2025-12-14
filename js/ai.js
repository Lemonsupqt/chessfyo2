class AI {
    constructor() {
        this.worker = null;
        this.isReady = false;
        this.difficulty = 10; // 0-20 (Stockfish skill level)
        this.stockfishUrl = 'js/lib/stockfish.js';
    }

    async init() {
        try {
            this.worker = new Worker(this.stockfishUrl);
            
            this.worker.onmessage = (event) => {
                const line = event.data;
                // console.log('SF:', line);
                if (line === 'uciok') {
                    this.isReady = true;
                } else if (line.startsWith('bestmove')) {
                    const match = line.match(/^bestmove ([a-h][1-8][a-h][1-8])([qrbn])?/);
                    if (match) {
                        const move = {
                            from: match[1].substring(0, 2),
                            to: match[1].substring(2, 4),
                            promotion: match[2] || 'q'
                        };
                        window.gameManager.makeMove(move);
                    }
                }
            };
            
            this.worker.onerror = (e) => { console.error("Worker Error", e); };

            this.worker.postMessage('uci');
            this.worker.postMessage('setoption name Skill Level value ' + this.difficulty);
        } catch (e) {
            console.error("Failed to load Stockfish", e);
            alert("Failed to load AI module. " + e.message);
        }
    }

    setDifficulty(level) {
        // level 0 to 20
        this.difficulty = level;
        if (this.worker) {
            this.worker.postMessage('setoption name Skill Level value ' + this.difficulty);
        }
    }

    makeMove(fen) {
        if (!this.worker || !this.isReady) return;
        this.worker.postMessage('position fen ' + fen);
        this.worker.postMessage('go depth 15'); // Fixed depth for now, or use movetime
    }
}

window.aiPlayer = new AI();
