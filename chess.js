// Chess game logic and board management
class ChessGame {
    constructor() {
        this.chess = new Chess();
        this.board = null;
        this.orientation = 'white';
        this.moveHistory = [];
        this.onMoveCallback = null;
        this.gameMode = 'local';
        this.isPlayerTurn = true;
        this.stockfishWorker = null;
        this.stockfishLevel = 10;
    }

    initBoard(containerId) {
        const config = {
            draggable: true,
            position: 'start',
            onDragStart: this.onDragStart.bind(this),
            onDrop: this.onDrop.bind(this),
            onSnapEnd: this.onSnapEnd.bind(this),
            pieceTheme: 'https://cdnjs.cloudflare.com/ajax/libs/chessboardjs/1.0.0/img/chesspieces/wikipedia/{piece}.png',
            orientation: this.orientation
        };

        this.board = Chessboard(containerId, config);
        this.updatePositionInfo();
        return this.board;
    }

    onDragStart(source, piece, position, orientation) {
        // Prevent dragging if it's not the player's turn
        if (!this.isPlayerTurn && this.gameMode === 'ai') {
            return false;
        }

        // Prevent dragging opponent's pieces
        const pieceColor = piece[0];
        const isWhiteTurn = this.chess.turn() === 'w';
        if ((pieceColor === 'w' && !isWhiteTurn) || (pieceColor === 'b' && isWhiteTurn)) {
            return false;
        }

        // Check if the game is over
        if (this.chess.isGameOver()) {
            return false;
        }

        return true;
    }

    onDrop(source, target) {
        const move = this.chess.move({
            from: source,
            to: target,
            promotion: 'q' // Auto-promote to queen
        });

        if (move === null) {
            return 'snapback';
        }

        // Highlight the last move
        this.highlightMove(source, target);

        this.addMoveToHistory(move);
        this.updatePositionInfo();
        this.updateGameStatus();

        // Notify callback
        if (this.onMoveCallback) {
            this.onMoveCallback(move);
        }

        // If playing against AI, trigger AI move
        if (this.gameMode === 'ai' && !this.chess.isGameOver() && this.chess.turn() === 'b') {
            this.isPlayerTurn = false;
            const aiLoading = document.getElementById('aiLoading');
            if (aiLoading) aiLoading.classList.remove('hidden');
            setTimeout(() => this.makeStockfishMove(), 500);
        }

        return move;
    }

    highlightMove(from, to) {
        // Remove previous highlights
        if (this.board && this.board.el) {
            const squares = this.board.el.querySelectorAll('.square-55d63, .black-3c85d');
            squares.forEach(sq => {
                sq.classList.remove('last-move');
            });
        }

        // Add highlight to new squares
        setTimeout(() => {
            if (this.board && this.board.el) {
                const fromSquare = this.board.el.querySelector(`[data-square="${from}"]`);
                const toSquare = this.board.el.querySelector(`[data-square="${to}"]`);
                if (fromSquare) fromSquare.classList.add('last-move');
                if (toSquare) toSquare.classList.add('last-move');
            }
        }, 100);
    }

    onSnapEnd() {
        this.board.position(this.chess.fen());
    }

    addMoveToHistory(move) {
        const moveNumber = Math.floor(this.moveHistory.length / 2) + 1;
        const isWhiteMove = this.moveHistory.length % 2 === 0;
        
        if (isWhiteMove) {
            this.moveHistory.push({
                number: moveNumber,
                white: move.san,
                black: null
            });
        } else {
            const lastMove = this.moveHistory[this.moveHistory.length - 1];
            lastMove.black = move.san;
        }

        this.updateMoveHistoryDisplay();
    }

    updateMoveHistoryDisplay() {
        const container = document.getElementById('moveHistory');
        if (!container) return;

        container.innerHTML = '';
        this.moveHistory.forEach(move => {
            const moveDiv = document.createElement('div');
            moveDiv.className = 'move-item';
            moveDiv.textContent = `${move.number}. ${move.white || '...'} ${move.black ? move.black : ''}`;
            container.appendChild(moveDiv);
        });
        container.scrollTop = container.scrollHeight;
    }

    updatePositionInfo() {
        const fenDisplay = document.getElementById('fenDisplay');
        if (fenDisplay) {
            fenDisplay.textContent = this.chess.fen();
        }
    }

    updateGameStatus() {
        const statusEl = document.getElementById('gameStatus');
        if (!statusEl) return;

        if (this.chess.isCheckmate()) {
            const winner = this.chess.turn() === 'w' ? 'Black' : 'White';
            statusEl.textContent = `Checkmate! ${winner} wins!`;
            statusEl.style.color = '#ff6b6b';
        } else if (this.chess.isDraw()) {
            statusEl.textContent = 'Draw!';
            statusEl.style.color = '#ffd93d';
        } else if (this.chess.isCheck()) {
            statusEl.textContent = 'Check!';
            statusEl.style.color = '#ff6b6b';
        } else if (this.chess.isStalemate()) {
            statusEl.textContent = 'Stalemate!';
            statusEl.style.color = '#ffd93d';
        } else {
            const turn = this.chess.turn() === 'w' ? 'White' : 'Black';
            statusEl.textContent = `${turn} to move`;
            statusEl.style.color = '#d4af37';
        }
    }

    flipBoard() {
        this.orientation = this.orientation === 'white' ? 'black' : 'white';
        if (this.board) {
            this.board.flip();
        }
    }

    reset() {
        this.chess.reset();
        this.moveHistory = [];
        if (this.board) {
            this.board.position('start');
        }
        this.updateMoveHistoryDisplay();
        this.updatePositionInfo();
        this.updateGameStatus();
        this.isPlayerTurn = true;
    }

