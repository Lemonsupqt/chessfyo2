/**
 * Stockfish AI Wrapper - The Brothers Chess
 * Handles communication with Stockfish chess engine
 */

class StockfishEngine {
    constructor() {
        this.worker = null;
        this.isReady = false;
        this.isThinking = false;
        this.onBestMove = null;
        this.onEvaluation = null;
        this.currentDepth = 10;
        this.evaluationEnabled = true;
        
        // Difficulty settings (depth and skill level)
        this.difficulties = {
            easy: { depth: 3, skill: 0, moveTime: 500 },
            medium: { depth: 8, skill: 10, moveTime: 1000 },
            hard: { depth: 12, skill: 15, moveTime: 2000 },
            master: { depth: 18, skill: 20, moveTime: 3000 }
        };
        
        this.init();
    }
    
    /**
     * Initialize Stockfish worker
     */
    async init() {
        try {
            // Try to load Stockfish from CDN
            const stockfishUrls = [
                'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js',
                'https://cdn.jsdelivr.net/npm/stockfish@14.0.0/src/stockfish.js',
                'https://unpkg.com/stockfish/src/stockfish.js'
            ];
            
            // Create a blob worker that can load external scripts
            const workerCode = `
                let stockfish = null;
                
                self.onmessage = async function(e) {
                    if (e.data.type === 'init') {
                        try {
                            // Import stockfish
                            importScripts(e.data.url);
                            
                            // Initialize stockfish
                            if (typeof STOCKFISH === 'function') {
                                stockfish = STOCKFISH();
                                stockfish.onmessage = function(msg) {
                                    self.postMessage({ type: 'stockfish', data: msg });
                                };
                                stockfish.postMessage('uci');
                            } else if (typeof Stockfish === 'function') {
                                stockfish = Stockfish();
                                stockfish.addMessageListener(function(msg) {
                                    self.postMessage({ type: 'stockfish', data: msg });
                                });
                                stockfish.postMessage('uci');
                            }
                        } catch (err) {
                            self.postMessage({ type: 'error', data: err.message });
                        }
                    } else if (e.data.type === 'command' && stockfish) {
                        if (stockfish.postMessage) {
                            stockfish.postMessage(e.data.command);
                        }
                    }
                };
            `;
            
            // For simplicity, we'll use a basic implementation that works offline
            // This creates a simulated AI when Stockfish can't load
            this.initFallbackAI();
            
            // Try to load real Stockfish in background
            this.tryLoadStockfish(stockfishUrls);
            
        } catch (error) {
            console.log('Stockfish initialization error, using fallback AI:', error);
            this.initFallbackAI();
        }
    }
    
    /**
     * Try to load Stockfish from URLs
     */
    async tryLoadStockfish(urls) {
        for (const url of urls) {
            try {
                // Create web worker with stockfish
                const workerBlob = new Blob([`
                    importScripts('${url}');
                    
                    let engine = null;
                    
                    // Handle different Stockfish versions
                    if (typeof STOCKFISH === 'function') {
                        engine = STOCKFISH();
                        engine.onmessage = function(event) {
                            postMessage(event);
                        };
                    } else if (typeof Stockfish === 'function') {
                        engine = Stockfish();
                        engine.addMessageListener(function(line) {
                            postMessage(line);
                        });
                    }
                    
                    onmessage = function(e) {
                        if (engine) {
                            engine.postMessage(e.data);
                        }
                    };
                `], { type: 'application/javascript' });
                
                const workerUrl = URL.createObjectURL(workerBlob);
                const testWorker = new Worker(workerUrl);
                
                // Test if it works
                const works = await new Promise((resolve) => {
                    const timeout = setTimeout(() => resolve(false), 3000);
                    testWorker.onmessage = (e) => {
                        const msg = typeof e.data === 'string' ? e.data : e.data?.data;
                        if (msg && msg.includes('uciok')) {
                            clearTimeout(timeout);
                            resolve(true);
                        }
                    };
                    testWorker.onerror = () => {
                        clearTimeout(timeout);
                        resolve(false);
                    };
                    testWorker.postMessage('uci');
                });
                
                if (works) {
                    this.worker = testWorker;
                    this.setupWorkerHandlers();
                    this.isReady = true;
                    console.log('Stockfish loaded successfully from:', url);
                    return;
                } else {
                    testWorker.terminate();
                    URL.revokeObjectURL(workerUrl);
                }
            } catch (e) {
                console.log('Failed to load Stockfish from:', url);
            }
        }
        
        console.log('Using fallback AI - Stockfish could not be loaded');
    }
    
