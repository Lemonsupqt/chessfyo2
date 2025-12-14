/**
 * THE GRAND INQUISITOR'S CHESS
 * UI Module - Rendering and Interface Management
 */

class ChessUI {
    constructor(game) {
        this.game = game;
        this.boardElement = null;
        this.moveHistoryElement = null;
        this.capturedWhiteElement = null;
        this.capturedBlackElement = null;
        this.playerTimerElement = null;
        this.opponentTimerElement = null;
        this.playerNameElement = null;
        this.opponentNameElement = null;
        this.playerAvatarElement = null;
        this.opponentAvatarElement = null;
        
        this.soundEnabled = true;
        this.moveSound = null;
        this.captureSound = null;
        this.checkSound = null;
        
        // Dostoevsky quotes for various game events
        this.quotes = {
            gameStart: [
                '"The soul is healed by being with children." — Apply this to chess pieces.',
                '"Man is a mystery. It needs to be unravelled." — As does this position.',
                '"To go wrong in one\'s own way is better than to go right in someone else\'s."',
                '"The darker the night, the brighter the stars." — Let the game begin.',
            ],
            check: [
                '"Pain and suffering are always inevitable for a large intelligence."',
                '"The cleverest of all, in my opinion, is the man who calls himself a fool."',
                '"Right or wrong, it\'s very pleasant to break something from time to time."',
            ],
            capture: [
                '"Taking a new step, uttering a new word, is what people fear most."',
                '"To remain human, sometimes you have to sacrifice a piece."',
                '"Everything passes, but nothing entirely goes."',
            ],
            win: [
                '"Beauty will save the world." — And today, you are that beauty.',
                '"The soul is healed by being with children." — Your victory is pure.',
                '"Man only likes to count his troubles; he doesn\'t calculate his happiness."',
            ],
            lose: [
                '"Suffering is the sole origin of consciousness."',
                '"To remain human is to admit defeat, sometimes."',
                '"The darker the night, the brighter the stars." — Learn from this.',
            ],
            draw: [
                '"The soul is healed by being with children." — Peace was found.',
                '"To go wrong in one\'s own way is better than to go right in someone else\'s."',
                '"Neither victory nor defeat, but understanding."',
            ],
            general: [
                '"Man is a mystery. It needs to be unravelled."',
                '"The soul is healed by being with children."',
                '"Beauty will save the world."',
                '"To go wrong in one\'s own way is better than to go right in someone else\'s."',
                '"Pain and suffering are always inevitable for a large intelligence."',
                '"The cleverest of all, in my opinion, is the man who calls himself a fool."',
                '"Taking a new step, uttering a new word, is what people fear most."',
                '"If you want to overcome the whole world, overcome yourself."',
                '"Realists do not fear the results of their study."',
                '"Much unhappiness has come into the world because of bewilderment."',
            ]
        };
        
        // Bind game callbacks
        this.game.onBoardUpdate = () => this.renderBoard();
        this.game.onTimeUpdate = (white, black) => this.updateTimers(white, black);
    }

    /**
     * Initialize the UI
     */
    init() {
        // Get DOM elements
        this.boardElement = document.getElementById('chessBoard');
        this.moveHistoryElement = document.getElementById('moveHistory');
        this.capturedWhiteElement = document.getElementById('capturedWhitePieces');
        this.capturedBlackElement = document.getElementById('capturedBlackPieces');
        this.playerTimerElement = document.getElementById('playerTimer');
        this.opponentTimerElement = document.getElementById('opponentTimer');
        this.playerNameElement = document.getElementById('playerName');
        this.opponentNameElement = document.getElementById('opponentName');
        this.playerAvatarElement = document.querySelector('.player-info.self .player-avatar');
        this.opponentAvatarElement = document.querySelector('.player-info.opponent .player-avatar');
        this.moveSound = document.getElementById('moveSound');
        this.captureSound = document.getElementById('captureSound');
        this.checkSound = document.getElementById('checkSound');
        
        if (!this.boardElement) {
            console.error('FATAL: Chess board element not found!');
            return;
        }
        
        console.log('ChessUI initialized, rendering board...');
        
        this.renderBoard();
        this.updateMoveHistory();
        this.updateCapturedPieces();
        this.showRandomQuote('general');
        
        console.log('Board rendered with', this.boardElement.children.length, 'squares');
    }

