/**
 * DOSTOEVSKY CHESS - Chess Engine
 * Core chess logic: moves, validation, game state
 */

class Chess {
    constructor(fen = null) {
        this.reset();
        if (fen) {
            this.loadFEN(fen);
        }
    }

    // Initial board setup
    reset() {
        this.board = this.createInitialBoard();
        this.turn = 'w';
        this.castling = { K: true, Q: true, k: true, q: true };
        this.enPassant = null;
        this.halfMoveClock = 0;
        this.fullMoveNumber = 1;
        this.history = [];
        this.redoStack = [];
        this.positionHistory = [];
        this.gameOver = false;
        this.result = null;
    }

    createInitialBoard() {
        return [
            ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
            ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
            ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
        ];
    }

    // Get piece at position
    getPiece(row, col) {
        if (row < 0 || row > 7 || col < 0 || col > 7) return null;
        return this.board[row][col];
    }

    // Set piece at position
    setPiece(row, col, piece) {
        if (row >= 0 && row <= 7 && col >= 0 && col <= 7) {
            this.board[row][col] = piece;
        }
    }

    // Get color of piece
    getPieceColor(piece) {
        if (!piece) return null;
        return piece === piece.toUpperCase() ? 'w' : 'b';
    }

    // Check if it's a specific color's turn
    isWhiteTurn() {
        return this.turn === 'w';
    }

    // Convert algebraic notation to board coordinates
    algebraicToCoords(square) {
        const col = square.charCodeAt(0) - 97; // 'a' = 0
        const row = 8 - parseInt(square[1]);   // '8' = 0
        return { row, col };
    }

    // Convert board coordinates to algebraic notation
    coordsToAlgebraic(row, col) {
        const file = String.fromCharCode(97 + col);
        const rank = 8 - row;
        return `${file}${rank}`;
    }