    /**
     * Setup worker message handlers
     */
    setupWorkerHandlers() {
        this.worker.onmessage = (e) => {
            const message = typeof e.data === 'string' ? e.data : e.data?.data;
            if (!message) return;
            
            // Parse best move
            if (message.startsWith('bestmove')) {
                const parts = message.split(' ');
                const move = parts[1];
                this.isThinking = false;
                
                if (this.onBestMove && move && move !== '(none)') {
                    const from = move.substring(0, 2);
                    const to = move.substring(2, 4);
                    const promotion = move.length > 4 ? move.substring(4, 5) : null;
                    this.onBestMove(from, to, promotion);
                }
            }
            
            // Parse evaluation info
            if (message.startsWith('info') && this.evaluationEnabled) {
                this.parseEvaluation(message);
            }
        };
    }
    
    /**
     * Initialize fallback AI for when Stockfish doesn't load
     */
    initFallbackAI() {
        this.useFallback = true;
        this.isReady = true;
    }
    
    /**
     * Get best move using fallback AI
     */
    getFallbackMove(fen, difficulty) {
        // Simple evaluation-based AI
        const chess = new Chess(fen);
        const moves = chess.moves({ verbose: true });
        
        if (moves.length === 0) return null;
        
        // Evaluate each move
        const evaluatedMoves = moves.map(move => {
            chess.move(move);
            const score = this.evaluatePosition(chess, difficulty);
            chess.undo();
            return { move, score };
        });
        
        // Sort by score (higher is better for the moving side)
        evaluatedMoves.sort((a, b) => b.score - a.score);
        
        // Add some randomness based on difficulty
        const settings = this.difficulties[difficulty] || this.difficulties.medium;
        const randomFactor = 20 - settings.skill; // More randomness for lower skill
        
        // Select from top moves with some randomness
        const topMoves = evaluatedMoves.slice(0, Math.min(5, evaluatedMoves.length));
        const weights = topMoves.map((_, i) => Math.pow(0.5, i * (randomFactor / 10)));
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        
        let random = Math.random() * totalWeight;
        for (let i = 0; i < topMoves.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return topMoves[i].move;
            }
        }
        
