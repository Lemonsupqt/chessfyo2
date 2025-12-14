/**
 * DOSTOEVSKY CHESS - Game Manager
 * Central game state and logic manager
 */

class GameManager {
    constructor() {
        this.chess = new Chess();
        this.board = null;
        this.mode = null; // 'local', 'online', 'ai', 'puzzles'
        this.playerColor = 'white';
        this.aiLevel = 10;
        this.playerName = 'Prince Myshkin';
        this.opponentName = 'Raskolnikov';
        
        // Timer
        this.timeControl = 600; // seconds
        this.whiteTime = 600;
        this.blackTime = 600;
        this.timerInterval = null;
        this.isTimerRunning = false;
        
        // Game state
        this.isPlayerTurn = true;
        this.pendingPromotion = null;
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        
        // Settings
        this.settings = {
            soundEnabled: true,
            volume: 0.7,
            highlightMoves: true,
            showCoordinates: true,
            autoQueen: false,
            moveConfirm: false,
            atmosphereEffects: true
        };

        this.loadSettings();
    }

    init(boardContainerId) {
        this.board = new ChessBoard(boardContainerId, {
            onMove: (move) => this.handlePlayerMove(move),
            onSelect: (row, col) => this.handleSquareSelect(row, col),
            highlightMoves: this.settings.highlightMoves,
            showCoordinates: this.settings.showCoordinates
        });

        this.updateBoard();
        this.updateStatus();
    }

    startNewGame(options = {}) {
        // Reset game state
        this.chess.reset();
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.pendingPromotion = null;
        
        // Apply options
        this.mode = options.mode || 'local';
        this.playerColor = options.playerColor || 'white';
        this.timeControl = options.timeControl || 0;
        this.aiLevel = options.aiLevel || 10;
        
        // Reset timer
        this.stopTimer();
        this.whiteTime = this.timeControl;
        this.blackTime = this.timeControl;
        this.updateTimerDisplay();
        
        // Set player turn
        this.isPlayerTurn = (this.playerColor === 'white');
        
        // Update board orientation
        if (this.playerColor === 'black') {
            this.board.setOrientation('black');
        } else {
            this.board.setOrientation('white');
        }
        
        // Update UI
        this.updateBoard();
        this.updateStatus();
        this.updateMoveHistory();
        this.updateCapturedPieces();
        
        // Set names based on mode
        this.updatePlayerNames(options);
        
        // Start AI if needed
        if (this.mode === 'ai' && this.playerColor === 'black') {
            this.makeAIMove();
        }
        
        // Start timer if time control is set
        if (this.timeControl > 0) {
            this.startTimer();
        }
        
        // Play start sound
        if (window.sounds) {
            window.sounds.play('gameStart');
        }
        
        // Update quote
        this.updateQuote();
        
        console.log(`New game started: ${this.mode} mode`);
    }

    updatePlayerNames(options) {
        const whiteNameEl = document.getElementById('player-name');
        const blackNameEl = document.getElementById('opponent-name');
        
        if (this.mode === 'ai') {
            const aiNames = ['Alyosha', 'Dmitri', 'Ivan', 'Smerdyakov', 'Grand Inquisitor'];
            const aiIndex = Math.min(Math.floor(this.aiLevel / 4), aiNames.length - 1);
            this.opponentName = aiNames[aiIndex];
        } else if (this.mode === 'online') {
            this.opponentName = options.opponentName || 'Opponent';
        } else {
            this.opponentName = 'Raskolnikov';
        }
        
        if (this.playerColor === 'white') {
            if (whiteNameEl) whiteNameEl.textContent = this.playerName;
            if (blackNameEl) blackNameEl.textContent = this.opponentName;
        } else {
            if (whiteNameEl) whiteNameEl.textContent = this.opponentName;
            if (blackNameEl) blackNameEl.textContent = this.playerName;
        }
    }

    handleSquareSelect(row, col) {
        const piece = this.chess.getPiece(row, col);
        
        if (piece) {
            const pieceColor = this.chess.getPieceColor(piece);
            
            // Check if it's the player's piece and their turn
            if (this.canSelectPiece(pieceColor)) {
                const moves = this.chess.getPieceMoves(row, col);
                if (moves.length > 0) {
                    this.board.selectSquare(row, col, moves);
                    if (window.sounds) {
                        window.sounds.play('select');
                    }
                }
            }
        }
        
        this.board.clearHint();
    }

