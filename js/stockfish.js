/**
 * Stockfish AI Engine Integration - The Brothers Gambit
 * Wrapper for Stockfish.js to play against AI
 */

class StockfishEngine {
    constructor() {
        this.engine = null;
        this.ready = false;
        this.thinking = false;
        this.onReady = null;
        this.onBestMove = null;
        this.onThinking = null;
        this.currentDepth = 10;
        this.moveTime = 1000; // ms to think per move
        
        this.init();
    }

    init() {
        try {
            // Try to use Web Worker version for better performance
            if (typeof STOCKFISH === 'function') {
                this.engine = STOCKFISH();
            } else if (typeof Stockfish === 'function') {
                this.engine = new Stockfish();
            } else {
                // Fallback: try creating a worker
                this.engine = new Worker('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js');
            }
            
            this.setupMessageHandler();
            this.sendCommand('uci');
        } catch (error) {
            console.error('Failed to initialize Stockfish:', error);
            // Create a fallback simple AI
            this.useFallbackAI = true;
            this.ready = true;
            if (this.onReady) this.onReady();
        }
    }

    setupMessageHandler() {
        const handleMessage = (data) => {
            const message = typeof data === 'string' ? data : data.data;
            
            if (message === 'uciok') {
                this.sendCommand('isready');
            } else if (message === 'readyok') {
                this.ready = true;
                if (this.onReady) this.onReady();
            } else if (message.startsWith('bestmove')) {
                this.thinking = false;
                const parts = message.split(' ');
                const bestMove = parts[1];
                if (this.onBestMove && bestMove && bestMove !== '(none)') {
                    this.onBestMove(this.parseMove(bestMove));
                }
            } else if (message.startsWith('info')) {
                // Parse thinking info
                if (this.onThinking && message.includes('depth')) {
                    const depthMatch = message.match(/depth (\d+)/);
                    const scoreMatch = message.match(/score (cp|mate) (-?\d+)/);
                    const pvMatch = message.match(/pv (.+)/);
                    
                    if (depthMatch || scoreMatch) {
                        this.onThinking({
                            depth: depthMatch ? parseInt(depthMatch[1]) : null,
                            score: scoreMatch ? {
                                type: scoreMatch[1],
                                value: parseInt(scoreMatch[2])
                            } : null,
                            pv: pvMatch ? pvMatch[1].split(' ').slice(0, 5) : []
                        });
                    }
                }
            }
        };

        if (this.engine.onmessage !== undefined) {
            this.engine.onmessage = (e) => handleMessage(e.data);
        } else if (this.engine.addMessageListener) {
            this.engine.addMessageListener(handleMessage);
        } else {
            // Direct function call interface
            this.engine.onmessage = handleMessage;
        }
    }

    sendCommand(cmd) {
        if (this.useFallbackAI) return;
        
        try {
            if (this.engine.postMessage) {
                this.engine.postMessage(cmd);
            } else if (typeof this.engine === 'function') {
                this.engine(cmd);
            }
        } catch (error) {
            console.error('Failed to send command to Stockfish:', error);
        }
    }

    parseMove(uciMove) {
        // Parse UCI move format (e.g., 'e2e4', 'e7e8q')
        return {
            from: uciMove.substring(0, 2),
            to: uciMove.substring(2, 4),
            promotion: uciMove.length > 4 ? uciMove[4] : null
        };
    }

    setDifficulty(level) {
        // Level 1-20
        // Adjust skill level, depth, and move time based on level
        if (level <= 5) {
            this.currentDepth = level + 2;
            this.moveTime = 200 + level * 100;
            this.sendCommand(`setoption name Skill Level value ${level}`);
        } else if (level <= 10) {
            this.currentDepth = level + 3;
            this.moveTime = 500 + (level - 5) * 200;
            this.sendCommand(`setoption name Skill Level value ${level}`);
        } else if (level <= 15) {
            this.currentDepth = level + 2;
            this.moveTime = 1000 + (level - 10) * 300;
            this.sendCommand(`setoption name Skill Level value ${level}`);
        } else {
            this.currentDepth = 18 + (level - 15);
            this.moveTime = 2000 + (level - 15) * 500;
            this.sendCommand(`setoption name Skill Level value 20`);
        }
    }

    findBestMove(fen, callback) {
        if (this.useFallbackAI) {
            // Simple fallback: random legal move
            setTimeout(() => {
                if (callback) callback(null);
            }, 500);
            return;
        }

        this.onBestMove = callback;
        this.thinking = true;
        
        this.sendCommand('ucinewgame');
        this.sendCommand(`position fen ${fen}`);
        this.sendCommand(`go depth ${this.currentDepth} movetime ${this.moveTime}`);
    }

    stop() {
        this.sendCommand('stop');
        this.thinking = false;
    }

    quit() {
        this.sendCommand('quit');
    }

    // Analyze position without making a move
    analyze(fen, depth = 20, callback) {
        this.onThinking = callback;
        this.sendCommand('ucinewgame');
        this.sendCommand(`position fen ${fen}`);
        this.sendCommand(`go depth ${depth}`);
    }

    stopAnalysis() {
        this.stop();
        this.onThinking = null;
    }
}

// Export
window.StockfishEngine = StockfishEngine;
