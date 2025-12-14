/**
 * THE GRAND INQUISITOR'S CHESS
 * Game Logic Module
 */

class ChessGame {
    constructor() {
        this.chess = new Chess();
        this.gameMode = null; // 'local', 'ai', 'online', 'analysis'
        this.playerColor = 'white';
        this.selectedSquare = null;
        this.validMoves = [];
        this.lastMove = null;
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.isFlipped = false;
        this.timeControl = 300; // 5 minutes default
        this.whiteTime = 300;
        this.blackTime = 300;
        this.timerInterval = null;
        this.gameStarted = false;
        this.gameOver = false;
        this.pendingPromotion = null;
        this.aiDifficulty = 10;
        
        // Callbacks
        this.onMove = null;
        this.onGameOver = null;
        this.onTimeUpdate = null;
        this.onBoardUpdate = null;
    }

    /**
     * Initialize a new game
     */
    newGame(mode, options = {}) {
        this.chess = new Chess();
        this.gameMode = mode;
        this.playerColor = options.playerColor || 'white';
        this.selectedSquare = null;
        this.validMoves = [];
        this.lastMove = null;
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.gameOver = false;
        this.pendingPromotion = null;
        
        // Time control
        this.timeControl = (options.timeControl || 5) * 60;
        this.whiteTime = this.timeControl;
        this.blackTime = this.timeControl;
        this.gameStarted = false;
        
        // AI settings
        this.aiDifficulty = options.aiDifficulty || 10;
        
        // Clear any existing timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Flip board if playing black
        if (mode === 'ai' && this.playerColor === 'black') {
            this.isFlipped = true;
        } else if (mode === 'online' && this.playerColor === 'black') {
            this.isFlipped = true;
        } else {
            this.isFlipped = false;
        }
        
        if (this.onBoardUpdate) {
            this.onBoardUpdate();
        }
        
        return this;
    }

    /**
     * Get the current board state
     */
    getBoard() {
        const board = [];
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        
        for (let rank = 8; rank >= 1; rank--) {
            for (let file of files) {
                const square = file + rank;
                const piece = this.chess.get(square);
                board.push({
                    square,
                    piece,
                    isLight: (files.indexOf(file) + rank) % 2 === 1
                });
            }
        }
        
        return board;
    }

    /**
     * Handle square click/selection
     */
    handleSquareClick(square) {
        if (this.gameOver) return false;
        
        // Check if it's the player's turn (for online/AI modes)
        if (!this.canMove()) return false;
        
        const piece = this.chess.get(square);
        
        // If a square is already selected
        if (this.selectedSquare) {
            // Check if clicking on a valid move square
            const move = this.validMoves.find(m => m.to === square);
            
            if (move) {
                // Check for promotion
                if (move.flags.includes('p')) {
                    this.pendingPromotion = { from: this.selectedSquare, to: square };
                    return { type: 'promotion', color: this.chess.turn() };
                }
                
                // Make the move
                return this.makeMove(this.selectedSquare, square);
            }
            
            // If clicking on own piece, select it instead
            if (piece && piece.color === this.chess.turn()) {
                this.selectSquare(square);
                return { type: 'select', square };
            }
            
            // Otherwise, deselect
            this.deselectSquare();
            return { type: 'deselect' };
        }
        
        // No square selected - try to select
        if (piece && piece.color === this.chess.turn()) {
            this.selectSquare(square);
            return { type: 'select', square };
        }
        
        return false;
    }

    /**
     * Select a square and calculate valid moves
     */
    selectSquare(square) {
        this.selectedSquare = square;
        this.validMoves = this.chess.moves({ square, verbose: true });
    }

    /**
     * Deselect the current square
     */
    deselectSquare() {
        this.selectedSquare = null;
        this.validMoves = [];
    }

    /**
     * Make a move
     */
    makeMove(from, to, promotion = null) {
        const moveData = {
            from,
            to,
            promotion: promotion || undefined
        };
        
        const move = this.chess.move(moveData);
        
        if (move) {
            // Start timer on first move
            if (!this.gameStarted && this.timeControl > 0) {
                this.gameStarted = true;
                this.startTimer();
            }
            
            // Track captured piece
            if (move.captured) {
                const capturedColor = move.color === 'w' ? 'black' : 'white';
                this.capturedPieces[capturedColor].push(move.captured);
            }
            
            // Record move
            this.lastMove = { from: move.from, to: move.to };
            this.moveHistory.push(move);
            
            // Clear selection
            this.deselectSquare();
            
            // Check for game over
            const gameStatus = this.checkGameStatus();
            
            if (this.onMove) {
                this.onMove(move, gameStatus);
            }
            
            if (this.onBoardUpdate) {
                this.onBoardUpdate();
            }
            
            return { type: 'move', move, gameStatus };
        }
        
        return false;
    }

    /**
     * Complete a pawn promotion
     */
    completePromotion(piece) {
        if (this.pendingPromotion) {
            const result = this.makeMove(
                this.pendingPromotion.from,
                this.pendingPromotion.to,
                piece
            );
            this.pendingPromotion = null;
            return result;
        }
        return false;
    }