    canSelectPiece(pieceColor) {
        // In local mode, can select current turn's pieces
        if (this.mode === 'local') {
            return pieceColor === this.chess.turn;
        }
        
        // In online/AI mode, can only select player's pieces on their turn
        const isPlayerPiece = (pieceColor === 'w' && this.playerColor === 'white') ||
                             (pieceColor === 'b' && this.playerColor === 'black');
        return isPlayerPiece && this.isPlayerTurn;
    }

    handlePlayerMove(move) {
        // Check if promotion is needed
        const piece = this.chess.getPiece(move.from.row, move.from.col);
        if (piece && piece.toLowerCase() === 'p') {
            const isPromotion = (this.chess.getPieceColor(piece) === 'w' && move.to.row === 0) ||
                               (this.chess.getPieceColor(piece) === 'b' && move.to.row === 7);
            
            if (isPromotion) {
                if (this.settings.autoQueen) {
                    move.promotion = 'q';
                } else {
                    this.showPromotionDialog(move);
                    return;
                }
            }
        }
        
        this.executeMove(move);
    }

    executeMove(move) {
        const result = this.chess.makeMove(move);
        
        if (!result) {
            console.log('Invalid move');
            return false;
        }
        
        // Update captured pieces
        if (result.captured) {
            const capturedBy = this.chess.getPieceColor(result.piece) === 'w' ? 'white' : 'black';
            this.capturedPieces[capturedBy].push(result.captured);
        }
        if (result.enPassantCapture) {
            const capturedBy = this.chess.getPieceColor(result.piece) === 'w' ? 'white' : 'black';
            this.capturedPieces[capturedBy].push(result.enPassantCapture);
        }
        
        // Play appropriate sound
        this.playMoveSound(result);
        
        // Update board
        this.board.animateMove(move.from, move.to, () => {
            this.updateBoard();
            this.board.highlightLastMove(move.from, move.to);
            
            // Highlight check
            if (this.chess.isInCheck(this.chess.turn)) {
                const kingPos = this.chess.findKing(this.chess.turn);
                this.board.highlightCheck(kingPos.row, kingPos.col);
            }
        });
        
        // Update move history
        this.moveHistory.push(result);
        this.updateMoveHistory();
        this.updateCapturedPieces();
        
        // Update status
        this.updateStatus();
        
        // Check for game end
        if (this.chess.gameOver) {
            this.endGame(this.chess.result);
            return true;
        }
        
        // Handle multiplayer
        if (this.mode === 'online' && window.multiplayer.isConnected()) {
            window.multiplayer.sendMove(move);
        }
        
        // Handle AI
        if (this.mode === 'ai') {
            this.isPlayerTurn = !this.isPlayerTurn;
            if (!this.isPlayerTurn) {
                setTimeout(() => this.makeAIMove(), 300);
            }
        } else if (this.mode === 'online') {
            this.isPlayerTurn = !this.isPlayerTurn;
        }
        
        // Clear selection
        this.board.clearSelection();
        this.board.clearHint();
        
        return true;
    }

    playMoveSound(result) {
        if (!window.sounds) return;
        
        if (result.isCheckmate) {
            window.sounds.play('checkmate');
        } else if (result.isCheck) {
            window.sounds.play('check');
        } else if (result.captured || result.enPassant) {
            window.sounds.play('capture');
        } else if (result.castling) {
            window.sounds.play('castle');
        } else if (result.promotion) {
            window.sounds.play('promote');
        } else {
            window.sounds.play('move');
        }
    }

    async makeAIMove() {
        if (this.chess.gameOver) return;
        
        const fen = this.chess.getFEN();
        
        try {
            window.stockfish.setSkillLevel(this.aiLevel);
            window.stockfish.setPosition(fen);
            
            window.stockfish.onBestMove = (move) => {
                if (move) {
                    this.executeMove(move);
                    this.isPlayerTurn = true;
                }
            };
            
            // Search with appropriate time based on difficulty
            const searchTime = 500 + (this.aiLevel * 100);
            window.stockfish.search({ movetime: searchTime });
        } catch (error) {
            console.error('AI move error:', error);
            // Fallback to random move
            const moves = this.chess.getLegalMoves();
            if (moves.length > 0) {
                const randomMove = moves[Math.floor(Math.random() * moves.length)];
                this.executeMove(randomMove);
                this.isPlayerTurn = true;
            }
        }
    }