        return topMoves[0].move;
    }
    
    /**
     * Simple position evaluation
     */
    evaluatePosition(chess, difficulty) {
        const pieceValues = {
            p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000
        };
        
        // Position tables for better play
        const pawnTable = [
            0,  0,  0,  0,  0,  0,  0,  0,
            50, 50, 50, 50, 50, 50, 50, 50,
            10, 10, 20, 30, 30, 20, 10, 10,
            5,  5, 10, 25, 25, 10,  5,  5,
            0,  0,  0, 20, 20,  0,  0,  0,
            5, -5,-10,  0,  0,-10, -5,  5,
            5, 10, 10,-20,-20, 10, 10,  5,
            0,  0,  0,  0,  0,  0,  0,  0
        ];
        
        const knightTable = [
            -50,-40,-30,-30,-30,-30,-40,-50,
            -40,-20,  0,  0,  0,  0,-20,-40,
            -30,  0, 10, 15, 15, 10,  0,-30,
            -30,  5, 15, 20, 20, 15,  5,-30,
            -30,  0, 15, 20, 20, 15,  0,-30,
            -30,  5, 10, 15, 15, 10,  5,-30,
            -40,-20,  0,  5,  5,  0,-20,-40,
            -50,-40,-30,-30,-30,-30,-40,-50
        ];
        
        let score = 0;
        const board = chess.board();
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (!piece) continue;
                
                const value = pieceValues[piece.type];
                const squareIndex = piece.color === 'w' ? row * 8 + col : (7 - row) * 8 + col;
                
                let positionBonus = 0;
                if (piece.type === 'p') {
                    positionBonus = pawnTable[squareIndex];
                } else if (piece.type === 'n') {
                    positionBonus = knightTable[squareIndex];
                }
                
                if (piece.color === 'w') {
                    score += value + positionBonus;
                } else {
                    score -= value + positionBonus;
                }
            }
        }
        
        // Bonus for mobility
        const mobility = chess.moves().length;
        score += chess.turn() === 'w' ? mobility : -mobility;
        
        // Check bonus
        if (chess.isCheck()) {
            score += chess.turn() === 'w' ? -50 : 50;
        }
        
        // Return score from perspective of side to move
        return chess.turn() === 'w' ? score : -score;
    }
    
    /**
     * Parse evaluation from Stockfish output
     */
    parseEvaluation(message) {
        // Parse depth
        const depthMatch = message.match(/depth (\d+)/);
        const depth = depthMatch ? parseInt(depthMatch[1]) : null;
        
        // Parse score
        let evaluation = null;
        const cpMatch = message.match(/score cp (-?\d+)/);
        const mateMatch = message.match(/score mate (-?\d+)/);
        
        if (cpMatch) {
            evaluation = parseInt(cpMatch[1]) / 100;
        } else if (mateMatch) {
            const mateIn = parseInt(mateMatch[1]);
            evaluation = mateIn > 0 ? 100 : -100;
        }
        
        // Parse best line
        const pvMatch = message.match(/pv (.+)/);
        const bestLine = pvMatch ? pvMatch[1].split(' ').slice(0, 3).join(' ') : null;
        
        if (evaluation !== null && this.onEvaluation) {
            this.onEvaluation({
                evaluation,
                depth,
                bestLine
            });
        }
    }
    
    /**
     * Set difficulty
     */
    setDifficulty(difficulty) {
        const settings = this.difficulties[difficulty] || this.difficulties.medium;
        this.currentDepth = settings.depth;
        
        if (this.worker && !this.useFallback) {
            this.worker.postMessage(`setoption name Skill Level value ${settings.skill}`);
        }
    }
    
    /**
     * Request best move
     */
    getBestMove(fen, difficulty = 'medium') {
        if (this.isThinking) return;
        
        this.isThinking = true;
        const settings = this.difficulties[difficulty] || this.difficulties.medium;
        
        if (this.useFallback || !this.worker) {
            // Use fallback AI
            setTimeout(() => {
                const move = this.getFallbackMove(fen, difficulty);
                this.isThinking = false;
                
                if (move && this.onBestMove) {
                    this.onBestMove(move.from, move.to, move.promotion);
                }
            }, settings.moveTime);
        } else {
            // Use Stockfish
            this.worker.postMessage(`position fen ${fen}`);
            this.worker.postMessage(`go depth ${settings.depth} movetime ${settings.moveTime}`);
        }
    }
    
    /**
     * Analyze position
     */
    analyzePosition(fen) {
        if (!this.evaluationEnabled) return;
        
        if (this.useFallback || !this.worker) {
            // Fallback evaluation
            const chess = new Chess(fen);
            const evaluation = this.evaluatePosition(chess, 'hard') / 100;
            
            if (this.onEvaluation) {
                this.onEvaluation({
                    evaluation: evaluation,
                    depth: 1,
                    bestLine: null
                });
            }
        } else {
            this.worker.postMessage(`position fen ${fen}`);
            this.worker.postMessage('go depth 15');
        }
    }
    
    /**
     * Stop current analysis
     */
    stop() {
        if (this.worker && !this.useFallback) {
            this.worker.postMessage('stop');
        }
        this.isThinking = false;
    }
    
    /**
     * Enable/disable evaluation
     */
    setEvaluationEnabled(enabled) {
        this.evaluationEnabled = enabled;
    }
    
    /**
     * Terminate worker
     */
    terminate() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
}

// Export for use in other modules
window.StockfishEngine = StockfishEngine;
