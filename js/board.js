/**
 * Chess Board UI - The Brothers Gambit
 * Interactive chess board with drag & drop support
 */

class ChessBoard {
    constructor(elementId, game, options = {}) {
        this.element = document.getElementById(elementId);
        this.game = game;
        this.options = {
            orientation: 'white',
            interactive: true,
            showLegalMoves: true,
            showLastMove: true,
            onMove: null,
            onPromotion: null,
            ...options
        };
        
        this.selectedSquare = null;
        this.legalMoves = [];
        this.lastMove = null;
        this.isDragging = false;
        this.draggedPiece = null;
        this.draggedFrom = null;
        
        this.init();
    }

    init() {
        this.createBoard();
        this.addEventListeners();
        this.render();
    }

    createBoard() {
        this.element.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                const isLight = (row + col) % 2 === 0;
                
                square.className = `square ${isLight ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                square.dataset.square = this.getSquareName(row, col);
                
                this.element.appendChild(square);
            }
        }
    }

    getSquareName(row, col) {
        // Adjust for board orientation
        if (this.options.orientation === 'black') {
            row = 7 - row;
            col = 7 - col;
        }
        return String.fromCharCode(97 + col) + (8 - row);
    }

    getSquareElement(square) {
        return this.element.querySelector(`[data-square="${square}"]`);
    }

    addEventListeners() {
        // Click to select/move
        this.element.addEventListener('click', (e) => {
            if (!this.options.interactive) return;
            
            const squareEl = e.target.closest('.square');
            if (!squareEl) return;
            
            const square = squareEl.dataset.square;
            this.handleSquareClick(square);
        });

        // Drag and drop
        this.element.addEventListener('mousedown', (e) => {
            if (!this.options.interactive) return;
            
            const squareEl = e.target.closest('.square');
            const pieceEl = e.target.closest('.piece');
            
            if (!squareEl || !pieceEl) return;
            
            const square = squareEl.dataset.square;
            const piece = this.game.getPiece(square);
            
            if (!piece || piece.color !== this.game.turn) return;
            
            this.startDrag(e, square, pieceEl);
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.updateDrag(e);
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (this.isDragging) {
                this.endDrag(e);
            }
        });

        // Touch support
        this.element.addEventListener('touchstart', (e) => {
            if (!this.options.interactive) return;
            
            const touch = e.touches[0];
            const squareEl = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.square');
            const pieceEl = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.piece');
            
            if (!squareEl) return;
            
            const square = squareEl.dataset.square;
            
            if (pieceEl) {
                const piece = this.game.getPiece(square);
                if (piece && piece.color === this.game.turn) {
                    e.preventDefault();
                    this.startDrag(touch, square, pieceEl);
                }
            }
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                e.preventDefault();
                const touch = e.touches[0];
                this.updateDrag(touch);
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            if (this.isDragging) {
                const touch = e.changedTouches[0];
                this.endDrag(touch);
            }
        });
    }

    handleSquareClick(square) {
        const piece = this.game.getPiece(square);

        // If we have a selected piece
        if (this.selectedSquare) {
            // Check if clicking on a legal move
            if (this.legalMoves.includes(square)) {
                this.makeMove(this.selectedSquare, square);
                return;
            }
            
            // Clicking on own piece - select it instead
            if (piece && piece.color === this.game.turn) {
                this.selectSquare(square);
                return;
            }
            
            // Clicking elsewhere - deselect
            this.deselectSquare();
            return;
        }

        // No piece selected - try to select
        if (piece && piece.color === this.game.turn) {
            this.selectSquare(square);
        }
    }

    selectSquare(square) {
        this.deselectSquare();
        
        this.selectedSquare = square;
        this.legalMoves = this.game.getLegalMoves(square);
        
        const squareEl = this.getSquareElement(square);
        if (squareEl) {
            squareEl.classList.add('selected');
        }
        
        if (this.options.showLegalMoves) {
            this.showLegalMoves();
        }
    }

    deselectSquare() {
        if (this.selectedSquare) {
            const squareEl = this.getSquareElement(this.selectedSquare);
            if (squareEl) {
                squareEl.classList.remove('selected');
            }
        }
        
        this.selectedSquare = null;
        this.legalMoves = [];
        this.hideLegalMoves();
    }

    showLegalMoves() {
        for (const move of this.legalMoves) {
            const squareEl = this.getSquareElement(move);
            if (squareEl) {
                const targetPiece = this.game.getPiece(move);
                const isEnPassant = this.game.enPassantSquare === move && 
                    this.game.getPiece(this.selectedSquare)?.type === 'p';
                
                if (targetPiece || isEnPassant) {
                    squareEl.classList.add('legal-capture');
                } else {
                    squareEl.classList.add('legal-move');
                }
            }
        }
    }

    hideLegalMoves() {
        this.element.querySelectorAll('.legal-move, .legal-capture').forEach(el => {
            el.classList.remove('legal-move', 'legal-capture');
        });
    }

    startDrag(e, square, pieceEl) {
        this.isDragging = true;
        this.draggedFrom = square;
        this.selectSquare(square);
        
        // Clone the piece for dragging
        this.draggedPiece = pieceEl.cloneNode(true);
        this.draggedPiece.classList.add('dragging');
        document.body.appendChild(this.draggedPiece);
        
        // Hide original piece
        pieceEl.style.opacity = '0';
        this.originalPieceEl = pieceEl;
        
        this.updateDrag(e);
    }

    updateDrag(e) {
        if (!this.draggedPiece) return;
        
        const x = e.clientX || e.pageX;
        const y = e.clientY || e.pageY;
        
        this.draggedPiece.style.left = `${x}px`;
        this.draggedPiece.style.top = `${y}px`;
        this.draggedPiece.style.transform = 'translate(-50%, -50%) scale(1.2)';
    }

    endDrag(e) {
        if (!this.isDragging) return;
        
        const x = e.clientX || e.pageX;
        const y = e.clientY || e.pageY;
        
        // Find the square under the cursor
        const elements = document.elementsFromPoint(x, y);
        const squareEl = elements.find(el => el.classList.contains('square'));
        
        if (squareEl) {
            const targetSquare = squareEl.dataset.square;
            
            if (this.legalMoves.includes(targetSquare)) {
                this.makeMove(this.draggedFrom, targetSquare);
            }
        }
        
        // Clean up
        if (this.draggedPiece) {
            this.draggedPiece.remove();
            this.draggedPiece = null;
        }
        
        if (this.originalPieceEl) {
            this.originalPieceEl.style.opacity = '1';
            this.originalPieceEl = null;
        }
        
        this.isDragging = false;
        this.draggedFrom = null;
        this.deselectSquare();
    }

    async makeMove(from, to) {
        const piece = this.game.getPiece(from);
        
        // Check for promotion
        let promotion = 'q';
        if (piece && piece.type === 'p') {
            const toIndex = this.game.algebraicToIndex(to);
            if ((piece.color === 'w' && toIndex.row === 0) || 
                (piece.color === 'b' && toIndex.row === 7)) {
                promotion = await this.getPromotionChoice(piece.color);
                if (!promotion) {
                    this.deselectSquare();
                    return;
                }
            }
        }
        
        const move = this.game.move(from, to, promotion);
        
        if (move) {
            this.lastMove = { from, to };
            this.deselectSquare();
            this.render();
            
            if (this.options.onMove) {
                this.options.onMove(move);
            }
        }
    }

    getPromotionChoice(color) {
        return new Promise((resolve) => {
            const modal = document.getElementById('promotion-modal');
            const pieces = modal.querySelectorAll('.promotion-piece');
            
            // Set piece colors
            const symbols = color === 'w' 
                ? { q: '♕', r: '♖', b: '♗', n: '♘' }
                : { q: '♛', r: '♜', b: '♝', n: '♞' };
            
            pieces.forEach(btn => {
                const piece = btn.dataset.piece;
                btn.textContent = symbols[piece];
                btn.className = `promotion-piece ${color === 'w' ? 'white' : 'black'}`;
            });
            
            modal.classList.add('active');
            
            const handleChoice = (e) => {
                const btn = e.target.closest('.promotion-piece');
                if (btn) {
                    modal.classList.remove('active');
                    pieces.forEach(p => p.removeEventListener('click', handleChoice));
                    resolve(btn.dataset.piece);
                }
            };
            
            pieces.forEach(btn => btn.addEventListener('click', handleChoice));
            
            // Close on outside click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    resolve(null);
                }
            }, { once: true });
        });
    }

    render() {
        // Clear all pieces and highlights
        this.element.querySelectorAll('.piece').forEach(el => el.remove());
        this.element.querySelectorAll('.last-move, .check').forEach(el => {
            el.classList.remove('last-move', 'check');
        });
        
        // Highlight last move
        if (this.lastMove && this.options.showLastMove) {
            const fromEl = this.getSquareElement(this.lastMove.from);
            const toEl = this.getSquareElement(this.lastMove.to);
            if (fromEl) fromEl.classList.add('last-move');
            if (toEl) toEl.classList.add('last-move');
        }
        
        // Highlight king in check
        if (this.game.isInCheck()) {
            const king = this.game.findKing(this.game.turn);
            if (king) {
                const kingSquare = this.game.indexToAlgebraic(king.row, king.col);
                const kingEl = this.getSquareElement(kingSquare);
                if (kingEl) kingEl.classList.add('check');
            }
        }
        
        // Render pieces
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.game.board[row][col];
                if (piece) {
                    const square = this.game.indexToAlgebraic(row, col);
                    this.renderPiece(piece, square);
                }
            }
        }
        
        // Update coordinates if board is flipped
        this.updateCoordinates();
    }

    renderPiece(piece, square) {
        const squareEl = this.getSquareElement(square);
        if (!squareEl) return;
        
        const pieceEl = document.createElement('div');
        pieceEl.className = `piece ${piece.color === 'w' ? 'white' : 'black'}`;
        pieceEl.textContent = Chess.getPieceSymbol(piece);
        pieceEl.draggable = false; // We handle dragging manually
        
        squareEl.appendChild(pieceEl);
    }

    updateCoordinates() {
        const isFlipped = this.options.orientation === 'black';
        
        // Update file coordinates
        const topCoords = document.querySelector('.board-coordinates.top');
        const bottomCoords = document.querySelector('.board-coordinates.bottom');
        const leftCoords = document.querySelector('.board-coordinates.left');
        const rightCoords = document.querySelector('.board-coordinates.right');
        
        const files = isFlipped ? 'hgfedcba' : 'abcdefgh';
        const ranks = isFlipped ? '12345678' : '87654321';
        
        if (topCoords) {
            topCoords.innerHTML = files.split('').map(f => `<span>${f}</span>`).join('');
        }
        if (bottomCoords) {
            bottomCoords.innerHTML = files.split('').map(f => `<span>${f}</span>`).join('');
        }
        if (leftCoords) {
            leftCoords.innerHTML = ranks.split('').map(r => `<span>${r}</span>`).join('');
        }
        if (rightCoords) {
            rightCoords.innerHTML = ranks.split('').map(r => `<span>${r}</span>`).join('');
        }
        
        // Update board flip class
        if (isFlipped) {
            this.element.classList.add('flipped');
        } else {
            this.element.classList.remove('flipped');
        }
    }

    flip() {
        this.options.orientation = this.options.orientation === 'white' ? 'black' : 'white';
        this.createBoard();
        this.render();
    }

    setOrientation(color) {
        if (this.options.orientation !== color) {
            this.options.orientation = color;
            this.createBoard();
            this.render();
        }
    }

    setInteractive(interactive) {
        this.options.interactive = interactive;
    }

    highlightSquares(squares, className = 'highlighted') {
        squares.forEach(square => {
            const el = this.getSquareElement(square);
            if (el) el.classList.add(className);
        });
    }

    clearHighlights(className = 'highlighted') {
        this.element.querySelectorAll(`.${className}`).forEach(el => {
            el.classList.remove(className);
        });
    }

    // Update board from external game state (multiplayer sync)
    sync() {
        this.render();
    }

    // Get current position as array for AI
    getPosition() {
        return this.game.getFEN();
    }
}

// Export
window.ChessBoard = ChessBoard;
