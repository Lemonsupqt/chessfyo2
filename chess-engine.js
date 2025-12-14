// ========================================
// CHESS ENGINE - MAIN GAME LOGIC
// ========================================

class ChessEngine {
    constructor() {
        this.chess = new Chess();
        this.boardElement = document.getElementById('chessBoard');
        this.selectedSquare = null;
        this.validMoves = [];
        this.isFlipped = false;
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        
        // Dostoevsky quotes for various game situations
        this.quotes = {
            start: [
                { text: "The mystery of human existence lies not in just staying alive, but in finding something to live for.", cite: "The Brothers Karamazov" },
                { text: "Man is sometimes extraordinarily, passionately, in love with suffering.", cite: "Notes from Underground" }
            ],
            check: [
                { text: "Pain and suffering are always inevitable for a large intelligence and a deep heart.", cite: "Crime and Punishment" },
                { text: "Man has it all in his hands, and it all slips through his fingers from sheer cowardice.", cite: "Notes from Underground" }
            ],
            checkmate: [
                { text: "To live without hope is to cease to live.", cite: "The Possessed" },
                { text: "The darker the night, the brighter the stars, the deeper the grief, the closer is God!", cite: "Crime and Punishment" }
            ],
            stalemate: [
                { text: "If there is no God, everything is permitted.", cite: "The Brothers Karamazov" },
                { text: "Man is a mystery. It needs to be unraveled.", cite: "Letter to his brother" }
            ]
        };
        
        this.initializeBoard();
        this.updateDisplay();
    }
    
    // Unicode chess pieces
    getPieceUnicode(piece) {
        const pieces = {
            'wp': '♙', 'wn': '♘', 'wb': '♗', 'wr': '♖', 'wq': '♕', 'wk': '♔',
            'bp': '♟', 'bn': '♞', 'bb': '♝', 'br': '♜', 'bq': '♛', 'bk': '♚'
        };
        if (!piece) return '';
        const key = piece.color + piece.type;
        return pieces[key] || '';
    }
    
    initializeBoard() {
        this.boardElement.innerHTML = '';
        
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
        
        if (this.isFlipped) {
            files.reverse();
            ranks.reverse();
        }
        
        for (let rank of ranks) {
            for (let file of files) {
                const square = file + rank;
                const squareElement = document.createElement('div');
                squareElement.className = 'square';
                squareElement.dataset.square = square;
                
                // Add light or dark class
                const fileIndex = files.indexOf(file);
                const rankIndex = ranks.indexOf(rank);
                const isLight = (fileIndex + rankIndex) % 2 === 0;
                squareElement.classList.add(isLight ? 'light' : 'dark');
                
                // Add piece if present
                const piece = this.chess.get(square);
                if (piece) {
                    const pieceElement = document.createElement('span');
                    pieceElement.className = 'piece';
                    pieceElement.textContent = this.getPieceUnicode(piece);
                    squareElement.appendChild(pieceElement);
                }
                
                // Add click handler
                squareElement.addEventListener('click', () => this.handleSquareClick(square));
                
                this.boardElement.appendChild(squareElement);
            }
        }
        
        this.highlightLastMove();
        this.highlightCheck();
    }
    
    handleSquareClick(square) {
        // Don't allow moves if game is over
        if (this.chess.game_over()) {
            return;
        }
        
        const piece = this.chess.get(square);
        
        // If a square is already selected
        if (this.selectedSquare) {
            // Try to make a move
            const move = this.makeMove(this.selectedSquare, square);
            
            if (move) {
                this.selectedSquare = null;
                this.validMoves = [];
                this.initializeBoard();
                this.updateDisplay();
                this.updateMoveHistory();
                this.checkGameState();
                
                // Trigger callback if set (for AI or multiplayer)
                if (this.onMoveCallback) {
                    this.onMoveCallback(move);
                }
            } else {
                // If clicking on own piece, select it instead
                if (piece && piece.color === this.chess.turn()) {
                    this.selectSquare(square);
                } else {
                    this.clearSelection();
                }
            }
        } else {
            // Select the square if it has a piece of the current turn
            if (piece && piece.color === this.chess.turn()) {
                this.selectSquare(square);
            }
        }
    }
    
