/**
 * THE GRAND INQUISITOR'S CHESS
 * Stockfish Engine Wrapper
 */

class StockfishEngine {
    constructor() {
        this.worker = null;
        this.isReady = false;
        this.isAnalyzing = false;
        this.onReady = null;
        this.onBestMove = null;
        this.onAnalysis = null;
        this.currentDepth = 0;
        this.skillLevel = 10;
    }

    /**
     * Initialize the Stockfish engine
     */
    async init() {
        return new Promise((resolve, reject) => {
            try {
                // Use the CDN version of Stockfish.js
                this.worker = new Worker('https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js');
                
                this.worker.onmessage = (e) => {
                    this.handleMessage(e.data);
                };
                
                this.worker.onerror = (e) => {
                    console.error('Stockfish worker error:', e);
                    reject(e);
                };
                
                // Send UCI initialization
                this.send('uci');
                
                // Set a timeout for initialization
                setTimeout(() => {
                    if (!this.isReady) {
                        console.warn('Stockfish initialization timeout, proceeding anyway');
                        this.isReady = true;
                        resolve();
                    }
                }, 5000);
                
                // Wait for UCI OK
                this._resolveInit = resolve;
            } catch (error) {
                console.error('Failed to initialize Stockfish:', error);
                reject(error);
            }
        });
    }

    /**
     * Handle messages from the Stockfish worker
     */
    handleMessage(message) {
        // console.log('Stockfish:', message);
        
        if (message === 'uciok') {
            this.send('isready');
        }
        
        if (message === 'readyok') {
            this.isReady = true;
            if (this._resolveInit) {
                this._resolveInit();
                this._resolveInit = null;
            }
            if (this.onReady) {
                this.onReady();
            }
        }
        
        // Parse best move
        if (message.startsWith('bestmove')) {
            const parts = message.split(' ');
            const bestMove = parts[1];
            const ponderMove = parts[3] || null;
            
            this.isAnalyzing = false;
            
            if (this.onBestMove) {
                this.onBestMove(bestMove, ponderMove);
            }
        }
        
        // Parse analysis info
        if (message.startsWith('info') && message.includes('score')) {
            const analysis = this.parseAnalysis(message);
            if (analysis && this.onAnalysis) {
                this.onAnalysis(analysis);
            }
        }
    }

    /**
     * Parse analysis output from Stockfish
     */
    parseAnalysis(message) {
        const analysis = {};
        
        // Parse depth
        const depthMatch = message.match(/depth (\d+)/);
        if (depthMatch) {
            analysis.depth = parseInt(depthMatch[1]);
        }
        
        // Parse score (centipawns or mate)
        const scoreMatch = message.match(/score (cp|mate) (-?\d+)/);
        if (scoreMatch) {
            analysis.scoreType = scoreMatch[1];
            analysis.scoreValue = parseInt(scoreMatch[2]);
            
            if (analysis.scoreType === 'cp') {
                analysis.eval = (analysis.scoreValue / 100).toFixed(2);
            } else {
                analysis.eval = 'M' + analysis.scoreValue;
            }
        }
        
        // Parse principal variation (best line)
        const pvMatch = message.match(/ pv (.+)/);
        if (pvMatch) {
            analysis.pv = pvMatch[1].split(' ');
        }
        
        // Parse nodes
        const nodesMatch = message.match(/nodes (\d+)/);
        if (nodesMatch) {
            analysis.nodes = parseInt(nodesMatch[1]);
        }
        
        // Parse time
        const timeMatch = message.match(/time (\d+)/);
        if (timeMatch) {
            analysis.time = parseInt(timeMatch[1]);
        }
        
        return analysis;
    }

    /**
     * Send a command to Stockfish
     */
    send(command) {
        if (this.worker) {
            this.worker.postMessage(command);
        }
    }

    /**
     * Set the skill level (0-20)
     */
    setSkillLevel(level) {
        this.skillLevel = Math.max(0, Math.min(20, level));
        this.send(`setoption name Skill Level value ${this.skillLevel}`);
        
        // For lower levels, also limit search depth and add some randomness
        if (this.skillLevel < 5) {
            this.send('setoption name Slow Mover value 10');
        } else if (this.skillLevel < 10) {
            this.send('setoption name Slow Mover value 50');
        } else {
            this.send('setoption name Slow Mover value 100');
        }
    }

    /**
     * Get the best move for a position
     */
    getBestMove(fen, options = {}) {
        return new Promise((resolve) => {
            if (!this.isReady) {
                console.warn('Stockfish not ready');
                resolve(null);
                return;
            }
            
            this.isAnalyzing = true;
            
            // Store the callback
            this.onBestMove = (move, ponder) => {
                this.onBestMove = null;
                resolve({ move, ponder });
            };
            
            // Set position
            this.send(`position fen ${fen}`);
            
            // Calculate depth based on skill level
            let depth = Math.max(1, Math.floor(this.skillLevel / 2) + 3);
            if (options.depth) depth = options.depth;
            
            // Calculate move time based on skill level
            let moveTime = 500 + (this.skillLevel * 100);
            if (options.moveTime) moveTime = options.moveTime;
            
            // Start search
            if (options.infinite) {
                this.send('go infinite');
            } else if (options.depth) {
                this.send(`go depth ${depth}`);
            } else {
                this.send(`go movetime ${moveTime}`);
            }
        });
    }

    /**
     * Start continuous analysis
     */
    startAnalysis(fen) {
        if (!this.isReady) return;
        
        this.stopAnalysis();
        this.isAnalyzing = true;
        this.send(`position fen ${fen}`);
        this.send('go infinite');
    }

    /**
     * Stop analysis
     */
    stopAnalysis() {
        if (this.isAnalyzing) {
            this.send('stop');
            this.isAnalyzing = false;
        }
    }

    /**
     * Clean up
     */
    destroy() {
        this.stopAnalysis();
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
        this.isReady = false;
    }

    /**
     * Convert UCI move format to object
     */
    static parseUciMove(uciMove) {
        if (!uciMove || uciMove.length < 4) return null;
        
        return {
            from: uciMove.substring(0, 2),
            to: uciMove.substring(2, 4),
            promotion: uciMove.length > 4 ? uciMove[4] : undefined
        };
    }
}

// Export for use in other modules
window.StockfishEngine = StockfishEngine;