    /**
     * Render the chess board
     */
    renderBoard() {
        // Get board element if not set
        if (!this.boardElement) {
            this.boardElement = document.getElementById('chessBoard');
        }
        
        if (!this.boardElement) {
            console.error('Chess board element not found!');
            return;
        }
        
        // Clear previous content
        this.boardElement.innerHTML = '';
        
        // Get board state
        const board = this.game.getBoard();
        const isFlipped = this.game.isFlipped;
        const kingInCheck = this.game.getKingInCheck();
        const selectedSquare = this.game.selectedSquare;
        const validMoves = this.game.validMoves || [];
        const lastMove = this.game.lastMove;
        
        // Create all 64 squares
        for (let i = 0; i < 64; i++) {
            const displayIndex = isFlipped ? 63 - i : i;
            const squareData = board[displayIndex];
            const sqName = squareData.square;
            
            // Create square element
            const square = document.createElement('div');
            square.className = `square ${squareData.isLight ? 'light' : 'dark'}`;
            square.dataset.square = sqName;
            
            // Highlight last move
            if (lastMove && (sqName === lastMove.from || sqName === lastMove.to)) {
                square.classList.add('last-move');
            }
            
            // Highlight selected square
            if (sqName === selectedSquare) {
                square.classList.add('selected');
            }
            
            // Highlight valid moves
            const validMove = validMoves.find(m => m.to === sqName);
            if (validMove) {
                square.classList.add(validMove.captured || (validMove.flags && validMove.flags.includes('e')) 
                    ? 'valid-capture' 
                    : 'valid-move');
            }
            
            // Highlight king in check
            if (kingInCheck && sqName === kingInCheck) {
                square.classList.add('in-check');
            }
            
            // Add piece if present
            if (squareData.piece) {
                const pieceSymbol = ChessGame.getPieceSymbol(squareData.piece);
                if (pieceSymbol) {
                    const pieceEl = document.createElement('span');
                    pieceEl.className = 'piece';
                    pieceEl.textContent = pieceSymbol;
                    pieceEl.draggable = true;
                    
                    pieceEl.ondragstart = (e) => {
                        e.dataTransfer.setData('text/plain', sqName);
                        pieceEl.classList.add('dragging');
                    };
                    
                    pieceEl.ondragend = () => {
                        pieceEl.classList.remove('dragging');
                    };
                    
                    square.appendChild(pieceEl);
                }
            }
            
            // Add coordinate labels
            const rank = parseInt(sqName[1]);
            const file = sqName[0];
            
            // Rank labels on a-file (or h-file when flipped)
            if ((isFlipped && file === 'h') || (!isFlipped && file === 'a')) {
                const label = document.createElement('span');
                label.className = 'rank-label';
                label.textContent = rank;
                square.appendChild(label);
            }
            
            // File labels on rank 1 (or rank 8 when flipped)
            if ((isFlipped && rank === 8) || (!isFlipped && rank === 1)) {
                const label = document.createElement('span');
                label.className = 'file-label';
                label.textContent = file;
                square.appendChild(label);
            }
            
            // Event handlers
            square.onclick = () => this.handleSquareInteraction(sqName);
            square.ondragover = (e) => e.preventDefault();
            square.ondrop = (e) => {
                e.preventDefault();
                const from = e.dataTransfer.getData('text/plain');
                if (from && from !== sqName) {
                    this.handleDrop(from, sqName);
                }
            };
            
            this.boardElement.appendChild(square);
        }
    }

    /**
     * Handle square interaction (click)
     */
    handleSquareInteraction(square) {
        const result = this.game.handleSquareClick(square);
        
        if (result) {
            if (result.type === 'promotion') {
                this.showPromotionDialog(result.color);
            } else if (result.type === 'move') {
                this.handleMoveResult(result);
            }
            this.renderBoard();
        }
    }

    /**
     * Handle drag and drop
     */
    handleDrop(from, to) {
        // First select the piece
        this.game.selectSquare(from);
        
        // Check if it's a valid move
        const move = this.game.validMoves.find(m => m.to === to);
        
        if (move) {
            // Check for promotion
            if (move.flags.includes('p')) {
                this.game.pendingPromotion = { from, to };
                const piece = this.game.chess.get(from);
                this.showPromotionDialog(piece.color);
            } else {
                const result = this.game.makeMove(from, to);
                if (result) {
                    this.handleMoveResult(result);
                }
            }
        }
        
        this.game.deselectSquare();
        this.renderBoard();
    }