    handleOpponentMove(move) {
        this.executeMove(move);
        this.isPlayerTurn = true;
    }

    showPromotionDialog(move) {
        this.pendingPromotion = move;
        
        const modal = document.getElementById('modal-promotion');
        const piecesContainer = document.getElementById('promotion-pieces');
        
        // Set piece colors
        const isWhite = this.chess.getPieceColor(this.chess.getPiece(move.from.row, move.from.col)) === 'w';
        const pieces = isWhite ? ['♕', '♖', '♗', '♘'] : ['♛', '♜', '♝', '♞'];
        const pieceTypes = ['q', 'r', 'b', 'n'];
        
        piecesContainer.innerHTML = '';
        pieces.forEach((symbol, i) => {
            const btn = document.createElement('button');
            btn.className = 'promo-piece';
            btn.textContent = symbol;
            btn.dataset.piece = pieceTypes[i];
            if (!isWhite) btn.classList.add('black-piece');
            piecesContainer.appendChild(btn);
        });
        
        modal.classList.add('active');
    }

    handlePromotionChoice(piece) {
        if (this.pendingPromotion) {
            this.pendingPromotion.promotion = piece;
            this.executeMove(this.pendingPromotion);
            this.pendingPromotion = null;
        }
        
        document.getElementById('modal-promotion').classList.remove('active');
    }

    undoMove() {
        if (this.mode === 'online') return; // Can't undo in online games
        
        const entry = this.chess.undoMove();
        if (!entry) return;
        
        // In AI mode, undo two moves
        if (this.mode === 'ai' && this.moveHistory.length > 0) {
            this.chess.undoMove();
            this.moveHistory.pop();
        }
        
        this.moveHistory.pop();
        
        // Recalculate captured pieces
        this.recalculateCaptured();
        
        this.updateBoard();
        this.updateMoveHistory();
        this.updateCapturedPieces();
        this.updateStatus();
        this.board.clearSelection();
        
        if (window.sounds) {
            window.sounds.play('move');
        }
    }

    redoMove() {
        const entry = this.chess.redoMove();
        if (!entry) return;
        
        this.moveHistory.push(entry);
        
        this.updateBoard();
        this.updateMoveHistory();
        this.updateStatus();
        
        if (window.sounds) {
            window.sounds.play('move');
        }
    }

    recalculateCaptured() {
        this.capturedPieces = { white: [], black: [] };
        for (const entry of this.chess.history) {
            if (entry.captured) {
                const capturedBy = this.chess.getPieceColor(entry.piece) === 'w' ? 'white' : 'black';
                this.capturedPieces[capturedBy].push(entry.captured);
            }
            if (entry.enPassantCapture) {
                const capturedBy = this.chess.getPieceColor(entry.piece) === 'w' ? 'white' : 'black';
                this.capturedPieces[capturedBy].push(entry.enPassantCapture);
            }
        }
    }

    async getHint() {
        if (this.mode === 'online') return; // No hints in online games
        
        const fen = this.chess.getFEN();
        
        try {
            const hint = await window.stockfish.getHint(fen);
            if (hint) {
                this.board.showHint(hint.from, hint.to);
                
                // Auto-clear after 3 seconds
                setTimeout(() => {
                    this.board.clearHint();
                }, 3000);
            }
        } catch (error) {
            console.error('Hint error:', error);
        }
    }

    resign() {
        if (this.mode === 'online' && window.multiplayer.isConnected()) {
            window.multiplayer.resign();
        }
        
        const winner = this.chess.turn === 'w' ? 'Black' : 'White';
        this.endGame(`${winner} wins by resignation`);
    }

    offerDraw() {
        if (this.mode === 'online' && window.multiplayer.isConnected()) {
            window.multiplayer.offerDraw();
            // Show message to user
            this.updateStatus('Draw offer sent...');
        } else if (this.mode === 'local') {
            // In local mode, just end as draw
            if (confirm('Do both players agree to a draw?')) {
                this.endGame('Draw by agreement');
            }
        }
    }