    // Get all legal moves for current position
    getLegalMoves() {
        const moves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.getPiece(row, col);
                if (piece && this.getPieceColor(piece) === this.turn) {
                    const pieceMoves = this.getPieceMoves(row, col);
                    moves.push(...pieceMoves);
                }
            }
        }
        return moves;
    }

    // Get legal moves for a specific piece
    getPieceMoves(row, col) {
        const piece = this.getPiece(row, col);
        if (!piece) return [];

        const pieceType = piece.toLowerCase();
        const color = this.getPieceColor(piece);
        let moves = [];

        switch (pieceType) {
            case 'p':
                moves = this.getPawnMoves(row, col, color);
                break;
            case 'r':
                moves = this.getRookMoves(row, col, color);
                break;
            case 'n':
                moves = this.getKnightMoves(row, col, color);
                break;
            case 'b':
                moves = this.getBishopMoves(row, col, color);
                break;
            case 'q':
                moves = this.getQueenMoves(row, col, color);
                break;
            case 'k':
                moves = this.getKingMoves(row, col, color);
                break;
        }

        // Filter out moves that leave king in check
        return moves.filter(move => !this.moveLeavesKingInCheck(move, color));
    }

    // Pawn moves
    getPawnMoves(row, col, color) {
        const moves = [];
        const direction = color === 'w' ? -1 : 1;
        const startRow = color === 'w' ? 6 : 1;
        const promotionRow = color === 'w' ? 0 : 7;

        // Forward move
        const newRow = row + direction;
        if (newRow >= 0 && newRow <= 7 && !this.getPiece(newRow, col)) {
            if (newRow === promotionRow) {
                ['q', 'r', 'b', 'n'].forEach(promo => {
                    moves.push({ from: { row, col }, to: { row: newRow, col }, promotion: promo });
                });
            } else {
                moves.push({ from: { row, col }, to: { row: newRow, col } });
            }

            // Double move from start
            if (row === startRow) {
                const doubleRow = row + 2 * direction;
                if (!this.getPiece(doubleRow, col)) {
                    moves.push({ from: { row, col }, to: { row: doubleRow, col } });
                }
            }
        }

        // Captures
        for (const dc of [-1, 1]) {
            const newCol = col + dc;
            if (newCol >= 0 && newCol <= 7 && newRow >= 0 && newRow <= 7) {
                const target = this.getPiece(newRow, newCol);
                if (target && this.getPieceColor(target) !== color) {
                    if (newRow === promotionRow) {
                        ['q', 'r', 'b', 'n'].forEach(promo => {
                            moves.push({ from: { row, col }, to: { row: newRow, col: newCol }, promotion: promo, capture: true });
                        });
                    } else {
                        moves.push({ from: { row, col }, to: { row: newRow, col: newCol }, capture: true });
                    }
                }

                // En passant
                if (this.enPassant && this.enPassant.row === newRow && this.enPassant.col === newCol) {
                    moves.push({ from: { row, col }, to: { row: newRow, col: newCol }, enPassant: true, capture: true });
                }
            }
        }

        return moves;
    }

    // Sliding piece moves (rook, bishop, queen)
    getSlidingMoves(row, col, color, directions) {
        const moves = [];
        for (const [dr, dc] of directions) {
            let r = row + dr;
            let c = col + dc;
            while (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
                const target = this.getPiece(r, c);
                if (!target) {
                    moves.push({ from: { row, col }, to: { row: r, col: c } });
                } else {
                    if (this.getPieceColor(target) !== color) {
                        moves.push({ from: { row, col }, to: { row: r, col: c }, capture: true });
                    }
                    break;
                }
                r += dr;
                c += dc;
            }
        }
        return moves;
    }

    getRookMoves(row, col, color) {
        return this.getSlidingMoves(row, col, color, [[0, 1], [0, -1], [1, 0], [-1, 0]]);
    }

    getBishopMoves(row, col, color) {
        return this.getSlidingMoves(row, col, color, [[1, 1], [1, -1], [-1, 1], [-1, -1]]);
    }

    getQueenMoves(row, col, color) {
        return [
            ...this.getRookMoves(row, col, color),
            ...this.getBishopMoves(row, col, color)
        ];
    }

    // Knight moves
    getKnightMoves(row, col, color) {
        const moves = [];
        const offsets = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        for (const [dr, dc] of offsets) {
            const r = row + dr;
            const c = col + dc;
            if (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
                const target = this.getPiece(r, c);
                if (!target || this.getPieceColor(target) !== color) {
                    moves.push({ from: { row, col }, to: { row: r, col: c }, capture: !!target });
                }
            }
        }
        return moves;
    }

    // King moves
    getKingMoves(row, col, color) {
        const moves = [];
        const offsets = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        for (const [dr, dc] of offsets) {
            const r = row + dr;
            const c = col + dc;
            if (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
                const target = this.getPiece(r, c);
                if (!target || this.getPieceColor(target) !== color) {
                    moves.push({ from: { row, col }, to: { row: r, col: c }, capture: !!target });
                }
            }
        }

        // Castling
        if (!this.isInCheck(color)) {
            // Kingside
            const kingSide = color === 'w' ? 'K' : 'k';
            const queenSide = color === 'w' ? 'Q' : 'q';
            const castleRow = color === 'w' ? 7 : 0;

            if (this.castling[kingSide] && row === castleRow && col === 4) {
                if (!this.getPiece(castleRow, 5) && !this.getPiece(castleRow, 6)) {
                    if (!this.isSquareAttacked(castleRow, 5, color) && !this.isSquareAttacked(castleRow, 6, color)) {
                        moves.push({ from: { row, col }, to: { row: castleRow, col: 6 }, castling: 'K' });
                    }
                }
            }

            // Queenside
            if (this.castling[queenSide] && row === castleRow && col === 4) {
                if (!this.getPiece(castleRow, 1) && !this.getPiece(castleRow, 2) && !this.getPiece(castleRow, 3)) {
                    if (!this.isSquareAttacked(castleRow, 2, color) && !this.isSquareAttacked(castleRow, 3, color)) {
                        moves.push({ from: { row, col }, to: { row: castleRow, col: 2 }, castling: 'Q' });
                    }
                }
            }
        }

        return moves;
    }

    // Find king position
    findKing(color) {
        const king = color === 'w' ? 'K' : 'k';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] === king) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    // Check if square is attacked by opponent
    isSquareAttacked(row, col, color) {
        const opponentColor = color === 'w' ? 'b' : 'w';

        // Check for pawn attacks
        const pawnDir = color === 'w' ? -1 : 1;
        const pawn = opponentColor === 'w' ? 'P' : 'p';
        for (const dc of [-1, 1]) {
            const pr = row + pawnDir;
            const pc = col + dc;
            if (pr >= 0 && pr <= 7 && pc >= 0 && pc <= 7) {
                if (this.getPiece(pr, pc) === pawn) return true;
            }
        }

        // Check for knight attacks
        const knight = opponentColor === 'w' ? 'N' : 'n';
        const knightOffsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        for (const [dr, dc] of knightOffsets) {
            const nr = row + dr;
            const nc = col + dc;
            if (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
                if (this.getPiece(nr, nc) === knight) return true;
            }
        }

        // Check for king attacks
        const king = opponentColor === 'w' ? 'K' : 'k';
        const kingOffsets = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        for (const [dr, dc] of kingOffsets) {
            const kr = row + dr;
            const kc = col + dc;
            if (kr >= 0 && kr <= 7 && kc >= 0 && kc <= 7) {
                if (this.getPiece(kr, kc) === king) return true;
            }
        }

        // Check for sliding piece attacks (rook, queen on ranks/files)
        const rook = opponentColor === 'w' ? 'R' : 'r';
        const queen = opponentColor === 'w' ? 'Q' : 'q';
        const rookDirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        for (const [dr, dc] of rookDirs) {
            let r = row + dr;
            let c = col + dc;
            while (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
                const piece = this.getPiece(r, c);
                if (piece) {
                    if (piece === rook || piece === queen) return true;
                    break;
                }
                r += dr;
                c += dc;
            }
        }

        // Check for sliding piece attacks (bishop, queen on diagonals)
        const bishop = opponentColor === 'w' ? 'B' : 'b';
        const bishopDirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (const [dr, dc] of bishopDirs) {
            let r = row + dr;
            let c = col + dc;
            while (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
                const piece = this.getPiece(r, c);
                if (piece) {
                    if (piece === bishop || piece === queen) return true;
                    break;
                }
                r += dr;
                c += dc;
            }
        }

        return false;
    }

    // Check if color's king is in check
    isInCheck(color) {
        const kingPos = this.findKing(color);
        if (!kingPos) return false;
        return this.isSquareAttacked(kingPos.row, kingPos.col, color);
    }

    // Check if a move leaves the king in check
    moveLeavesKingInCheck(move, color) {
        // Make move temporarily
        const piece = this.getPiece(move.from.row, move.from.col);
        const captured = this.getPiece(move.to.row, move.to.col);
        let enPassantCapture = null;

        this.setPiece(move.to.row, move.to.col, piece);
        this.setPiece(move.from.row, move.from.col, null);

        // Handle en passant capture
        if (move.enPassant) {
            const captureRow = color === 'w' ? move.to.row + 1 : move.to.row - 1;
            enPassantCapture = this.getPiece(captureRow, move.to.col);
            this.setPiece(captureRow, move.to.col, null);
        }

        // Handle castling - move rook
        if (move.castling) {
            const row = move.to.row;
            if (move.castling === 'K') {
                this.setPiece(row, 5, this.getPiece(row, 7));
                this.setPiece(row, 7, null);
            } else {
                this.setPiece(row, 3, this.getPiece(row, 0));
                this.setPiece(row, 0, null);
            }
        }

        const inCheck = this.isInCheck(color);

        // Undo move
        this.setPiece(move.from.row, move.from.col, piece);
        this.setPiece(move.to.row, move.to.col, captured);

        if (move.enPassant) {
            const captureRow = color === 'w' ? move.to.row + 1 : move.to.row - 1;
            this.setPiece(captureRow, move.to.col, enPassantCapture);
        }

        if (move.castling) {
            const row = move.to.row;
            if (move.castling === 'K') {
                this.setPiece(row, 7, this.getPiece(row, 5));
                this.setPiece(row, 5, null);
            } else {
                this.setPiece(row, 0, this.getPiece(row, 3));
                this.setPiece(row, 3, null);
            }
        }

        return inCheck;
    }

    // Make a move
    makeMove(move) {
        if (this.gameOver) return false;

        const piece = this.getPiece(move.from.row, move.from.col);
        if (!piece) return false;

        const color = this.getPieceColor(piece);
        if (color !== this.turn) return false;

        // Validate move
        const legalMoves = this.getPieceMoves(move.from.row, move.from.col);
        const isLegal = legalMoves.some(m =>
            m.to.row === move.to.row &&
            m.to.col === move.to.col &&
            (!m.promotion || m.promotion === move.promotion)
        );

        if (!isLegal) return false;

        // Store move for history
        const historyEntry = {
            from: { ...move.from },
            to: { ...move.to },
            piece: piece,
            captured: this.getPiece(move.to.row, move.to.col),
            castling: move.castling,
            enPassant: move.enPassant,
            promotion: move.promotion,
            prevCastling: { ...this.castling },
            prevEnPassant: this.enPassant,
            prevHalfMoveClock: this.halfMoveClock
        };

        // Handle en passant capture
        if (move.enPassant) {
            const captureRow = color === 'w' ? move.to.row + 1 : move.to.row - 1;
            historyEntry.enPassantCapture = this.getPiece(captureRow, move.to.col);
            this.setPiece(captureRow, move.to.col, null);
        }

        // Move piece
        let finalPiece = piece;
        if (move.promotion) {
            finalPiece = color === 'w' ? move.promotion.toUpperCase() : move.promotion.toLowerCase();
        }
        this.setPiece(move.to.row, move.to.col, finalPiece);
        this.setPiece(move.from.row, move.from.col, null);

        // Handle castling
        if (move.castling) {
            const row = move.to.row;
            if (move.castling === 'K') {
                this.setPiece(row, 5, this.getPiece(row, 7));
                this.setPiece(row, 7, null);
            } else {
                this.setPiece(row, 3, this.getPiece(row, 0));
                this.setPiece(row, 0, null);
            }
        }

        // Update castling rights
        if (piece.toLowerCase() === 'k') {
            if (color === 'w') {
                this.castling.K = false;
                this.castling.Q = false;
            } else {
                this.castling.k = false;
                this.castling.q = false;
            }
        }
        if (piece.toLowerCase() === 'r') {
            if (move.from.row === 7 && move.from.col === 0) this.castling.Q = false;
            if (move.from.row === 7 && move.from.col === 7) this.castling.K = false;
            if (move.from.row === 0 && move.from.col === 0) this.castling.q = false;
            if (move.from.row === 0 && move.from.col === 7) this.castling.k = false;
        }
        // Update castling if rook captured
        if (move.to.row === 0 && move.to.col === 0) this.castling.q = false;
        if (move.to.row === 0 && move.to.col === 7) this.castling.k = false;
        if (move.to.row === 7 && move.to.col === 0) this.castling.Q = false;
        if (move.to.row === 7 && move.to.col === 7) this.castling.K = false;

        // Update en passant square
        if (piece.toLowerCase() === 'p' && Math.abs(move.to.row - move.from.row) === 2) {
            const epRow = (move.from.row + move.to.row) / 2;
            this.enPassant = { row: epRow, col: move.to.col };
        } else {
            this.enPassant = null;
        }

        // Update clocks
        if (piece.toLowerCase() === 'p' || historyEntry.captured) {
            this.halfMoveClock = 0;
        } else {
            this.halfMoveClock++;
        }

        if (color === 'b') {
            this.fullMoveNumber++;
        }

        // Generate algebraic notation
        historyEntry.san = this.generateSAN(historyEntry);

        // Switch turn
        this.turn = color === 'w' ? 'b' : 'w';

        // Check for game end
        historyEntry.isCheck = this.isInCheck(this.turn);
        this.checkGameEnd();
        historyEntry.isCheckmate = this.gameOver && this.result && this.result.includes('checkmate');

        // Add to history
        this.history.push(historyEntry);
        this.redoStack = [];
        this.positionHistory.push(this.getFEN());

        return historyEntry;
    }

    // Generate Standard Algebraic Notation
    generateSAN(entry) {
        const piece = entry.piece.toUpperCase();
        const fromCoord = this.coordsToAlgebraic(entry.from.row, entry.from.col);
        const toCoord = this.coordsToAlgebraic(entry.to.row, entry.to.col);

        let san = '';

        if (entry.castling === 'K') {
            san = 'O-O';
        } else if (entry.castling === 'Q') {
            san = 'O-O-O';
        } else if (piece === 'P') {
            if (entry.captured || entry.enPassant) {
                san = fromCoord[0] + 'x' + toCoord;
            } else {
                san = toCoord;
            }
            if (entry.promotion) {
                san += '=' + entry.promotion.toUpperCase();
            }
        } else {
            san = piece;
            // Add disambiguation if needed (simplified)
            if (entry.captured) {
                san += 'x';
            }
            san += toCoord;
        }

        return san;
    }

    // Undo last move
    undoMove() {
        if (this.history.length === 0) return false;

        const entry = this.history.pop();
        this.redoStack.push(entry);
        this.positionHistory.pop();

        // Restore piece
        this.setPiece(entry.from.row, entry.from.col, entry.piece);

        // Handle promotion - restore pawn
        if (entry.promotion) {
            this.setPiece(entry.to.row, entry.to.col, entry.captured);
        } else {
            this.setPiece(entry.to.row, entry.to.col, entry.captured);
        }

        // Handle en passant
        if (entry.enPassant) {
            const color = this.getPieceColor(entry.piece);
            const captureRow = color === 'w' ? entry.to.row + 1 : entry.to.row - 1;
            this.setPiece(captureRow, entry.to.col, entry.enPassantCapture);
        }

        // Handle castling
        if (entry.castling) {
            const row = entry.to.row;
            if (entry.castling === 'K') {
                this.setPiece(row, 7, this.getPiece(row, 5));
                this.setPiece(row, 5, null);
            } else {
                this.setPiece(row, 0, this.getPiece(row, 3));
                this.setPiece(row, 3, null);
            }
        }

        // Restore state
        this.castling = entry.prevCastling;
        this.enPassant = entry.prevEnPassant;
        this.halfMoveClock = entry.prevHalfMoveClock;

        // Switch turn back
        this.turn = this.getPieceColor(entry.piece);
        if (this.turn === 'b') {
            this.fullMoveNumber--;
        }

        this.gameOver = false;
        this.result = null;

        return entry;
    }

    // Redo move
    redoMove() {
        if (this.redoStack.length === 0) return false;

        const entry = this.redoStack.pop();
        const move = {
            from: entry.from,
            to: entry.to,
            promotion: entry.promotion
        };

        return this.makeMove(move);
    }

    // Check for game end conditions
    checkGameEnd() {
        const legalMoves = this.getLegalMoves();

        if (legalMoves.length === 0) {
            this.gameOver = true;
            if (this.isInCheck(this.turn)) {
                const winner = this.turn === 'w' ? 'Black' : 'White';
                this.result = `${winner} wins by checkmate`;
            } else {
                this.result = 'Draw by stalemate';
            }
            return;
        }

        // 50-move rule
        if (this.halfMoveClock >= 100) {
            this.gameOver = true;
            this.result = 'Draw by 50-move rule';
            return;
        }

        // Threefold repetition
        if (this.positionHistory.length > 0) {
            const currentFEN = this.getFEN().split(' ').slice(0, 4).join(' ');
            let count = 0;
            for (const fen of this.positionHistory) {
                if (fen.split(' ').slice(0, 4).join(' ') === currentFEN) {
                    count++;
                }
            }
            if (count >= 3) {
                this.gameOver = true;
                this.result = 'Draw by threefold repetition';
                return;
            }
        }

        // Insufficient material
        if (this.isInsufficientMaterial()) {
            this.gameOver = true;
            this.result = 'Draw by insufficient material';
        }
    }

    // Check for insufficient material
    isInsufficientMaterial() {
        const pieces = { w: [], b: [] };

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.getPiece(row, col);
                if (piece) {
                    const color = this.getPieceColor(piece);
                    const type = piece.toLowerCase();
                    if (type !== 'k') {
                        pieces[color].push({ type, row, col });
                    }
                }
            }
        }

        const wp = pieces.w;
        const bp = pieces.b;

        // K vs K
        if (wp.length === 0 && bp.length === 0) return true;

        // K vs K+B or K vs K+N
        if (wp.length === 0 && bp.length === 1 && (bp[0].type === 'b' || bp[0].type === 'n')) return true;
        if (bp.length === 0 && wp.length === 1 && (wp[0].type === 'b' || wp[0].type === 'n')) return true;

        // K+B vs K+B (same color bishops)
        if (wp.length === 1 && bp.length === 1 && wp[0].type === 'b' && bp[0].type === 'b') {
            const wSquareColor = (wp[0].row + wp[0].col) % 2;
            const bSquareColor = (bp[0].row + bp[0].col) % 2;
            if (wSquareColor === bSquareColor) return true;
        }

        return false;
    }

    // Get FEN string
    getFEN() {
        let fen = '';

        // Board
        for (let row = 0; row < 8; row++) {
            let empty = 0;
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    if (empty > 0) {
                        fen += empty;
                        empty = 0;
                    }
                    fen += piece;
                } else {
                    empty++;
                }
            }
            if (empty > 0) fen += empty;
            if (row < 7) fen += '/';
        }

        // Turn
        fen += ' ' + this.turn;

        // Castling
        let castling = '';
        if (this.castling.K) castling += 'K';
        if (this.castling.Q) castling += 'Q';
        if (this.castling.k) castling += 'k';
        if (this.castling.q) castling += 'q';
        fen += ' ' + (castling || '-');

        // En passant
        if (this.enPassant) {
            fen += ' ' + this.coordsToAlgebraic(this.enPassant.row, this.enPassant.col);
        } else {
            fen += ' -';
        }

        // Clocks
        fen += ' ' + this.halfMoveClock;
        fen += ' ' + this.fullMoveNumber;

        return fen;
    }

    // Load position from FEN
    loadFEN(fen) {
        const parts = fen.split(' ');
        const boardPart = parts[0];

        // Clear board
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));

        // Parse board
        let row = 0;
        let col = 0;
        for (const char of boardPart) {
            if (char === '/') {
                row++;
                col = 0;
            } else if (char >= '1' && char <= '8') {
                col += parseInt(char);
            } else {
                this.board[row][col] = char;
                col++;
            }
        }

        // Turn
        this.turn = parts[1] || 'w';

        // Castling
        const castling = parts[2] || '-';
        this.castling = {
            K: castling.includes('K'),
            Q: castling.includes('Q'),
            k: castling.includes('k'),
            q: castling.includes('q')
        };

        // En passant
        if (parts[3] && parts[3] !== '-') {
            this.enPassant = this.algebraicToCoords(parts[3]);
        } else {
            this.enPassant = null;
        }

        // Clocks
        this.halfMoveClock = parseInt(parts[4]) || 0;
        this.fullMoveNumber = parseInt(parts[5]) || 1;

        // Reset history
        this.history = [];
        this.redoStack = [];
        this.positionHistory = [fen];
        this.gameOver = false;
        this.result = null;
    }

    // Get PGN string
    getPGN(headers = {}) {
        let pgn = '';

        // Headers
        const defaultHeaders = {
            Event: 'Dostoevsky Chess Game',
            Site: 'Browser',
            Date: new Date().toISOString().split('T')[0],
            Round: '?',
            White: 'Player 1',
            Black: 'Player 2',
            Result: this.gameOver ? (this.result.includes('White') ? '1-0' : this.result.includes('Black') ? '0-1' : '1/2-1/2') : '*'
        };

        const allHeaders = { ...defaultHeaders, ...headers };
        for (const [key, value] of Object.entries(allHeaders)) {
            pgn += `[${key} "${value}"]\n`;
        }
        pgn += '\n';

        // Moves
        let moveText = '';
        for (let i = 0; i < this.history.length; i++) {
            const entry = this.history[i];
            if (i % 2 === 0) {
                moveText += `${Math.floor(i / 2) + 1}. `;
            }
            let san = entry.san;
            if (entry.isCheckmate) {
                san += '#';
            } else if (entry.isCheck) {
                san += '+';
            }
            moveText += san + ' ';
        }

        // Result
        if (this.gameOver) {
            if (this.result.includes('White')) {
                moveText += '1-0';
            } else if (this.result.includes('Black')) {
                moveText += '0-1';
            } else {
                moveText += '1/2-1/2';
            }
        }

        pgn += moveText.trim();
        return pgn;
    }

    // Clone the game state
    clone() {
        const cloned = new Chess();
        cloned.board = this.board.map(row => [...row]);
        cloned.turn = this.turn;
        cloned.castling = { ...this.castling };
        cloned.enPassant = this.enPassant ? { ...this.enPassant } : null;
        cloned.halfMoveClock = this.halfMoveClock;
        cloned.fullMoveNumber = this.fullMoveNumber;
        cloned.history = [...this.history];
        cloned.redoStack = [...this.redoStack];
        cloned.positionHistory = [...this.positionHistory];
        cloned.gameOver = this.gameOver;
        cloned.result = this.result;
        return cloned;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Chess;
}