    selectSquare(square) {
        this.selectedSquare = square;
        this.validMoves = this.chess.moves({ square: square, verbose: true });
        
        // Highlight selected square
        document.querySelectorAll('.square').forEach(sq => {
            sq.classList.remove('selected', 'valid-move', 'valid-capture');
        });
        
        const selectedElement = document.querySelector(`[data-square="${square}"]`);
        if (selectedElement) {
            selectedElement.classList.add('selected');
        }
        
        // Highlight valid moves
        this.validMoves.forEach(move => {
            const targetElement = document.querySelector(`[data-square="${move.to}"]`);
            if (targetElement) {
                if (move.captured) {
                    targetElement.classList.add('valid-capture');
                } else {
                    targetElement.classList.add('valid-move');
                }
            }
        });
    }
    
    clearSelection() {
        this.selectedSquare = null;
        this.validMoves = [];
        document.querySelectorAll('.square').forEach(sq => {
            sq.classList.remove('selected', 'valid-move', 'valid-capture');
        });
        this.highlightLastMove();
        this.highlightCheck();
    }
    
    makeMove(from, to) {
        // Check for pawn promotion
        const piece = this.chess.get(from);
        let promotion = undefined;
        
        if (piece && piece.type === 'p') {
            const toRank = to[1];
            if ((piece.color === 'w' && toRank === '8') || (piece.color === 'b' && toRank === '1')) {
                promotion = 'q'; // Always promote to queen for simplicity
            }
        }
        
        const move = this.chess.move({ from, to, promotion });
        
        if (move) {
            // Track captured pieces
            if (move.captured) {
                const capturedPiece = this.getPieceUnicode({ color: move.color === 'w' ? 'b' : 'w', type: move.captured });
                this.capturedPieces[move.color === 'w' ? 'white' : 'black'].push(capturedPiece);
            }
        }
        
        return move;
    }
    
    highlightLastMove() {
        const history = this.chess.history({ verbose: true });
        if (history.length > 0) {
            const lastMove = history[history.length - 1];
            const fromElement = document.querySelector(`[data-square="${lastMove.from}"]`);
            const toElement = document.querySelector(`[data-square="${lastMove.to}"]`);
            
            if (fromElement) fromElement.classList.add('last-move');
            if (toElement) toElement.classList.add('last-move');
        }
    }
    
    highlightCheck() {
        if (this.chess.in_check()) {
            const turn = this.chess.turn();
            const kingSquare = this.findKingSquare(turn);
            const kingElement = document.querySelector(`[data-square="${kingSquare}"]`);
            if (kingElement) {
                kingElement.classList.add('in-check');
            }
        }
    }
    