    endGame(result) {
        this.stopTimer();
        this.chess.gameOver = true;
        this.chess.result = result;
        
        // Play sound
        if (window.sounds) {
            if (result.includes('checkmate')) {
                window.sounds.play('checkmate');
            } else {
                window.sounds.play('gameEnd');
            }
        }
        
        // Show game over modal
        this.showGameOverModal(result);
    }

    showGameOverModal(result) {
        const modal = document.getElementById('modal-gameover');
        const titleEl = document.getElementById('gameover-title');
        const resultEl = document.getElementById('gameover-result');
        const quoteEl = document.getElementById('gameover-quote');
        
        // Determine title
        if (result.includes('checkmate')) {
            titleEl.textContent = 'Checkmate!';
        } else if (result.includes('Draw')) {
            titleEl.textContent = 'Draw';
        } else if (result.includes('resignation')) {
            titleEl.textContent = 'Resignation';
        } else if (result.includes('time')) {
            titleEl.textContent = 'Time Out!';
        } else {
            titleEl.textContent = 'Game Over';
        }
        
        resultEl.textContent = result;
        
        // Get appropriate quote
        const quotes = window.quotes ? window.quotes.getGameOverQuote(result) : {
            text: "The soul is healed by being with children.",
            source: "The Idiot"
        };
        quoteEl.innerHTML = `"${quotes.text}"<cite>— ${quotes.source}</cite>`;
        
        modal.classList.add('active');
    }

    // Timer functions
    startTimer() {
        if (this.timeControl === 0) return;
        
        this.isTimerRunning = true;
        this.timerInterval = setInterval(() => {
            if (this.chess.turn === 'w') {
                this.whiteTime--;
                if (this.whiteTime <= 0) {
                    this.whiteTime = 0;
                    this.endGame('Black wins on time');
                }
            } else {
                this.blackTime--;
                if (this.blackTime <= 0) {
                    this.blackTime = 0;
                    this.endGame('White wins on time');
                }
            }
            this.updateTimerDisplay();
        }, 1000);
    }

    stopTimer() {
        this.isTimerRunning = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        const formatTime = (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };
        
        const playerTimerEl = document.getElementById('player-timer');
        const opponentTimerEl = document.getElementById('opponent-timer');
        
        if (this.playerColor === 'white') {
            if (playerTimerEl) playerTimerEl.textContent = formatTime(this.whiteTime);
            if (opponentTimerEl) opponentTimerEl.textContent = formatTime(this.blackTime);
            
            // Low time warning
            if (playerTimerEl) playerTimerEl.classList.toggle('low-time', this.whiteTime < 60);
            if (opponentTimerEl) opponentTimerEl.classList.toggle('low-time', this.blackTime < 60);
        } else {
            if (playerTimerEl) playerTimerEl.textContent = formatTime(this.blackTime);
            if (opponentTimerEl) opponentTimerEl.textContent = formatTime(this.whiteTime);
            
            if (playerTimerEl) playerTimerEl.classList.toggle('low-time', this.blackTime < 60);
            if (opponentTimerEl) opponentTimerEl.classList.toggle('low-time', this.whiteTime < 60);
        }
    }

    // UI Update functions
    updateBoard() {
        this.board.setPosition(this.chess.board);
    }

    updateStatus() {
        const statusEl = document.getElementById('status-text');
        if (!statusEl) return;
        
        if (this.chess.gameOver) {
            statusEl.textContent = this.chess.result;
            return;
        }
        
        let status = this.chess.turn === 'w' ? 'White' : 'Black';
        status += ' to move';
        
        if (this.chess.isInCheck(this.chess.turn)) {
            status += ' (in check)';
        }
        
        statusEl.textContent = status;
        
        // Update player card highlighting
        const playerCard = document.querySelector('.player-card.current');
        const opponentCard = document.querySelector('.player-card.opponent');
        
        if (playerCard && opponentCard) {
            const isPlayerTurnToMove = (this.chess.turn === 'w' && this.playerColor === 'white') ||
                                       (this.chess.turn === 'b' && this.playerColor === 'black');
            
            if (this.mode === 'local') {
                // In local mode, highlight current turn
                playerCard.classList.toggle('active', this.chess.turn === 'w');
                opponentCard.classList.toggle('active', this.chess.turn === 'b');
            } else {
                playerCard.classList.toggle('active', isPlayerTurnToMove);
                opponentCard.classList.toggle('active', !isPlayerTurnToMove);
            }
        }
    }