    /**
     * Handle move result
     */
    handleMoveResult(result) {
        if (result.type === 'move') {
            // Play sound
            this.playMoveSound(result.move, result.gameStatus);
            
            // Update UI
            this.updateMoveHistory();
            this.updateCapturedPieces();
            
            // Check for game over
            if (result.gameStatus && result.gameStatus.over) {
                this.showGameOver(result.gameStatus);
            } else if (result.gameStatus && result.gameStatus.inCheck) {
                this.showRandomQuote('check');
            }
            
            // Return move for multiplayer sync
            return result.move;
        }
        return null;
    }

    /**
     * Show promotion dialog
     */
    showPromotionDialog(color) {
        const modal = document.getElementById('promotionModal');
        const piecesContainer = document.getElementById('promotionPieces');
        
        const pieces = color === 'w' ? ['♕', '♖', '♗', '♘'] : ['♛', '♜', '♝', '♞'];
        const pieceTypes = ['q', 'r', 'b', 'n'];
        
        piecesContainer.innerHTML = '';
        
        pieces.forEach((symbol, index) => {
            const btn = document.createElement('button');
            btn.className = 'promotion-piece';
            btn.textContent = symbol;
            btn.addEventListener('click', () => {
                const result = this.game.completePromotion(pieceTypes[index]);
                modal.classList.add('hidden');
                
                if (result) {
                    this.handleMoveResult(result);
                }
                this.renderBoard();
            });
            piecesContainer.appendChild(btn);
        });
        
        modal.classList.remove('hidden');
    }

    /**
     * Play move sound
     */
    playMoveSound(move, status) {
        if (!this.soundEnabled) return;
        
        try {
            if (status && status.inCheck) {
                this.checkSound?.play();
            } else if (move.captured) {
                this.captureSound?.play();
            } else {
                this.moveSound?.play();
            }
        } catch (e) {
            // Sounds may not work due to autoplay restrictions
        }
    }

    /**
     * Update move history display
     */
    updateMoveHistory() {
        if (!this.moveHistoryElement) return;
        
        const history = this.game.moveHistory;
        this.moveHistoryElement.innerHTML = '';
        
        for (let i = 0; i < history.length; i += 2) {
            const moveNum = Math.floor(i / 2) + 1;
            const whiteMove = history[i];
            const blackMove = history[i + 1];
            
            const entry = document.createElement('div');
            entry.className = 'move-entry';
            
            entry.innerHTML = `
                <span class="move-number">${moveNum}.</span>
                <span class="move-white">${whiteMove.san}</span>
                <span class="move-black">${blackMove ? blackMove.san : ''}</span>
            `;
            
            this.moveHistoryElement.appendChild(entry);
        }
        
        // Scroll to bottom
        this.moveHistoryElement.scrollTop = this.moveHistoryElement.scrollHeight;
    }

    /**
     * Update captured pieces display
     */
    updateCapturedPieces() {
        const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9 };
        const pieceSymbols = {
            white: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕' },
            black: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛' }
        };
        
        // Sort captured pieces by value
        const sortPieces = (pieces, color) => {
            return pieces
                .sort((a, b) => pieceValues[b] - pieceValues[a])
                .map(p => pieceSymbols[color][p])
                .join('');
        };
        
        if (this.capturedWhiteElement) {
            this.capturedWhiteElement.textContent = sortPieces(
                this.game.capturedPieces.white, 
                'white'
            );
        }
        