    undoMove() {
        this.chess.undo();
        if (this.moveHistory.length > 0) {
            const lastMove = this.moveHistory[this.moveHistory.length - 1];
            if (lastMove.black) {
                lastMove.black = null;
            } else {
                this.moveHistory.pop();
            }
        }
        if (this.board) {
            this.board.position(this.chess.fen());
        }
        this.updateMoveHistoryDisplay();
        this.updatePositionInfo();
        this.updateGameStatus();
    }

    setPosition(fen) {
        this.chess.load(fen);
        if (this.board) {
            this.board.position(fen);
        }
        this.updatePositionInfo();
        this.updateGameStatus();
    }

    makeMove(from, to, promotion = 'q') {
        const move = this.chess.move({
            from: from,
            to: to,
            promotion: promotion
        });

        if (move) {
            this.highlightMove(from, to);
            this.addMoveToHistory(move);
            if (this.board) {
                this.board.position(this.chess.fen());
            }
            this.updatePositionInfo();
            this.updateGameStatus();
            return move;
        }
        return null;
    }

    // Stockfish AI integration
    async initStockfish() {
        try {
            // Try to load Stockfish from CDN
            // Using a more compatible approach
            const stockfishScript = await fetch('https://cdn.jsdelivr.net/npm/stockfish.js@10/stockfish.js').then(r => r.text());
            const workerCode = `
                ${stockfishScript}
                // Stockfish will be available as a global
            `;
            const blob = new Blob([workerCode], { type: 'application/javascript' });
            const workerUrl = URL.createObjectURL(blob);
            this.stockfishWorker = new Worker(workerUrl);
            
            let stockfishReady = false;
            let messageQueue = [];
            
            this.stockfishWorker.onmessage = (e) => {
                const message = typeof e.data === 'string' ? e.data : e.data.toString();
                
                if (message === 'readyok') {
                    stockfishReady = true;
                    this.stockfishWorker.postMessage(`setoption name Skill Level value ${this.stockfishLevel}`);
                    // Process queued messages
                    messageQueue.forEach(msg => this.stockfishWorker.postMessage(msg));
                    messageQueue = [];
                }
                
                if (message.includes('bestmove')) {
                    const match = message.match(/bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?/);
                    if (match) {
                        const from = match[1];
                        const to = match[2];
                        const promotion = match[3] || 'q';
                        setTimeout(() => {
                            this.makeMove(from, to, promotion);
                            this.isPlayerTurn = true;
                            const aiLoading = document.getElementById('aiLoading');
                            if (aiLoading) aiLoading.classList.add('hidden');
                        }, 300);
                    }
                }
            };

            this.stockfishWorker.onerror = (error) => {
                console.warn('Stockfish worker error, using fallback:', error);
                this.stockfishWorker = null;
            };

            this.stockfishWorker.postMessage('uci');
            this.stockfishWorker.postMessage('isready');
            
            // Set timeout - if Stockfish doesn't load, use fallback
            setTimeout(() => {
                if (!stockfishReady) {
                    console.warn('Stockfish initialization timeout, using fallback AI');
                    if (this.stockfishWorker) {
                        this.stockfishWorker.terminate();
                    }
                    this.stockfishWorker = null;
                }
            }, 3000);
            
        } catch (error) {
            console.warn('Failed to load Stockfish, using fallback AI:', error);
            // Fallback: use smart random move generator
            this.stockfishWorker = null;
        }
    }

    makeStockfishMove() {
        if (!this.stockfishWorker) {
            // Fallback: make a smart random move (prefer captures and checks)
            const moves = this.chess.moves({ verbose: true });
            if (moves.length === 0) return;
            
            // Prioritize captures and checks
            const captures = moves.filter(m => m.flags.includes('c'));
            const checks = moves.filter(m => m.san.includes('+'));
            const captureChecks = moves.filter(m => m.flags.includes('c') && m.san.includes('+'));
            
            let selectedMove;
            if (captureChecks.length > 0) {
                selectedMove = captureChecks[Math.floor(Math.random() * captureChecks.length)];
            } else if (checks.length > 0) {
                selectedMove = checks[Math.floor(Math.random() * checks.length)];
            } else if (captures.length > 0) {
                selectedMove = captures[Math.floor(Math.random() * captures.length)];
            } else {
                selectedMove = moves[Math.floor(Math.random() * moves.length)];
            }
            
            setTimeout(() => {
                this.makeMove(selectedMove.from, selectedMove.to, selectedMove.promotion);
                this.isPlayerTurn = true;
                const aiLoading = document.getElementById('aiLoading');
                if (aiLoading) aiLoading.classList.add('hidden');
            }, 500);
            return;
        }

        this.stockfishWorker.postMessage(`position fen ${this.chess.fen()}`);
        this.stockfishWorker.postMessage(`go depth 10`);
    }

    setStockfishLevel(level) {
        this.stockfishLevel = Math.max(1, Math.min(20, level));
        if (this.stockfishWorker) {
            this.stockfishWorker.postMessage(`setoption name Skill Level value ${this.stockfishLevel}`);
        }
    }

    exportPGN() {
        const pgn = this.chess.pgn();
        const blob = new Blob([pgn], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chess-game-${Date.now()}.pgn`;
        a.click();
        URL.revokeObjectURL(url);
    }

    getFEN() {
        return this.chess.fen();
    }

    getPGN() {
        return this.chess.pgn();
    }

    setGameMode(mode) {
        this.gameMode = mode;
        if (mode === 'ai') {
            this.initStockfish();
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChessGame;
}