    updateMoveHistory() {
        const movesListEl = document.getElementById('moves-list');
        if (!movesListEl) return;
        
        movesListEl.innerHTML = '';
        
        for (let i = 0; i < this.chess.history.length; i += 2) {
            const moveRow = document.createElement('div');
            moveRow.className = 'move-row';
            
            const moveNum = document.createElement('span');
            moveNum.className = 'move-number';
            moveNum.textContent = Math.floor(i / 2) + 1 + '.';
            moveRow.appendChild(moveNum);
            
            // White move
            const whiteMove = document.createElement('span');
            whiteMove.className = 'move-white';
            let whiteSan = this.chess.history[i].san;
            if (this.chess.history[i].isCheckmate) whiteSan += '#';
            else if (this.chess.history[i].isCheck) whiteSan += '+';
            whiteMove.textContent = whiteSan;
            whiteMove.addEventListener('click', () => this.goToMove(i));
            moveRow.appendChild(whiteMove);
            
            // Black move
            if (this.chess.history[i + 1]) {
                const blackMove = document.createElement('span');
                blackMove.className = 'move-black';
                let blackSan = this.chess.history[i + 1].san;
                if (this.chess.history[i + 1].isCheckmate) blackSan += '#';
                else if (this.chess.history[i + 1].isCheck) blackSan += '+';
                blackMove.textContent = blackSan;
                blackMove.addEventListener('click', () => this.goToMove(i + 1));
                moveRow.appendChild(blackMove);
            }
            
            movesListEl.appendChild(moveRow);
        }
        
        // Scroll to bottom
        movesListEl.scrollTop = movesListEl.scrollHeight;
    }

    goToMove(index) {
        // This would implement position navigation
        // For now, just highlight the current move
        document.querySelectorAll('.move-white, .move-black').forEach(el => {
            el.classList.remove('current');
        });
        
        const moveEls = document.querySelectorAll('.move-white, .move-black');
        if (moveEls[index]) {
            moveEls[index].classList.add('current');
        }
    }

    updateCapturedPieces() {
        const whiteCapturedEl = document.querySelector('#captured-white .pieces-list');
        const blackCapturedEl = document.querySelector('#captured-black .pieces-list');
        
        const pieceSymbols = {
            'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
            'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
        };
        
        if (whiteCapturedEl) {
            whiteCapturedEl.innerHTML = this.capturedPieces.white
                .map(p => `<span class="piece">${pieceSymbols[p]}</span>`)
                .join('');
        }
        
        if (blackCapturedEl) {
            blackCapturedEl.innerHTML = this.capturedPieces.black
                .map(p => `<span class="piece">${pieceSymbols[p]}</span>`)
                .join('');
        }
    }

    updateQuote() {
        const quoteEl = document.getElementById('game-quote');
        if (quoteEl && window.quotes) {
            const quote = window.quotes.getRandomQuote();
            quoteEl.textContent = `"${quote.text}"`;
            const citeEl = quoteEl.parentElement.querySelector('cite');
            if (citeEl) {
                citeEl.textContent = `— ${quote.source}`;
            }
        }
    }

    flipBoard() {
        this.board.flip();
    }

    // Export functions
    exportPGN() {
        const headers = {
            White: this.playerColor === 'white' ? this.playerName : this.opponentName,
            Black: this.playerColor === 'black' ? this.playerName : this.opponentName
        };
        return this.chess.getPGN(headers);
    }

    exportFEN() {
        return this.chess.getFEN();
    }

    // Settings
    loadSettings() {
        try {
            const saved = localStorage.getItem('dostoevsky-chess-settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Could not load settings:', e);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('dostoevsky-chess-settings', JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Could not save settings:', e);
        }
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        
        // Apply setting
        switch (key) {
            case 'highlightMoves':
                if (this.board) this.board.setHighlightMoves(value);
                break;
            case 'showCoordinates':
                if (this.board) this.board.setShowCoordinates(value);
                break;
            case 'soundEnabled':
                if (window.sounds) window.sounds.setEnabled(value);
                break;
            case 'volume':
                if (window.sounds) window.sounds.setVolume(value / 100);
                break;
            case 'atmosphereEffects':
                document.querySelector('.atmosphere').style.display = value ? 'block' : 'none';
                break;
        }
    }
}

// Create global game instance
window.game = new GameManager();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameManager;
}
