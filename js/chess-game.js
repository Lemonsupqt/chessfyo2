/**
 * Chess Game Logic - The Brothers Chess
 * Handles board rendering, move validation, and game state
 */

class ChessGame {
    constructor() {
        this.chess = new Chess();
        this.boardElement = document.getElementById('chessBoard');
        this.selectedSquare = null;
        this.legalMoves = [];
        this.playerColor = 'white';
        this.isFlipped = false;
        this.lastMove = null;
        this.moveHistory = [];
        this.gameMode = 'local'; // 'local', 'ai', 'online', 'analysis'
        this.aiDifficulty = 'medium';
        this.isPlayerTurn = true;
        this.promotionCallback = null;
        this.onMoveCallback = null;
        this.gameOver = false;
        
        // Captured pieces
        this.capturedByWhite = [];
        this.capturedByBlack = [];
        
        // Timer
        this.timeControl = 0; // 0 = unlimited
        this.whiteTime = 0;
        this.blackTime = 0;
        this.timerInterval = null;
        this.activeTimer = null;
        
        // Sound
        this.soundEnabled = true;
        
        // Piece symbols
        this.pieceSymbols = {
            'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
            'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
        };
        
        this.initBoard();
    }
    
    /**
     * Initialize the chess board
     */
    initBoard() {
        this.boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                const actualRow = this.isFlipped ? 7 - row : row;
                const actualCol = this.isFlipped ? 7 - col : col;
                const file = String.fromCharCode(97 + actualCol);
                const rank = 8 - actualRow;
                const squareId = file + rank;
                
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.square = squareId;
                
                // Add coordinates
                if (col === 0) {
                    const rankLabel = document.createElement('span');
                    rankLabel.className = 'coord rank';
                    rankLabel.textContent = rank;
                    square.appendChild(rankLabel);
                }
                if (row === 7) {
                    const fileLabel = document.createElement('span');
                    fileLabel.className = 'coord file';
                    fileLabel.textContent = file;
                    square.appendChild(fileLabel);
                }
                
                square.addEventListener('click', (e) => this.handleSquareClick(squareId, e));
                square.addEventListener('dragover', (e) => e.preventDefault());
                square.addEventListener('drop', (e) => this.handleDrop(squareId, e));
                
                this.boardElement.appendChild(square);
            }
        }
        
        this.renderPieces();
    }
    
    /**
     * Render all pieces on the board
     */
    renderPieces() {
        const squares = this.boardElement.querySelectorAll('.square');
        squares.forEach(square => {
            const pieceEl = square.querySelector('.piece');
            if (pieceEl) pieceEl.remove();
            
            // Remove highlight classes
            square.classList.remove('selected', 'legal-move', 'legal-capture', 'in-check', 'last-move');
        });
        
        const board = this.chess.board();
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece) {
                    const file = String.fromCharCode(97 + col);
                    const rank = 8 - row;
                    const squareId = file + rank;
                    const squareEl = this.boardElement.querySelector(`[data-square="${squareId}"]`);
                    
                    if (squareEl) {
                        const pieceEl = document.createElement('div');
                        const symbol = piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase();
                        pieceEl.className = `piece ${piece.color === 'w' ? 'white' : 'black'}`;
                        pieceEl.textContent = this.pieceSymbols[symbol];
                        pieceEl.draggable = true;
                        pieceEl.addEventListener('dragstart', (e) => this.handleDragStart(squareId, e));
                        squareEl.appendChild(pieceEl);
                    }
                }
            }
        }
        
        // Highlight last move
        if (this.lastMove) {
            const fromSquare = this.boardElement.querySelector(`[data-square="${this.lastMove.from}"]`);
            const toSquare = this.boardElement.querySelector(`[data-square="${this.lastMove.to}"]`);
            if (fromSquare) fromSquare.classList.add('last-move');
            if (toSquare) toSquare.classList.add('last-move');
        }
        
        // Highlight check
        if (this.chess.isCheck()) {
            const turn = this.chess.turn();
            const board = this.chess.board();
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const piece = board[row][col];
                    if (piece && piece.type === 'k' && piece.color === turn) {
                        const file = String.fromCharCode(97 + col);
                        const rank = 8 - row;
                        const kingSquare = this.boardElement.querySelector(`[data-square="${file}${rank}"]`);
                        if (kingSquare) kingSquare.classList.add('in-check');
                    }
                }
            }
        }
    }
    
    /**
     * Handle square click
     */
    handleSquareClick(squareId, event) {
        if (this.gameOver) return;
        
        // Check if it's player's turn (for AI/online games)
        if (!this.canMove()) return;
        
        const piece = this.chess.get(squareId);
        const turn = this.chess.turn();
        
        // If no piece is selected
        if (!this.selectedSquare) {
            if (piece && piece.color === turn) {
                this.selectSquare(squareId);
            }
            return;
        }
        
        // If clicking on own piece, reselect
        if (piece && piece.color === turn) {
            this.selectSquare(squareId);
            return;
        }
        
        // Try to make a move
        this.tryMove(this.selectedSquare, squareId);
    }
    
    /**
     * Handle drag start
     */
    handleDragStart(squareId, event) {
        if (this.gameOver || !this.canMove()) {
            event.preventDefault();
            return;
        }
        
        const piece = this.chess.get(squareId);
        const turn = this.chess.turn();
        
        if (!piece || piece.color !== turn) {
            event.preventDefault();
            return;
        }
        
        this.selectSquare(squareId);
        event.dataTransfer.setData('text/plain', squareId);
    }
    
    /**
     * Handle drop
     */
    handleDrop(squareId, event) {
        event.preventDefault();
        const fromSquare = event.dataTransfer.getData('text/plain');
        if (fromSquare) {
            this.tryMove(fromSquare, squareId);
        }
    }
    
    /**
     * Select a square and show legal moves
     */
    selectSquare(squareId) {
        this.clearHighlights();
        this.selectedSquare = squareId;
        
        const squareEl = this.boardElement.querySelector(`[data-square="${squareId}"]`);
        if (squareEl) squareEl.classList.add('selected');
        
        // Get and highlight legal moves
        this.legalMoves = this.chess.moves({ square: squareId, verbose: true });
        this.legalMoves.forEach(move => {
            const targetSquare = this.boardElement.querySelector(`[data-square="${move.to}"]`);
            if (targetSquare) {
                if (move.captured) {
                    targetSquare.classList.add('legal-capture');
                } else {
                    targetSquare.classList.add('legal-move');
                }
            }
        });
    }
    
    /**
     * Clear selection highlights
     */
    clearHighlights() {
        this.selectedSquare = null;
        this.legalMoves = [];
        
        const squares = this.boardElement.querySelectorAll('.square');
        squares.forEach(square => {
            square.classList.remove('selected', 'legal-move', 'legal-capture');
        });
    }
    
    /**
     * Check if player can move
     */
    canMove() {
        if (this.gameMode === 'local' || this.gameMode === 'analysis') {
            return true;
        }
        
        const turn = this.chess.turn();
        const isWhite = turn === 'w';
        
        if (this.gameMode === 'ai') {
            return (this.playerColor === 'white' && isWhite) || 
                   (this.playerColor === 'black' && !isWhite);
        }
        
        if (this.gameMode === 'online') {
            return this.isPlayerTurn;
        }
        
        return true;
    }
    
    /**
     * Try to make a move
     */
    tryMove(from, to) {
        const move = this.legalMoves.find(m => m.from === from && m.to === to);
        
        if (!move) {
            this.clearHighlights();
            return false;
        }
        
        // Check for promotion
        if (move.flags.includes('p')) {
            this.showPromotionModal(from, to);
            return true;
        }
        
        return this.makeMove(from, to);
    }
    
    /**
     * Make a move
     */
    makeMove(from, to, promotion = null) {
        const moveObj = { from, to };
        if (promotion) moveObj.promotion = promotion;
        
        const move = this.chess.move(moveObj);
        
        if (move) {
            // Track captured piece
            if (move.captured) {
                const capturedPiece = move.captured;
                if (move.color === 'w') {
                    this.capturedByWhite.push(capturedPiece);
                } else {
                    this.capturedByBlack.push(capturedPiece);
                }
            }
            
            this.lastMove = { from, to };
            this.moveHistory.push(move);
            this.clearHighlights();
            this.renderPieces();
            this.updateMoveHistory();
            this.updateCapturedPieces();
            this.updateStatus();
            
            // Play sound
            this.playMoveSound(move);
            
            // Switch timer
            this.switchTimer();
            
            // Check game over
            if (this.checkGameOver()) {
                return move;
            }
            
            // Callback for online/AI
            if (this.onMoveCallback) {
                this.onMoveCallback(move);
            }
            
            return move;
        }
        
        this.clearHighlights();
        return null;
    }
    
    /**
     * Show promotion modal
     */
    showPromotionModal(from, to) {
        const modal = document.getElementById('promotionModal');
        modal.classList.remove('hidden');
        
        const turn = this.chess.turn();
        const buttons = modal.querySelectorAll('.promo-piece');
        
        buttons.forEach(btn => {
            const piece = btn.dataset.piece;
            btn.textContent = turn === 'w' ? 
                this.pieceSymbols[piece.toUpperCase()] : 
                this.pieceSymbols[piece.toLowerCase()];
            
            btn.onclick = () => {
                modal.classList.add('hidden');
                this.makeMove(from, to, piece);
            };
        });
    }
    
    /**
     * Play move sound
     */
    playMoveSound(move) {
        if (!this.soundEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            if (this.chess.isCheckmate()) {
                // Dramatic checkmate sound
                oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.3);
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
            } else if (this.chess.isCheck()) {
                // Check sound
                oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(660, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
            } else if (move.captured) {
                // Capture sound
                oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.15);
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.15);
            } else {
                // Normal move sound
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.08);
                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.08);
            }
        } catch (e) {
            // Audio not supported
        }
    }
    
    /**
     * Update move history display
     */
    updateMoveHistory() {
        const historyEl = document.getElementById('moveHistory');
        historyEl.innerHTML = '';
        
        const history = this.chess.history();
        
        for (let i = 0; i < history.length; i += 2) {
            const moveNum = Math.floor(i / 2) + 1;
            const row = document.createElement('div');
            row.className = 'move-row';
            
            const numEl = document.createElement('span');
            numEl.className = 'move-number';
            numEl.textContent = `${moveNum}.`;
            
            const whiteMove = document.createElement('span');
            whiteMove.className = 'move-white';
            whiteMove.textContent = history[i] || '';
            
            const blackMove = document.createElement('span');
            blackMove.className = 'move-black';
            blackMove.textContent = history[i + 1] || '';
            
            row.appendChild(numEl);
            row.appendChild(whiteMove);
            row.appendChild(blackMove);
            historyEl.appendChild(row);
        }
        
        historyEl.scrollTop = historyEl.scrollHeight;
    }
    
    /**
     * Update captured pieces display
     */
    updateCapturedPieces() {
        const playerCaptured = document.getElementById('playerCaptured');
        const opponentCaptured = document.getElementById('opponentCaptured');
        
        const whiteCapturedSymbols = this.capturedByWhite.map(p => this.pieceSymbols[p.toLowerCase()]).join('');
        const blackCapturedSymbols = this.capturedByBlack.map(p => this.pieceSymbols[p.toUpperCase()]).join('');
        
        if (this.playerColor === 'white') {
            playerCaptured.textContent = whiteCapturedSymbols;
            opponentCaptured.textContent = blackCapturedSymbols;
        } else {
            playerCaptured.textContent = blackCapturedSymbols;
            opponentCaptured.textContent = whiteCapturedSymbols;
        }
    }
    
    /**
     * Update game status
     */
    updateStatus() {
        const statusEl = document.getElementById('gameStatus');
        const wisdomEl = document.getElementById('gameWisdom');
        
        if (this.chess.isCheckmate()) {
            const winner = this.chess.turn() === 'w' ? 'Black' : 'White';
            statusEl.textContent = `Checkmate! ${winner} wins!`;
        } else if (this.chess.isDraw()) {
            if (this.chess.isStalemate()) {
                statusEl.textContent = 'Stalemate - Draw';
            } else if (this.chess.isThreefoldRepetition()) {
                statusEl.textContent = 'Threefold Repetition - Draw';
            } else if (this.chess.isInsufficientMaterial()) {
                statusEl.textContent = 'Insufficient Material - Draw';
            } else {
                statusEl.textContent = 'Draw';
            }
        } else if (this.chess.isCheck()) {
            const turn = this.chess.turn() === 'w' ? 'White' : 'Black';
            statusEl.textContent = `${turn} is in check!`;
        } else {
            const turn = this.chess.turn() === 'w' ? 'White' : 'Black';
            statusEl.textContent = `${turn} to move`;
        }
        
        // Update wisdom based on game state
        wisdomEl.textContent = this.getWisdom();
    }
    
    /**
     * Get Dostoevsky wisdom based on game state
     */
    getWisdom() {
        const wisdoms = {
            opening: [
                "The beginning is always today...",
                "To begin is the hardest step...",
                "Every new beginning comes from some other beginning's end."
            ],
            middlegame: [
                "The soul is healed by being with children...",
                "Man is a mystery...",
                "Pain and suffering are always inevitable for a large intelligence."
            ],
            check: [
                "The darker the night, the brighter the stars.",
                "To go wrong in one's own way is better than to go right in someone else's.",
                "Realists do not fear the results of their study."
            ],
            winning: [
                "Taking a new step is what people fear most.",
                "The cleverest of all is the one who calls himself a fool.",
                "Much unhappiness comes from walking alone."
            ],
            losing: [
                "Suffering is the sole origin of consciousness.",
                "To love is to suffer and there is no love otherwise.",
                "What is hell? I maintain that it is the suffering of being unable to love."
            ],
            endgame: [
                "The end crowns all...",
                "We sometimes encounter people who are so much absorbed...",
                "Beauty will save the world."
            ]
        };
        
        let phase = 'opening';
        const moveCount = this.chess.history().length;
        
        if (moveCount < 10) phase = 'opening';
        else if (moveCount < 30) phase = 'middlegame';
        else phase = 'endgame';
        
        if (this.chess.isCheck()) phase = 'check';
        
        const options = wisdoms[phase];
        return options[Math.floor(Math.random() * options.length)];
    }
    
    /**
     * Check if game is over
     */
    checkGameOver() {
        if (this.chess.isGameOver()) {
            this.gameOver = true;
            this.stopTimer();
            
            let title = 'Game Over';
            let message = '';
            
            if (this.chess.isCheckmate()) {
                const winner = this.chess.turn() === 'w' ? 'Black' : 'White';
                title = 'Checkmate!';
                message = `${winner} emerges victorious from the struggle.`;
            } else if (this.chess.isStalemate()) {
                title = 'Stalemate';
                message = 'Neither side can claim victory. The battle ends in silence.';
            } else if (this.chess.isThreefoldRepetition()) {
                title = 'Draw by Repetition';
                message = 'Like echoes in an empty cathedral, the same position repeats.';
            } else if (this.chess.isInsufficientMaterial()) {
                title = 'Draw';
                message = 'The remaining forces cannot achieve victory.';
            } else if (this.chess.isDraw()) {
                title = 'Draw';
                message = 'The struggle ends without a victor.';
            }
            
            this.showGameOverModal(title, message);
            return true;
        }
        return false;
    }
    
    /**
     * Show game over modal
     */
    showGameOverModal(title, message) {
        const modal = document.getElementById('gameOverModal');
        const titleEl = document.getElementById('gameOverTitle');
        const messageEl = document.getElementById('gameOverMessage');
        const quoteEl = document.getElementById('gameOverQuote');
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        quoteEl.textContent = this.getGameOverQuote(title.includes('Checkmate'));
        
        modal.classList.remove('hidden');
    }
    
    /**
     * Get game over quote
     */
    getGameOverQuote(isCheckmate) {
        const quotes = isCheckmate ? [
            '"The soul is healed by being with children." — Perhaps by playing chess as well.',
            '"Man only likes to count his troubles; he doesn\'t calculate his happiness."',
            '"To go wrong in one\'s own way is better than to go right in someone else\'s."',
            '"The cleverest of all, in my opinion, is the man who calls himself a fool at least once a month."'
        ] : [
            '"Pain and suffering are always inevitable for a large intelligence and a deep heart."',
            '"The darker the night, the brighter the stars."',
            '"Beauty will save the world."',
            '"Taking a new step, uttering a new word, is what people fear most."'
        ];
        
        return quotes[Math.floor(Math.random() * quotes.length)];
    }
    
    /**
     * Flip the board
     */
    flipBoard() {
        this.isFlipped = !this.isFlipped;
        this.initBoard();
    }
    
    /**
     * Set player color
     */
    setPlayerColor(color) {
        this.playerColor = color;
        this.isFlipped = color === 'black';
        this.initBoard();
    }
    
    /**
     * Start timer
     */
    startTimer(seconds) {
        this.timeControl = seconds;
        this.whiteTime = seconds;
        this.blackTime = seconds;
        
        if (seconds > 0) {
            this.activeTimer = 'w';
            this.timerInterval = setInterval(() => this.tickTimer(), 1000);
        }
        
        this.updateTimerDisplay();
    }
    
    /**
     * Tick timer
     */
    tickTimer() {
        if (this.gameOver) {
            this.stopTimer();
            return;
        }
        
        if (this.activeTimer === 'w') {
            this.whiteTime--;
            if (this.whiteTime <= 0) {
                this.handleTimeout('white');
            }
        } else {
            this.blackTime--;
            if (this.blackTime <= 0) {
                this.handleTimeout('black');
            }
        }
        
        this.updateTimerDisplay();
    }
    
    /**
     * Switch timer
     */
    switchTimer() {
        if (this.timeControl > 0) {
            this.activeTimer = this.chess.turn();
        }
    }
    
    /**
     * Stop timer
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    /**
     * Update timer display
     */
    updateTimerDisplay() {
        const playerTimer = document.getElementById('playerTimer');
        const opponentTimer = document.getElementById('opponentTimer');
        
        const formatTime = (seconds) => {
            if (seconds <= 0) return '0:00';
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };
        
        if (this.timeControl === 0) {
            playerTimer.textContent = '∞';
            opponentTimer.textContent = '∞';
        } else {
            if (this.playerColor === 'white') {
                playerTimer.textContent = formatTime(this.whiteTime);
                opponentTimer.textContent = formatTime(this.blackTime);
                
                playerTimer.classList.toggle('low-time', this.whiteTime < 30);
                opponentTimer.classList.toggle('low-time', this.blackTime < 30);
            } else {
                playerTimer.textContent = formatTime(this.blackTime);
                opponentTimer.textContent = formatTime(this.whiteTime);
                
                playerTimer.classList.toggle('low-time', this.blackTime < 30);
                opponentTimer.classList.toggle('low-time', this.whiteTime < 30);
            }
        }
    }
    
    /**
     * Handle timeout
     */
    handleTimeout(color) {
        this.gameOver = true;
        this.stopTimer();
        
        const winner = color === 'white' ? 'Black' : 'White';
        this.showGameOverModal(
            'Time Out!',
            `${color.charAt(0).toUpperCase() + color.slice(1)} ran out of time. ${winner} wins!`
        );
    }
    
    /**
     * Toggle sound
     */
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const btn = document.getElementById('soundBtn');
        btn.textContent = this.soundEnabled ? '🔊' : '🔇';
    }
    
    /**
     * Undo last move
     */
    undoMove() {
        if (this.gameMode === 'online') return;
        if (this.moveHistory.length === 0) return;
        
        this.chess.undo();
        this.moveHistory.pop();
        
        // Update captured pieces
        const lastMove = this.moveHistory[this.moveHistory.length - 1];
        if (lastMove && lastMove.captured) {
            if (lastMove.color === 'w') {
                this.capturedByWhite.pop();
            } else {
                this.capturedByBlack.pop();
            }
        }
        
        // Update last move highlight
        if (this.moveHistory.length > 0) {
            const prevMove = this.moveHistory[this.moveHistory.length - 1];
            this.lastMove = { from: prevMove.from, to: prevMove.to };
        } else {
            this.lastMove = null;
        }
        
        this.clearHighlights();
        this.renderPieces();
        this.updateMoveHistory();
        this.updateCapturedPieces();
        this.updateStatus();
    }
    
    /**
     * Get FEN string
     */
    getFen() {
        return this.chess.fen();
    }
    
    /**
     * Load FEN string
     */
    loadFen(fen) {
        this.chess.load(fen);
        this.renderPieces();
        this.updateStatus();
    }
    
    /**
     * Get PGN string
     */
    getPgn() {
        return this.chess.pgn();
    }
    
    /**
     * Reset game
     */
    reset() {
        this.chess.reset();
        this.selectedSquare = null;
        this.legalMoves = [];
        this.lastMove = null;
        this.moveHistory = [];
        this.capturedByWhite = [];
        this.capturedByBlack = [];
        this.gameOver = false;
        this.stopTimer();
        
        this.clearHighlights();
        this.renderPieces();
        this.updateMoveHistory();
        this.updateCapturedPieces();
        this.updateStatus();
        this.updateTimerDisplay();
    }
    
    /**
     * Set game mode
     */
    setGameMode(mode, difficulty = 'medium') {
        this.gameMode = mode;
        this.aiDifficulty = difficulty;
    }
    
    /**
     * Apply opponent's move (for online play)
     */
    applyMove(from, to, promotion = null) {
        return this.makeMove(from, to, promotion);
    }
}

// Export for use in other modules
window.ChessGame = ChessGame;
