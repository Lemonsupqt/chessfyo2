/**
 * DOSTOEVSKY CHESS - Stockfish Integration
 * Loads and manages the Stockfish chess engine
 */

class StockfishEngine {
    constructor() {
        this.worker = null;
        this.isReady = false;
        this.isSearching = false;
        this.skillLevel = 10;
        this.searchDepth = 15;
        this.moveTime = 1000;
        this.onReady = null;
        this.onBestMove = null;
        this.onInfo = null;
        this.pendingCommands = [];
    }

    async init() {
        return new Promise((resolve, reject) => {
            try {
                // Try multiple sources for Stockfish
                const stockfishUrls = [
                    'https://cdn.jsdelivr.net/npm/stockfish@16.0.0/src/stockfish-nnue-16.js',
                    'https://unpkg.com/stockfish@16.0.0/src/stockfish-nnue-16.js',
                    'https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js'
                ];

                this.tryLoadStockfish(stockfishUrls, 0, resolve, reject);
            } catch (error) {
                console.error('Stockfish initialization error:', error);
                reject(error);
            }
        });
    }

    tryLoadStockfish(urls, index, resolve, reject) {
        if (index >= urls.length) {
            // All URLs failed, create a simple fallback
            console.warn('Could not load Stockfish, using simple AI fallback');
            this.useFallbackAI();
            this.isReady = true;
            resolve();
            return;
        }

        const url = urls[index];
        console.log(`Trying to load Stockfish from: ${url}`);

        try {
            this.worker = new Worker(url);
            
            this.worker.onmessage = (e) => {
                this.handleMessage(e.data);
            };

            this.worker.onerror = (e) => {
                console.warn(`Failed to load from ${url}, trying next...`);
                this.worker.terminate();
                this.tryLoadStockfish(urls, index + 1, resolve, reject);
            };

            // Send UCI command to initialize
            this.worker.postMessage('uci');

            // Set timeout for initialization
            setTimeout(() => {
                if (!this.isReady) {
                    console.warn(`Timeout loading from ${url}, trying next...`);
                    this.worker.terminate();
                    this.tryLoadStockfish(urls, index + 1, resolve, reject);
                }
            }, 5000);

            // Store resolve for when we get uciok
            this._resolveInit = resolve;
        } catch (error) {
            console.warn(`Error loading from ${url}:`, error);
            this.tryLoadStockfish(urls, index + 1, resolve, reject);
        }
    }

    useFallbackAI() {
        this.isFallback = true;
        this.worker = null;
    }

    handleMessage(message) {
        const msg = message.toString();
        
        if (msg === 'uciok') {
            this.sendCommand('isready');
        } else if (msg === 'readyok') {
            this.isReady = true;
            this.setSkillLevel(this.skillLevel);
            if (this._resolveInit) {
                this._resolveInit();
                this._resolveInit = null;
            }
            if (this.onReady) {
                this.onReady();
            }
            // Process pending commands
            while (this.pendingCommands.length > 0) {
                const cmd = this.pendingCommands.shift();
                this.sendCommand(cmd);
            }
        } else if (msg.startsWith('bestmove')) {
            this.isSearching = false;
            const parts = msg.split(' ');
            const bestMove = parts[1];
            const ponderMove = parts[3] || null;
            
            if (this.onBestMove && bestMove && bestMove !== '(none)') {
                this.onBestMove(this.parseUCIMove(bestMove), ponderMove ? this.parseUCIMove(ponderMove) : null);
            }
        } else if (msg.startsWith('info')) {
            if (this.onInfo) {
                this.onInfo(this.parseInfo(msg));
            }
        }
    }

    sendCommand(command) {
        if (this.isFallback) return;
        
        if (!this.isReady && command !== 'uci' && command !== 'isready') {
            this.pendingCommands.push(command);
            return;
        }
        
        if (this.worker) {
            this.worker.postMessage(command);
        }
    }

    setSkillLevel(level) {
        // Skill level 0-20
        this.skillLevel = Math.max(0, Math.min(20, level));
        
        if (this.isFallback) return;

        // Set skill level
        this.sendCommand(`setoption name Skill Level value ${this.skillLevel}`);
        
        // Adjust search depth based on skill
        this.searchDepth = Math.max(1, Math.floor(this.skillLevel * 0.8) + 5);
        
        // For very low skill levels, add some randomness
        if (this.skillLevel < 5) {
            this.sendCommand('setoption name UCI_LimitStrength value true');
            this.sendCommand(`setoption name UCI_Elo value ${800 + this.skillLevel * 100}`);
        } else {
            this.sendCommand('setoption name UCI_LimitStrength value false');
        }
    }

    setPosition(fen) {
        if (this.isFallback) {
            this.currentFEN = fen;
            return;
        }
        this.sendCommand(`position fen ${fen}`);
    }

    setPositionWithMoves(startFen, moves) {
        if (this.isFallback) {
            this.currentFEN = startFen;
            this.currentMoves = moves;
            return;
        }
        
        if (moves.length > 0) {
            this.sendCommand(`position fen ${startFen} moves ${moves.join(' ')}`);
        } else {
            this.sendCommand(`position fen ${startFen}`);
        }
    }

