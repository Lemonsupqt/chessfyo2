/**
 * DOSTOEVSKY CHESS - Board Renderer
 * Handles board rendering, piece display, and user interactions
 */

class ChessBoard {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            showCoordinates: true,
            highlightMoves: true,
            orientation: 'white',
            draggable: true,
            ...options
        };

        this.selectedSquare = null;
        this.legalMoves = [];
        this.lastMove = null;
        this.isFlipped = false;
        this.hintSquares = [];

        this.onMove = options.onMove || (() => {});
        this.onSelect = options.onSelect || (() => {});

        this.pieceSymbols = {
            'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
            'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
        };

        this.init();
    }

    init() {
        this.container.innerHTML = '';
        this.createSquares();
        this.setupDragAndDrop();
    }

    createSquares() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = 'square';
                square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
                square.dataset.row = row;
                square.dataset.col = col;

                square.addEventListener('click', (e) => this.handleSquareClick(e, row, col));

                this.container.appendChild(square);
            }
        }
    }

    setupDragAndDrop() {
        if (!this.options.draggable) return;

        let draggedPiece = null;
        let originalSquare = null;
        let ghostPiece = null;

        const handleDragStart = (e, piece) => {
            const row = parseInt(piece.parentElement.dataset.row);
            const col = parseInt(piece.parentElement.dataset.col);

            draggedPiece = piece;
            originalSquare = { row, col };

            // Create ghost piece
            ghostPiece = piece.cloneNode(true);
            ghostPiece.classList.add('dragging');
            document.body.appendChild(ghostPiece);

            // Hide original
            piece.style.opacity = '0.3';

            // Select the piece
            this.handleSquareClick(null, row, col);

            // Position ghost
            const updateGhostPosition = (clientX, clientY) => {
                const size = this.container.offsetWidth / 8;
                ghostPiece.style.left = (clientX - size / 2) + 'px';
                ghostPiece.style.top = (clientY - size / 2) + 'px';
                ghostPiece.style.fontSize = (size * 0.8) + 'px';
            };

            if (e.type === 'touchstart') {
                const touch = e.touches[0];
                updateGhostPosition(touch.clientX, touch.clientY);
            } else {
                updateGhostPosition(e.clientX, e.clientY);
            }
        };

        const handleDragMove = (e) => {
            if (!ghostPiece) return;

            e.preventDefault();

            const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

            const size = this.container.offsetWidth / 8;
            ghostPiece.style.left = (clientX - size / 2) + 'px';
            ghostPiece.style.top = (clientY - size / 2) + 'px';
        };

        const handleDragEnd = (e) => {
            if (!ghostPiece) return;

            const clientX = e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX;
            const clientY = e.type === 'touchend' ? e.changedTouches[0].clientY : e.clientY;

            // Find target square
            const rect = this.container.getBoundingClientRect();
            const size = rect.width / 8;

            let col = Math.floor((clientX - rect.left) / size);
            let row = Math.floor((clientY - rect.top) / size);

            if (this.isFlipped) {
                row = 7 - row;
                col = 7 - col;
            }

            // Restore original piece opacity
            if (draggedPiece) {
                draggedPiece.style.opacity = '1';
            }

            // Remove ghost
            ghostPiece.remove();
            ghostPiece = null;

            // Try to make move
            if (row >= 0 && row <= 7 && col >= 0 && col <= 7) {
                if (originalSquare.row !== row || originalSquare.col !== col) {
                    this.handleSquareClick(null, row, col);
                }
            }

            draggedPiece = null;
            originalSquare = null;
        };

        // Mouse events
        this.container.addEventListener('mousedown', (e) => {
            const piece = e.target.closest('.piece');
            if (piece) {
                handleDragStart(e, piece);
            }
        });

        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);

        // Touch events
        this.container.addEventListener('touchstart', (e) => {
            const piece = e.target.closest('.piece');
            if (piece) {
                handleDragStart(e, piece);
            }
        }, { passive: false });

        document.addEventListener('touchmove', handleDragMove, { passive: false });
        document.addEventListener('touchend', handleDragEnd);
    }

    handleSquareClick(e, row, col) {
        if (this.isFlipped) {
            row = 7 - row;
            col = 7 - col;
        }

        // Check if clicking on a legal move
        if (this.selectedSquare) {
            const isLegalMove = this.legalMoves.some(m =>
                m.to.row === row && m.to.col === col
            );

            if (isLegalMove) {
                this.onMove({
                    from: this.selectedSquare,
                    to: { row, col }
                });
                this.clearSelection();
                return;
            }
        }

        // Select new piece
        this.onSelect(row, col);
    }

    setPosition(board) {
        // Clear all pieces
        this.container.querySelectorAll('.piece').forEach(p => p.remove());

        // Add pieces
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece) {
                    this.addPiece(row, col, piece);
                }
            }
        }
    }

    addPiece(row, col, piece) {
        let displayRow = row;
        let displayCol = col;

        if (this.isFlipped) {
            displayRow = 7 - row;
            displayCol = 7 - col;
        }

        const squareIndex = displayRow * 8 + displayCol;
        const square = this.container.children[squareIndex];

        const pieceElement = document.createElement('span');
        pieceElement.className = 'piece';
        pieceElement.classList.add(piece === piece.toUpperCase() ? 'white' : 'black');
        pieceElement.textContent = this.pieceSymbols[piece];
        pieceElement.dataset.piece = piece;

        square.appendChild(pieceElement);
    }

    selectSquare(row, col, moves) {
        this.clearSelection();
        this.selectedSquare = { row, col };
        this.legalMoves = moves;

        let displayRow = row;
        let displayCol = col;

        if (this.isFlipped) {
            displayRow = 7 - row;
            displayCol = 7 - col;
        }

        // Highlight selected square
        const selectedIndex = displayRow * 8 + displayCol;
        this.container.children[selectedIndex].classList.add('selected');

        // Highlight legal moves
        if (this.options.highlightMoves) {
            for (const move of moves) {
                let moveDisplayRow = move.to.row;
                let moveDisplayCol = move.to.col;

                if (this.isFlipped) {
                    moveDisplayRow = 7 - move.to.row;
                    moveDisplayCol = 7 - move.to.col;
                }

                const moveIndex = moveDisplayRow * 8 + moveDisplayCol;
                const square = this.container.children[moveIndex];

                if (move.capture) {
                    square.classList.add('legal-capture');
                } else {
                    square.classList.add('legal-move');
                }
            }
        }
    }

    clearSelection() {
        this.selectedSquare = null;
        this.legalMoves = [];

        this.container.querySelectorAll('.square').forEach(square => {
            square.classList.remove('selected', 'legal-move', 'legal-capture');
        });
    }

    highlightLastMove(from, to) {
        // Clear previous last move highlight
        this.container.querySelectorAll('.last-move').forEach(square => {
            square.classList.remove('last-move');
        });

        if (from && to) {
            this.lastMove = { from, to };

            let fromDisplayRow = from.row;
            let fromDisplayCol = from.col;
            let toDisplayRow = to.row;
            let toDisplayCol = to.col;

            if (this.isFlipped) {
                fromDisplayRow = 7 - from.row;
                fromDisplayCol = 7 - from.col;
                toDisplayRow = 7 - to.row;
                toDisplayCol = 7 - to.col;
            }

            const fromIndex = fromDisplayRow * 8 + fromDisplayCol;
            const toIndex = toDisplayRow * 8 + toDisplayCol;

            this.container.children[fromIndex].classList.add('last-move');
            this.container.children[toIndex].classList.add('last-move');
        }
    }

    highlightCheck(row, col) {
        this.container.querySelectorAll('.check').forEach(square => {
            square.classList.remove('check');
        });

        if (row !== undefined && col !== undefined) {
            let displayRow = row;
            let displayCol = col;

            if (this.isFlipped) {
                displayRow = 7 - row;
                displayCol = 7 - col;
            }

            const index = displayRow * 8 + displayCol;
            this.container.children[index].classList.add('check');
        }
    }

    showHint(from, to) {
        this.clearHint();

        let fromDisplayRow = from.row;
        let fromDisplayCol = from.col;
        let toDisplayRow = to.row;
        let toDisplayCol = to.col;

        if (this.isFlipped) {
            fromDisplayRow = 7 - from.row;
            fromDisplayCol = 7 - from.col;
            toDisplayRow = 7 - to.row;
            toDisplayCol = 7 - to.col;
        }

        const fromIndex = fromDisplayRow * 8 + fromDisplayCol;
        const toIndex = toDisplayRow * 8 + toDisplayCol;

        this.container.children[fromIndex].classList.add('hint');
        this.container.children[toIndex].classList.add('hint');
        this.hintSquares = [fromIndex, toIndex];
    }

    clearHint() {
        for (const index of this.hintSquares) {
            this.container.children[index].classList.remove('hint');
        }
        this.hintSquares = [];
    }

    flip() {
        this.isFlipped = !this.isFlipped;
        this.container.classList.toggle('flipped');
        this.container.parentElement.classList.toggle('flipped');

        // Re-render the position
        if (window.game && window.game.chess) {
            this.setPosition(window.game.chess.board);
            if (this.lastMove) {
                this.highlightLastMove(this.lastMove.from, this.lastMove.to);
            }
        }
    }

    setOrientation(color) {
        const shouldFlip = (color === 'black' && !this.isFlipped) ||
                          (color === 'white' && this.isFlipped);
        if (shouldFlip) {
            this.flip();
        }
    }

    animateMove(from, to, callback) {
        let fromDisplayRow = from.row;
        let fromDisplayCol = from.col;
        let toDisplayRow = to.row;
        let toDisplayCol = to.col;

        if (this.isFlipped) {
            fromDisplayRow = 7 - from.row;
            fromDisplayCol = 7 - from.col;
            toDisplayRow = 7 - to.row;
            toDisplayCol = 7 - to.col;
        }

        const fromIndex = fromDisplayRow * 8 + fromDisplayCol;
        const toIndex = toDisplayRow * 8 + toDisplayCol;

        const fromSquare = this.container.children[fromIndex];
        const toSquare = this.container.children[toIndex];
        const piece = fromSquare.querySelector('.piece');

        if (!piece) {
            if (callback) callback();
            return;
        }

        // Calculate translation
        const squareSize = fromSquare.offsetWidth;
        const dx = (toDisplayCol - fromDisplayCol) * squareSize;
        const dy = (toDisplayRow - fromDisplayRow) * squareSize;

        piece.classList.add('moving');
        piece.style.transform = `translate(${dx}px, ${dy}px)`;

        setTimeout(() => {
            piece.classList.remove('moving');
            piece.style.transform = '';
            if (callback) callback();
        }, 200);
    }

    setTheme(theme) {
        this.container.classList.remove('theme-classic', 'theme-manuscript', 'theme-midnight', 'theme-sepia');
        this.container.classList.add(`theme-${theme}`);
    }

    setPieceStyle(style) {
        this.container.classList.remove('piece-style-classic', 'piece-style-ornate', 'piece-style-minimalist');
        this.container.classList.add(`piece-style-${style}`);
    }

    setHighlightMoves(enabled) {
        this.options.highlightMoves = enabled;
    }

    setShowCoordinates(enabled) {
        this.options.showCoordinates = enabled;
        const frame = this.container.parentElement;
        if (frame) {
            frame.classList.toggle('hide-coords', !enabled);
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChessBoard;
}