    findKingSquare(color) {
        const board = this.chess.board();
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = board[i][j];
                if (piece && piece.type === 'k' && piece.color === color) {
                    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
                    return files[j] + (8 - i);
                }
            }
        }
        return null;
    }
    
    updateDisplay() {
        // Update status
        const statusElement = document.getElementById('statusDisplay');
        let status = '';
        
        if (this.chess.in_checkmate()) {
            status = this.chess.turn() === 'w' ? 'Black wins by checkmate!' : 'White wins by checkmate!';
        } else if (this.chess.in_draw()) {
            status = 'Draw!';
        } else if (this.chess.in_stalemate()) {
            status = 'Stalemate!';
        } else if (this.chess.in_check()) {
            status = (this.chess.turn() === 'w' ? 'White' : 'Black') + ' is in check!';
        } else {
            status = (this.chess.turn() === 'w' ? 'White' : 'Black') + ' to move';
        }
        
        statusElement.textContent = status;
        
        // Update FEN
        document.getElementById('fenDisplay').value = this.chess.fen();
        
        // Update PGN
        document.getElementById('pgnDisplay').value = this.chess.pgn();
        
        // Update captured pieces
        document.getElementById('blackCaptured').textContent = this.capturedPieces.white.join(' ');
        
        // Update quote based on game state
        this.updateQuote();
    }
    
    updateQuote() {
        const quoteElement = document.getElementById('gameQuote');
        let quoteSet = this.quotes.start;
        
        if (this.chess.in_checkmate() || this.chess.game_over()) {
            quoteSet = this.quotes.checkmate;
        } else if (this.chess.in_stalemate() || this.chess.in_draw()) {
            quoteSet = this.quotes.stalemate;
        } else if (this.chess.in_check()) {
            quoteSet = this.quotes.check;
        }
        
        const quote = quoteSet[Math.floor(Math.random() * quoteSet.length)];
        quoteElement.innerHTML = `${quote.text}<cite>— ${quote.cite}</cite>`;
    }
    
    updateMoveHistory() {
        const movesListElement = document.getElementById('movesList');
        const history = this.chess.history();
        
        if (history.length === 0) {
            movesListElement.innerHTML = '<p class="empty-state">The board awaits the first move...</p>';
            return;
        }
        
        movesListElement.innerHTML = '';
        
        for (let i = 0; i < history.length; i += 2) {
            const moveNumber = Math.floor(i / 2) + 1;
            const whiteMove = history[i];
            const blackMove = history[i + 1] || '';
            
            const movePair = document.createElement('div');
            movePair.className = 'move-pair';
            movePair.innerHTML = `
                <span class="move-number">${moveNumber}.</span>
                <span class="move-white">${whiteMove}</span>
                <span class="move-black">${blackMove}</span>
            `;
            movesListElement.appendChild(movePair);
        }
        
        // Scroll to bottom
        movesListElement.scrollTop = movesListElement.scrollHeight;
    }
    
    checkGameState() {
        if (this.chess.game_over()) {
            setTimeout(() => {
                this.showGameOverModal();
            }, 500);
        }
    }
    
    showGameOverModal() {
        const modal = document.getElementById('gameOverModal');
        const title = document.getElementById('gameOverTitle');
        const message = document.getElementById('gameOverMessage');
        const quoteElement = document.getElementById('gameOverQuote');
        
        let titleText = 'Game Over';
        let messageText = '';
        let quote = this.quotes.checkmate[0];
        
        if (this.chess.in_checkmate()) {
            titleText = this.chess.turn() === 'w' ? 'Black Wins!' : 'White Wins!';
            messageText = 'Victory through checkmate';
            quote = this.quotes.checkmate[Math.floor(Math.random() * this.quotes.checkmate.length)];
        } else if (this.chess.in_stalemate()) {
            titleText = 'Stalemate';
            messageText = 'No legal moves remain';
            quote = this.quotes.stalemate[Math.floor(Math.random() * this.quotes.stalemate.length)];
        } else if (this.chess.in_threefold_repetition()) {
            titleText = 'Draw';
            messageText = 'Threefold repetition';
            quote = this.quotes.stalemate[0];
        } else if (this.chess.insufficient_material()) {
            titleText = 'Draw';
            messageText = 'Insufficient material';
            quote = this.quotes.stalemate[1];
        } else if (this.chess.in_draw()) {
            titleText = 'Draw';
            messageText = 'Fifty-move rule';
            quote = this.quotes.stalemate[0];
        }
        
        title.textContent = titleText;
        message.textContent = messageText;
        quoteElement.innerHTML = `"${quote.text}"<br><cite>— ${quote.cite}</cite>`;
        
        modal.style.display = 'flex';
    }
    
    flipBoard() {
        this.isFlipped = !this.isFlipped;
        this.initializeBoard();
        this.updateDisplay();
    }
    
    undo() {
        this.chess.undo();
        
        // Update captured pieces
        this.capturedPieces = { white: [], black: [] };
        const history = this.chess.history({ verbose: true });
        history.forEach(move => {
            if (move.captured) {
                const capturedPiece = this.getPieceUnicode({ color: move.color === 'w' ? 'b' : 'w', type: move.captured });
                this.capturedPieces[move.color === 'w' ? 'white' : 'black'].push(capturedPiece);
            }
        });
        
        this.clearSelection();
        this.initializeBoard();
        this.updateDisplay();
        this.updateMoveHistory();
    }
    
    reset() {
        this.chess.reset();
        this.capturedPieces = { white: [], black: [] };
        this.moveHistory = [];
        this.clearSelection();
        this.initializeBoard();
        this.updateDisplay();
        this.updateMoveHistory();
        
        const modal = document.getElementById('gameOverModal');
        modal.style.display = 'none';
    }
    
    loadPosition(fen) {
        this.chess.load(fen);
        this.initializeBoard();
        this.updateDisplay();
    }
    
    getGame() {
        return this.chess;
    }
    
    setOnMoveCallback(callback) {
        this.onMoveCallback = callback;
    }
}