    search(options = {}) {
        if (this.isSearching) {
            this.stop();
        }
        
        this.isSearching = true;
        
        if (this.isFallback) {
            // Use fallback random AI
            setTimeout(() => {
                this.getFallbackMove();
            }, 500 + Math.random() * 1000);
            return;
        }

        let command = 'go';
        
        if (options.depth) {
            command += ` depth ${options.depth}`;
        } else if (options.movetime) {
            command += ` movetime ${options.movetime}`;
        } else if (options.wtime && options.btime) {
            command += ` wtime ${options.wtime} btime ${options.btime}`;
            if (options.winc) command += ` winc ${options.winc}`;
            if (options.binc) command += ` binc ${options.binc}`;
        } else {
            // Default: search for 1 second
            command += ` movetime ${this.moveTime}`;
        }

        this.sendCommand(command);
    }

    searchBestMove(fen, depth = null) {
        return new Promise((resolve) => {
            this.setPosition(fen);
            this.onBestMove = (move) => {
                resolve(move);
            };
            this.search({ depth: depth || this.searchDepth });
        });
    }

    getFallbackMove() {
        // Simple fallback - returns through onBestMove callback
        // This would need access to the game state
        if (this.onBestMove && window.game) {
            const moves = window.game.chess.getLegalMoves();
            if (moves.length > 0) {
                // Prioritize captures and checks at higher skill levels
                let selectedMove;
                
                if (this.skillLevel >= 5) {
                    // Prefer captures
                    const captures = moves.filter(m => m.capture);
                    if (captures.length > 0 && Math.random() < 0.7) {
                        selectedMove = captures[Math.floor(Math.random() * captures.length)];
                    }
                }
                
                if (!selectedMove) {
                    selectedMove = moves[Math.floor(Math.random() * moves.length)];
                }
                
                this.isSearching = false;
                this.onBestMove(selectedMove, null);
            }
        }
    }

    stop() {
        this.isSearching = false;
        if (!this.isFallback) {
            this.sendCommand('stop');
        }
    }

    parseUCIMove(uciMove) {
        if (!uciMove || uciMove.length < 4) return null;
        
        const fromCol = uciMove.charCodeAt(0) - 97;
        const fromRow = 8 - parseInt(uciMove[1]);
        const toCol = uciMove.charCodeAt(2) - 97;
        const toRow = 8 - parseInt(uciMove[3]);
        const promotion = uciMove.length === 5 ? uciMove[4] : null;

        return {
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            promotion: promotion
        };
    }

    moveToUCI(move) {
        const fromFile = String.fromCharCode(97 + move.from.col);
        const fromRank = 8 - move.from.row;
        const toFile = String.fromCharCode(97 + move.to.col);
        const toRank = 8 - move.to.row;
        
        let uci = `${fromFile}${fromRank}${toFile}${toRank}`;
        if (move.promotion) {
            uci += move.promotion.toLowerCase();
        }
        
        return uci;
    }

    parseInfo(infoString) {
        const info = {};
        const parts = infoString.split(' ');
        
        for (let i = 0; i < parts.length; i++) {
            switch (parts[i]) {
                case 'depth':
                    info.depth = parseInt(parts[++i]);
                    break;
                case 'seldepth':
                    info.selectiveDepth = parseInt(parts[++i]);
                    break;
                case 'score':
                    if (parts[i + 1] === 'cp') {
                        info.score = parseInt(parts[i + 2]) / 100;
                        i += 2;
                    } else if (parts[i + 1] === 'mate') {
                        info.mate = parseInt(parts[i + 2]);
                        i += 2;
                    }
                    break;
                case 'nodes':
                    info.nodes = parseInt(parts[++i]);
                    break;
                case 'nps':
                    info.nodesPerSecond = parseInt(parts[++i]);
                    break;
                case 'pv':
                    info.principalVariation = [];
                    for (let j = i + 1; j < parts.length; j++) {
                        if (parts[j].match(/^[a-h][1-8][a-h][1-8]/)) {
                            info.principalVariation.push(parts[j]);
                        } else {
                            break;
                        }
                    }
                    break;
            }
        }
        
        return info;
    }

    getHint(fen) {
        return this.searchBestMove(fen, Math.min(this.searchDepth, 12));
    }

    analyze(fen, depth = 20) {
        return new Promise((resolve) => {
            const analysis = [];
            
            this.setPosition(fen);
            this.onInfo = (info) => {
                if (info.depth && info.score !== undefined) {
                    analysis.push(info);
                }
            };
            this.onBestMove = (move) => {
                resolve({
                    bestMove: move,
                    analysis: analysis
                });
            };
            this.search({ depth });
        });
    }

    quit() {
        if (this.worker) {
            this.sendCommand('quit');
            this.worker.terminate();
            this.worker = null;
        }
        this.isReady = false;
    }
}

// Create global instance
window.stockfish = new StockfishEngine();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StockfishEngine;
}
