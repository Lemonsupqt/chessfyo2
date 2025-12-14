// Chess game logic using chess.js library

class ChessGame {
    constructor() {
        this.game = new Chess();
        this.selectedSquare = null;
        this.board = null;
        this.onMoveCallback = null;
        this.onGameOverCallback = null;
        this.isPlayerTurn = true;
        this.playerColor = 'white';
    }

    init(boardElement) {
        this.board = boardElement;
        this.renderBoard();
        this.attachEventListeners();
    }

    setPlayerColor(color) {
        this.playerColor = color;
        this.isPlayerTurn = (color === 'white');
    }

    setOnMove(callback) {
        this.onMoveCallback = callback;
    }

    setOnGameOver(callback) {
        this.onGameOverCallback = callback;
    }

    renderBoard() {
        if (!this.board) return;

        this.board.innerHTML = '';
        const boardState = this.game.board();
        const isFlipped = this.playerColor === 'black';

        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                const displayRank = isFlipped ? 7 - rank : rank;
                const displayFile = isFlipped ? 7 - file : file;
                const square = boardState[displayRank][displayFile];
                const squareName = String.fromCharCode(97 + displayFile) + (8 - displayRank);

                const squareElement = document.createElement('div');
                squareElement.className = `square ${(rank + file) % 2 === 0 ? 'light' : 'dark'}`;
                squareElement.dataset.square = squareName;
                squareElement.setAttribute('role', 'button');
                squareElement.setAttribute('aria-label', squareName);

                if (square) {
                    const piece = this.getPieceSymbol(square);
                    squareElement.textContent = piece;
                    squareElement.setAttribute('aria-label', `${squareName} - ${square.color} ${square.type}`);
                }

                this.board.appendChild(squareElement);
            }
        }

        // Re-highlight check if present
        if (this.game.isCheck()) {
            const turn = this.game.turn();
            const kingSquare = this.findKing(turn);
            if (kingSquare) {
                const squareElement = this.board.querySelector(`[data-square="${kingSquare}"]`);
                if (squareElement) {
                    squareElement.classList.add('in-check');
                }
            }
        }
    }

    getPieceSymbol(piece) {
        const symbols = {
            'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♔',
            'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♚'
        };
        // Use Unicode chess symbols, fallback to letters if needed
        const symbol = symbols[piece.type];
        return symbol || piece.type.toUpperCase();
    }

    attachEventListeners() {
        if (!this.board) return;

        this.board.addEventListener('click', (e) => {
            const squareElement = e.target.closest('.square');
            if (!squareElement) return;

            const square = squareElement.dataset.square;
            this.handleSquareClick(square);
        });
    }

    handleSquareClick(square) {
        if (!this.isPlayerTurn) return;

        const piece = this.game.get(square);

        // If clicking on a selected square, deselect it
        if (this.selectedSquare === square) {
            this.clearSelection();
            return;
        }

        // If clicking on own piece, select it
        if (piece && piece.color === this.playerColor) {
            this.selectSquare(square);
            return;
        }

        // If a square is selected, try to make a move
        if (this.selectedSquare) {
            this.makeMove(this.selectedSquare, square);
        }
    }

    selectSquare(square) {
        this.clearSelection();
        this.selectedSquare = square;
        
        const squareElement = this.board.querySelector(`[data-square="${square}"]`);
        if (squareElement) {
            squareElement.classList.add('selected');
        }

        // Highlight possible moves
        const moves = this.game.moves({ square, verbose: true });
        moves.forEach(move => {
            const targetSquare = this.board.querySelector(`[data-square="${move.to}"]`);
            if (targetSquare) {
                const piece = this.game.get(move.to);
                if (piece) {
                    targetSquare.classList.add('possible-capture');
                } else {
                    targetSquare.classList.add('possible-move');
                }
            }
        });
    }

    clearSelection() {
        if (this.selectedSquare) {
            const squareElement = this.board.querySelector(`[data-square="${this.selectedSquare}"]`);
            if (squareElement) {
                squareElement.classList.remove('selected');
            }
        }

        // Clear all possible move highlights
        this.board.querySelectorAll('.possible-move, .possible-capture').forEach(el => {
            el.classList.remove('possible-move', 'possible-capture');
        });

        this.selectedSquare = null;
    }

    makeMove(from, to, promotion = 'q') {
        try {
            const move = this.game.move({
                from,
                to,
                promotion
            });

            if (move) {
                this.clearSelection();
                this.renderBoard();
                this.isPlayerTurn = !this.isPlayerTurn;

                if (this.onMoveCallback) {
                    this.onMoveCallback(move);
                }

                // Check for game over
                this.checkGameOver();

                return move;
            }
        } catch (e) {
            console.error('Invalid move:', e);
        }

        return null;
    }

    makeMoveFromNotation(notation) {
        try {
            const move = this.game.move(notation);
            if (move) {
                this.clearSelection();
                this.renderBoard();
                this.isPlayerTurn = !this.isPlayerTurn;

                if (this.onMoveCallback) {
                    this.onMoveCallback(move);
                }

                this.checkGameOver();
                return move;
            }
        } catch (e) {
            console.error('Invalid move notation:', e);
        }
        return null;
    }

    checkGameOver() {
        if (this.game.isCheckmate()) {
            const winner = this.game.turn() === 'w' ? 'black' : 'white';
            if (this.onGameOverCallback) {
                this.onGameOverCallback({
                    type: 'checkmate',
                    winner
                });
            }
        } else if (this.game.isDraw()) {
            let drawType = 'draw';
            if (this.game.isStalemate()) drawType = 'stalemate';
            else if (this.game.isThreefoldRepetition()) drawType = 'threefold';
            else if (this.game.isInsufficientMaterial()) drawType = 'insufficient';
            else if (this.game.isDraw()) drawType = 'fifty-move';

            if (this.onGameOverCallback) {
                this.onGameOverCallback({
                    type: drawType
                });
            }
        } else if (this.game.isCheck()) {
            // Highlight king in check
            const turn = this.game.turn();
            const kingSquare = this.findKing(turn);
            if (kingSquare) {
                const squareElement = this.board.querySelector(`[data-square="${kingSquare}"]`);
                if (squareElement) {
                    squareElement.classList.add('in-check');
                }
            }
        }
    }

    findKing(color) {
        const board = this.game.board();
        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                const square = board[rank][file];
                if (square && square.type === 'k' && square.color === color) {
                    return String.fromCharCode(97 + file) + (8 - rank);
                }
            }
        }
        return null;
    }

    reset() {
        this.game = new Chess();
        this.selectedSquare = null;
        this.isPlayerTurn = (this.playerColor === 'white');
        this.renderBoard();
    }

    getFEN() {
        return this.game.fen();
    }

    loadFEN(fen) {
        this.game.load(fen);
        this.renderBoard();
    }

    getPGN() {
        return this.game.pgn();
    }

    getHistory() {
        return this.game.history({ verbose: true });
    }

    isGameOver() {
        return this.game.isGameOver();
    }

    getTurn() {
        return this.game.turn();
    }
}