    /**
     * Check if the current player can move
     */
    canMove() {
        const turn = this.chess.turn();
        
        switch (this.gameMode) {
            case 'local':
            case 'analysis':
                return true;
            case 'ai':
                return (turn === 'w' && this.playerColor === 'white') ||
                       (turn === 'b' && this.playerColor === 'black');
            case 'online':
                return (turn === 'w' && this.playerColor === 'white') ||
                       (turn === 'b' && this.playerColor === 'black');
            default:
                return true;
        }
    }

    /**
     * Check game status
     */
    checkGameStatus() {
        if (this.chess.isCheckmate()) {
            this.endGame();
            const winner = this.chess.turn() === 'w' ? 'black' : 'white';
            return { over: true, result: 'checkmate', winner };
        }
        
        if (this.chess.isStalemate()) {
            this.endGame();
            return { over: true, result: 'stalemate', winner: null };
        }
        
        if (this.chess.isDraw()) {
            this.endGame();
            let reason = 'draw';
            if (this.chess.isThreefoldRepetition()) reason = 'repetition';
            else if (this.chess.isInsufficientMaterial()) reason = 'insufficient';
            return { over: true, result: reason, winner: null };
        }
        
        if (this.chess.isCheck()) {
            return { over: false, inCheck: true };
        }
        
        return { over: false };
    }

    /**
     * Get square of king in check
     */
    getKingInCheck() {
        if (!this.chess.isCheck()) return null;
        
        const turn = this.chess.turn();
        const board = this.chess.board();
        
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = board[i][j];
                if (piece && piece.type === 'k' && piece.color === turn) {
                    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
                    return files[j] + (8 - i);
                }
            }
        }
        return null;
    }

    /**
     * Start the game timer
     */
    startTimer() {
        if (this.timeControl === 0) return;
        
        this.timerInterval = setInterval(() => {
            const turn = this.chess.turn();
            
            if (turn === 'w') {
                this.whiteTime--;
                if (this.whiteTime <= 0) {
                    this.whiteTime = 0;
                    this.handleTimeout('white');
                }
            } else {
                this.blackTime--;
                if (this.blackTime <= 0) {
                    this.blackTime = 0;
                    this.handleTimeout('black');
                }
            }
            
            if (this.onTimeUpdate) {
                this.onTimeUpdate(this.whiteTime, this.blackTime);
            }
        }, 1000);
    }

    /**
     * Handle timeout
     */
    handleTimeout(loser) {
        this.endGame();
        const winner = loser === 'white' ? 'black' : 'white';
        const status = { over: true, result: 'timeout', winner };
        
        if (this.onGameOver) {
            this.onGameOver(status);
        }
    }

    /**
     * End the game
     */
    endGame() {
        this.gameOver = true;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Resign the game
     */
    resign(color) {
        this.endGame();
        const winner = color === 'white' ? 'black' : 'white';
        return { over: true, result: 'resignation', winner };
    }

    /**
     * Undo the last move
     */
    undo() {
        const move = this.chess.undo();
        if (move) {
            // Remove from history
            this.moveHistory.pop();
            
            // Remove captured piece if any
            if (move.captured) {
                const capturedColor = move.color === 'w' ? 'black' : 'white';
                this.capturedPieces[capturedColor].pop();
            }
            
            // Update last move
            if (this.moveHistory.length > 0) {
                const lastMove = this.moveHistory[this.moveHistory.length - 1];
                this.lastMove = { from: lastMove.from, to: lastMove.to };
            } else {
                this.lastMove = null;
            }
            
            if (this.onBoardUpdate) {
                this.onBoardUpdate();
            }
            
            return true;
        }
        return false;
    }

    /**
     * Flip the board orientation
     */
    flipBoard() {
        this.isFlipped = !this.isFlipped;
        if (this.onBoardUpdate) {
            this.onBoardUpdate();
        }
    }

    /**
     * Get FEN string
     */
    getFen() {
        return this.chess.fen();
    }

    /**
     * Load FEN position
     */
    loadFen(fen) {
        const result = this.chess.load(fen);
        if (result) {
            this.moveHistory = [];
            this.capturedPieces = { white: [], black: [] };
            this.lastMove = null;
            if (this.onBoardUpdate) {
                this.onBoardUpdate();
            }
        }
        return result;
    }

    /**
     * Get PGN
     */
    getPgn() {
        return this.chess.pgn();
    }

    /**
     * Load PGN
     */
    loadPgn(pgn) {
        const result = this.chess.loadPgn(pgn);
        if (result) {
            if (this.onBoardUpdate) {
                this.onBoardUpdate();
            }
        }
        return result;
    }

    /**
     * Get whose turn it is
     */
    getTurn() {
        return this.chess.turn() === 'w' ? 'white' : 'black';
    }

    /**
     * Format time for display
     */
    static formatTime(seconds) {
        if (seconds === Infinity || seconds <= 0) return '∞';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Get piece unicode symbol
     */
    static getPieceSymbol(piece) {
        const symbols = {
            'wp': '♙', 'wn': '♘', 'wb': '♗', 'wr': '♖', 'wq': '♕', 'wk': '♔',
            'bp': '♟', 'bn': '♞', 'bb': '♝', 'br': '♜', 'bq': '♛', 'bk': '♚'
        };
        return symbols[piece.color + piece.type] || '';
    }

    /**
     * Get move notation for history display
     */
    getMoveNotation(move) {
        return move.san;
    }
}

// Export for use in other modules
window.ChessGame = ChessGame;