        if (this.capturedBlackElement) {
            this.capturedBlackElement.textContent = sortPieces(
                this.game.capturedPieces.black,
                'black'
            );
        }
    }

    /**
     * Update timers display
     */
    updateTimers(whiteTime, blackTime) {
        const isPlayerWhite = this.game.playerColor === 'white';
        const playerTime = isPlayerWhite ? whiteTime : blackTime;
        const opponentTime = isPlayerWhite ? blackTime : whiteTime;
        
        if (this.playerTimerElement) {
            this.playerTimerElement.textContent = ChessGame.formatTime(playerTime);
            this.playerTimerElement.classList.toggle('active', 
                this.game.getTurn() === this.game.playerColor);
            this.playerTimerElement.classList.toggle('low-time', playerTime <= 30);
        }
        
        if (this.opponentTimerElement) {
            this.opponentTimerElement.textContent = ChessGame.formatTime(opponentTime);
            this.opponentTimerElement.classList.toggle('active',
                this.game.getTurn() !== this.game.playerColor);
            this.opponentTimerElement.classList.toggle('low-time', opponentTime <= 30);
        }
    }

    /**
     * Set player names
     */
    setPlayerNames(playerName, opponentName) {
        if (this.playerNameElement) {
            this.playerNameElement.textContent = playerName || 'You';
        }
        if (this.opponentNameElement) {
            this.opponentNameElement.textContent = opponentName || 'Opponent';
        }
    }

    /**
     * Update player avatars based on color
     */
    updatePlayerAvatars() {
        const isPlayerWhite = this.game.playerColor === 'white';
        
        if (this.playerAvatarElement) {
            this.playerAvatarElement.textContent = isPlayerWhite ? '♔' : '♚';
        }
        if (this.opponentAvatarElement) {
            this.opponentAvatarElement.textContent = isPlayerWhite ? '♚' : '♔';
        }
    }

    /**
     * Show game over modal
     */
    showGameOver(status) {
        const modal = document.getElementById('gameOverModal');
        const icon = document.getElementById('resultIcon');
        const title = document.getElementById('resultTitle');
        const message = document.getElementById('resultMessage');
        const quote = document.getElementById('endingQuote');
        
        let iconText, titleText, messageText, quoteCategory;
        
        const isPlayerWinner = status.winner === this.game.playerColor;
        const isPlayerLoser = status.winner && status.winner !== this.game.playerColor;
        
        switch (status.result) {
            case 'checkmate':
                iconText = isPlayerWinner ? '👑' : '💀';
                titleText = isPlayerWinner ? 'Victory!' : 'Defeat';
                messageText = `Checkmate — ${status.winner === 'white' ? 'White' : 'Black'} wins`;
                quoteCategory = isPlayerWinner ? 'win' : 'lose';
                break;
            case 'timeout':
                iconText = isPlayerWinner ? '⏰' : '⌛';
                titleText = isPlayerWinner ? 'Victory!' : 'Time\'s Up';
                messageText = `${status.winner === 'white' ? 'White' : 'Black'} wins on time`;
                quoteCategory = isPlayerWinner ? 'win' : 'lose';
                break;
            case 'resignation':
                iconText = isPlayerWinner ? '🏳️' : '😔';
                titleText = isPlayerWinner ? 'Victory!' : 'Resigned';
                messageText = `${status.winner === 'white' ? 'White' : 'Black'} wins by resignation`;
                quoteCategory = isPlayerWinner ? 'win' : 'lose';
                break;
            case 'stalemate':
                iconText = '🤝';
                titleText = 'Stalemate';
                messageText = 'The game ends in a draw — no legal moves available';
                quoteCategory = 'draw';
                break;
            case 'repetition':
                iconText = '🔄';
                titleText = 'Draw';
                messageText = 'Draw by threefold repetition';
                quoteCategory = 'draw';
                break;
            case 'insufficient':
                iconText = '⚖️';
                titleText = 'Draw';
                messageText = 'Draw due to insufficient material';
                quoteCategory = 'draw';
                break;
            default:
                iconText = '🤝';
                titleText = 'Draw';
                messageText = 'The game ends in a draw';
                quoteCategory = 'draw';
        }
        
        icon.textContent = iconText;
        title.textContent = titleText;
        message.textContent = messageText;
        quote.textContent = this.getRandomQuote(quoteCategory);
        
        modal.classList.remove('hidden');
    }

    /**
     * Hide game over modal
     */
    hideGameOver() {
        document.getElementById('gameOverModal').classList.add('hidden');
    }

    /**
     * Get a random quote from a category
     */
    getRandomQuote(category) {
        const quotes = this.quotes[category] || this.quotes.general;
        return quotes[Math.floor(Math.random() * quotes.length)];
    }

    /**
     * Show a random quote in the game quote area
     */
    showRandomQuote(category) {
        const quoteElement = document.getElementById('gameQuote');
        if (quoteElement) {
            const p = quoteElement.querySelector('p');
            if (p) {
                p.textContent = this.getRandomQuote(category);
            }
        }
    }

    /**
     * Update the main quote banner
     */
    updateQuoteBanner() {
        const quoteText = document.getElementById('quoteText');
        if (quoteText) {
            quoteText.textContent = this.getRandomQuote('general');
        }
    }

    /**
     * Show a toast notification
     */
    showToast(message, type = 'info') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 4000);
    }

    /**
     * Toggle sound
     */
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        return this.soundEnabled;
    }
}

// Export for use in other modules
window.ChessUI = ChessUI;
