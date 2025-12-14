/**
 * Chess Game Logic - The Brothers Gambit
 * Complete chess engine with full rule enforcement
 */

class Chess {
    constructor() {
        this.reset();
    }

    reset() {
        // Board representation: 8x8 array, null for empty squares
        // Pieces: { type: 'k'|'q'|'r'|'b'|'n'|'p', color: 'w'|'b' }
        this.board = this.createInitialBoard();
        this.turn = 'w';
        this.castlingRights = { w: { k: true, q: true }, b: { k: true, q: true } };
        this.enPassantSquare = null;
        this.halfMoveClock = 0;
        this.fullMoveNumber = 1;
        this.moveHistory = [];
        this.positionHistory = [];
        this.gameOver = false;
        this.gameResult = null;
        
        // Store initial position for repetition detection
        this.positionHistory.push(this.getFEN());
    }

    createInitialBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Set up black pieces (rank 8 = index 0)
        board[0] = [
            { type: 'r', color: 'b' }, { type: 'n', color: 'b' }, { type: 'b', color: 'b' },
            { type: 'q', color: 'b' }, { type: 'k', color: 'b' }, { type: 'b', color: 'b' },
            { type: 'n', color: 'b' }, { type: 'r', color: 'b' }
        ];
        board[1] = Array(8).fill(null).map(() => ({ type: 'p', color: 'b' }));
        
        // Set up white pieces (rank 1 = index 7)
        board[6] = Array(8).fill(null).map(() => ({ type: 'p', color: 'w' }));
        board[7] = [
            { type: 'r', color: 'w' }, { type: 'n', color: 'w' }, { type: 'b', color: 'w' },
            { type: 'q', color: 'w' }, { type: 'k', color: 'w' }, { type: 'b', color: 'w' },
            { type: 'n', color: 'w' }, { type: 'r', color: 'w' }
        ];
        
        return board;
    }

    // Convert algebraic notation to board indices
    algebraicToIndex(square) {
        const file = square.charCodeAt(0) - 97; // 'a' = 0
        const rank = 8 - parseInt(square[1]);   // '8' = 0, '1' = 7
        return { row: rank, col: file };
    }

    // Convert board indices to algebraic notation
    indexToAlgebraic(row, col) {
        return String.fromCharCode(97 + col) + (8 - row);
    }

    // Get piece at square
    getPiece(square) {
        if (typeof square === 'string') {
            const { row, col } = this.algebraicToIndex(square);
            return this.board[row][col];
        }
        return this.board[square.row][square.col];
    }

    // Set piece at square
    setPiece(square, piece) {
        if (typeof square === 'string') {
            const { row, col } = this.algebraicToIndex(square);
            this.board[row][col] = piece;
        } else {
            this.board[square.row][square.col] = piece;
        }
    }

    // Get all legal moves for current player
    getAllLegalMoves() {
        const moves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === this.turn) {
                    const from = this.indexToAlgebraic(row, col);
                    const pieceMoves = this.getLegalMoves(from);
                    pieceMoves.forEach(to => {
                        moves.push({ from, to });
                    });
                }
            }
        }
        return moves;
    }

    // Get legal moves for a piece at a square
    getLegalMoves(square) {
        const piece = this.getPiece(square);
        if (!piece || piece.color !== this.turn) return [];

        const { row, col } = this.algebraicToIndex(square);
        let moves = [];

        switch (piece.type) {
            case 'p':
                moves = this.getPawnMoves(row, col, piece.color);
                break;
            case 'n':
                moves = this.getKnightMoves(row, col, piece.color);
                break;
            case 'b':
                moves = this.getBishopMoves(row, col, piece.color);
                break;
            case 'r':
                moves = this.getRookMoves(row, col, piece.color);
                break;
            case 'q':
                moves = this.getQueenMoves(row, col, piece.color);
                break;
            case 'k':
                moves = this.getKingMoves(row, col, piece.color);
                break;
        }

        // Filter out moves that would leave king in check
        return moves.filter(to => {
            const toIndex = this.algebraicToIndex(to);
            return !this.wouldBeInCheck(row, col, toIndex.row, toIndex.col, piece.color);
        });
    }

    // Pawn moves
    getPawnMoves(row, col, color) {
        const moves = [];
        const direction = color === 'w' ? -1 : 1;
        const startRow = color === 'w' ? 6 : 1;

        // Forward move
        const oneAhead = row + direction;
        if (oneAhead >= 0 && oneAhead < 8 && !this.board[oneAhead][col]) {
            moves.push(this.indexToAlgebraic(oneAhead, col));
            
            // Double move from start
            const twoAhead = row + 2 * direction;
            if (row === startRow && !this.board[twoAhead][col]) {
                moves.push(this.indexToAlgebraic(twoAhead, col));
            }
        }

        // Captures
        for (const dc of [-1, 1]) {
            const newCol = col + dc;
            if (newCol >= 0 && newCol < 8 && oneAhead >= 0 && oneAhead < 8) {
                const target = this.board[oneAhead][newCol];
                if (target && target.color !== color) {
                    moves.push(this.indexToAlgebraic(oneAhead, newCol));
                }
                
                // En passant
                const epSquare = this.indexToAlgebraic(oneAhead, newCol);
                if (this.enPassantSquare === epSquare) {
                    moves.push(epSquare);
                }
            }
        }

        return moves;
    }

    // Knight moves
    getKnightMoves(row, col, color) {
        const moves = [];
        const deltas = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        for (const [dr, dc] of deltas) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const target = this.board[newRow][newCol];
                if (!target || target.color !== color) {
                    moves.push(this.indexToAlgebraic(newRow, newCol));
                }
            }
        }

        return moves;
    }

    // Sliding piece moves (bishop, rook, queen)
    getSlidingMoves(row, col, color, directions) {
        const moves = [];

        for (const [dr, dc] of directions) {
            let newRow = row + dr;
            let newCol = col + dc;

            while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const target = this.board[newRow][newCol];
                if (!target) {
                    moves.push(this.indexToAlgebraic(newRow, newCol));
                } else {
                    if (target.color !== color) {
                        moves.push(this.indexToAlgebraic(newRow, newCol));
                    }
                    break;
                }
                newRow += dr;
                newCol += dc;
            }
        }

        return moves;
    }

    getBishopMoves(row, col, color) {
        return this.getSlidingMoves(row, col, color, [[-1, -1], [-1, 1], [1, -1], [1, 1]]);
    }

    getRookMoves(row, col, color) {
        return this.getSlidingMoves(row, col, color, [[-1, 0], [1, 0], [0, -1], [0, 1]]);
    }

    getQueenMoves(row, col, color) {
        return [
            ...this.getBishopMoves(row, col, color),
            ...this.getRookMoves(row, col, color)
        ];
    }

    // King moves including castling
    getKingMoves(row, col, color) {
        const moves = [];
        const deltas = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (const [dr, dc] of deltas) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const target = this.board[newRow][newCol];
                if (!target || target.color !== color) {
                    moves.push(this.indexToAlgebraic(newRow, newCol));
                }
            }
        }

        // Castling
        if (!this.isInCheck(color)) {
            const homeRow = color === 'w' ? 7 : 0;
            
            // Kingside castling
            if (this.castlingRights[color].k) {
                if (!this.board[homeRow][5] && !this.board[homeRow][6]) {
                    if (!this.isSquareAttacked(homeRow, 5, color) && 
                        !this.isSquareAttacked(homeRow, 6, color)) {
                        moves.push(this.indexToAlgebraic(homeRow, 6));
                    }
                }
            }
            
            // Queenside castling
            if (this.castlingRights[color].q) {
                if (!this.board[homeRow][1] && !this.board[homeRow][2] && !this.board[homeRow][3]) {
                    if (!this.isSquareAttacked(homeRow, 2, color) && 
                        !this.isSquareAttacked(homeRow, 3, color)) {
                        moves.push(this.indexToAlgebraic(homeRow, 2));
                    }
                }
            }
        }

        return moves;
    }

    // Check if a square is attacked by enemy pieces
    isSquareAttacked(row, col, defendingColor) {
        const attackingColor = defendingColor === 'w' ? 'b' : 'w';

        // Check pawn attacks
        const pawnDir = defendingColor === 'w' ? -1 : 1;
        for (const dc of [-1, 1]) {
            const pRow = row + pawnDir;
            const pCol = col + dc;
            if (pRow >= 0 && pRow < 8 && pCol >= 0 && pCol < 8) {
                const piece = this.board[pRow][pCol];
                if (piece && piece.type === 'p' && piece.color === attackingColor) {
                    return true;
                }
            }
        }

        // Check knight attacks
        const knightDeltas = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        for (const [dr, dc] of knightDeltas) {
            const nRow = row + dr;
            const nCol = col + dc;
            if (nRow >= 0 && nRow < 8 && nCol >= 0 && nCol < 8) {
                const piece = this.board[nRow][nCol];
                if (piece && piece.type === 'n' && piece.color === attackingColor) {
                    return true;
                }
            }
        }

        // Check king attacks
        const kingDeltas = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        for (const [dr, dc] of kingDeltas) {
            const kRow = row + dr;
            const kCol = col + dc;
            if (kRow >= 0 && kRow < 8 && kCol >= 0 && kCol < 8) {
                const piece = this.board[kRow][kCol];
                if (piece && piece.type === 'k' && piece.color === attackingColor) {
                    return true;
                }
            }
        }

        // Check diagonal attacks (bishop, queen)
        const diagonals = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        for (const [dr, dc] of diagonals) {
            let r = row + dr;
            let c = col + dc;
            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                const piece = this.board[r][c];
                if (piece) {
                    if (piece.color === attackingColor && (piece.type === 'b' || piece.type === 'q')) {
                        return true;
                    }
                    break;
                }
                r += dr;
                c += dc;
            }
        }

        // Check straight line attacks (rook, queen)
        const straights = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of straights) {
            let r = row + dr;
            let c = col + dc;
            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                const piece = this.board[r][c];
                if (piece) {
                    if (piece.color === attackingColor && (piece.type === 'r' || piece.type === 'q')) {
                        return true;
                    }
                    break;
                }
                r += dr;
                c += dc;
            }
        }

        return false;
    }

    // Find king position
    findKing(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'k' && piece.color === color) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    // Check if current player is in check
    isInCheck(color = this.turn) {
        const king = this.findKing(color);
        if (!king) return false;
        return this.isSquareAttacked(king.row, king.col, color);
    }

    // Check if a move would leave the king in check
    wouldBeInCheck(fromRow, fromCol, toRow, toCol, color) {
        // Save state
        const targetPiece = this.board[toRow][toCol];
        const movingPiece = this.board[fromRow][fromCol];
        const savedEnPassant = this.enPassantSquare;
        let capturedPawn = null;
        
        // Handle en passant
        if (movingPiece.type === 'p' && this.enPassantSquare === this.indexToAlgebraic(toRow, toCol)) {
            const captureRow = color === 'w' ? toRow + 1 : toRow - 1;
            capturedPawn = this.board[captureRow][toCol];
            this.board[captureRow][toCol] = null;
        }

        // Make move
        this.board[toRow][toCol] = movingPiece;
        this.board[fromRow][fromCol] = null;

        // Check if in check
        const inCheck = this.isInCheck(color);

        // Restore state
        this.board[fromRow][fromCol] = movingPiece;
        this.board[toRow][toCol] = targetPiece;
        this.enPassantSquare = savedEnPassant;
        
        if (capturedPawn) {
            const captureRow = color === 'w' ? toRow + 1 : toRow - 1;
            this.board[captureRow][toCol] = capturedPawn;
        }

        return inCheck;
    }

    // Make a move
    move(from, to, promotion = 'q') {
        if (this.gameOver) return null;

        const piece = this.getPiece(from);
        if (!piece || piece.color !== this.turn) return null;

        const legalMoves = this.getLegalMoves(from);
        if (!legalMoves.includes(to)) return null;

        const fromIdx = this.algebraicToIndex(from);
        const toIdx = this.algebraicToIndex(to);
        const targetPiece = this.getPiece(to);

        // Build move object
        const moveData = {
            from,
            to,
            piece: piece.type,
            color: piece.color,
            captured: targetPiece ? targetPiece.type : null,
            promotion: null,
            castling: null,
            enPassant: false,
            check: false,
            checkmate: false,
            san: ''
        };

        // Handle en passant capture
        if (piece.type === 'p' && to === this.enPassantSquare) {
            const captureRow = piece.color === 'w' ? toIdx.row + 1 : toIdx.row - 1;
            moveData.captured = 'p';
            moveData.enPassant = true;
            this.board[captureRow][toIdx.col] = null;
        }

        // Handle castling
        if (piece.type === 'k' && Math.abs(toIdx.col - fromIdx.col) === 2) {
            const isKingside = toIdx.col > fromIdx.col;
            const rookFromCol = isKingside ? 7 : 0;
            const rookToCol = isKingside ? 5 : 3;
            const homeRow = piece.color === 'w' ? 7 : 0;
            
            this.board[homeRow][rookToCol] = this.board[homeRow][rookFromCol];
            this.board[homeRow][rookFromCol] = null;
            
            moveData.castling = isKingside ? 'k' : 'q';
        }

        // Update en passant square
        if (piece.type === 'p' && Math.abs(toIdx.row - fromIdx.row) === 2) {
            const epRow = (fromIdx.row + toIdx.row) / 2;
            this.enPassantSquare = this.indexToAlgebraic(epRow, fromIdx.col);
        } else {
            this.enPassantSquare = null;
        }

        // Make the move
        this.board[toIdx.row][toIdx.col] = piece;
        this.board[fromIdx.row][fromIdx.col] = null;

        // Handle promotion
        if (piece.type === 'p' && (toIdx.row === 0 || toIdx.row === 7)) {
            this.board[toIdx.row][toIdx.col] = { type: promotion, color: piece.color };
            moveData.promotion = promotion;
        }

        // Update castling rights
        if (piece.type === 'k') {
            this.castlingRights[piece.color].k = false;
            this.castlingRights[piece.color].q = false;
        }
        if (piece.type === 'r') {
            if (fromIdx.col === 0) this.castlingRights[piece.color].q = false;
            if (fromIdx.col === 7) this.castlingRights[piece.color].k = false;
        }
        // Rook captured
        if (targetPiece && targetPiece.type === 'r') {
            const capturedColor = targetPiece.color;
            if (toIdx.col === 0) this.castlingRights[capturedColor].q = false;
            if (toIdx.col === 7) this.castlingRights[capturedColor].k = false;
        }

        // Update clocks
        if (piece.type === 'p' || targetPiece) {
            this.halfMoveClock = 0;
        } else {
            this.halfMoveClock++;
        }

        if (piece.color === 'b') {
            this.fullMoveNumber++;
        }

        // Switch turn
        this.turn = this.turn === 'w' ? 'b' : 'w';

        // Check for check/checkmate
        moveData.check = this.isInCheck();
        if (moveData.check && this.getAllLegalMoves().length === 0) {
            moveData.checkmate = true;
            this.gameOver = true;
            this.gameResult = {
                winner: piece.color,
                reason: 'checkmate'
            };
        }

        // Check for stalemate
        if (!moveData.check && this.getAllLegalMoves().length === 0) {
            this.gameOver = true;
            this.gameResult = {
                winner: null,
                reason: 'stalemate'
            };
        }

        // Check for insufficient material
        if (this.isInsufficientMaterial()) {
            this.gameOver = true;
            this.gameResult = {
                winner: null,
                reason: 'insufficient material'
            };
        }

        // Check for 50-move rule
        if (this.halfMoveClock >= 100) {
            this.gameOver = true;
            this.gameResult = {
                winner: null,
                reason: 'fifty-move rule'
            };
        }

        // Generate SAN notation
        moveData.san = this.generateSAN(moveData);

        // Store position for repetition detection
        const fen = this.getFEN();
        this.positionHistory.push(fen);

        // Check for threefold repetition
        const fenPosition = fen.split(' ').slice(0, 4).join(' ');
        const repetitions = this.positionHistory.filter(f => 
            f.split(' ').slice(0, 4).join(' ') === fenPosition
        ).length;
        if (repetitions >= 3) {
            this.gameOver = true;
            this.gameResult = {
                winner: null,
                reason: 'threefold repetition'
            };
        }

        // Add to history
        this.moveHistory.push(moveData);

        return moveData;
    }

    // Generate Standard Algebraic Notation
    generateSAN(moveData) {
        let san = '';

        if (moveData.castling === 'k') {
            san = 'O-O';
        } else if (moveData.castling === 'q') {
            san = 'O-O-O';
        } else {
            // Piece letter (not for pawns)
            if (moveData.piece !== 'p') {
                san += moveData.piece.toUpperCase();
            }

            // Disambiguation (simplified - full implementation would check ambiguity)
            if (moveData.piece !== 'p' && moveData.piece !== 'k') {
                // Add file for disambiguation if needed
            }

            // Capture
            if (moveData.captured) {
                if (moveData.piece === 'p') {
                    san += moveData.from[0]; // Add file for pawn captures
                }
                san += 'x';
            }

            // Destination
            san += moveData.to;

            // Promotion
            if (moveData.promotion) {
                san += '=' + moveData.promotion.toUpperCase();
            }
        }

        // Check/checkmate
        if (moveData.checkmate) {
            san += '#';
        } else if (moveData.check) {
            san += '+';
        }

        return san;
    }

    // Check for insufficient material
    isInsufficientMaterial() {
        const pieces = { w: [], b: [] };
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type !== 'k') {
                    pieces[piece.color].push({ type: piece.type, row, col });
                }
            }
        }

        const whitePieces = pieces.w;
        const blackPieces = pieces.b;

        // King vs King
        if (whitePieces.length === 0 && blackPieces.length === 0) return true;

        // King + minor vs King
        if (whitePieces.length === 0 && blackPieces.length === 1) {
            if (blackPieces[0].type === 'n' || blackPieces[0].type === 'b') return true;
        }
        if (blackPieces.length === 0 && whitePieces.length === 1) {
            if (whitePieces[0].type === 'n' || whitePieces[0].type === 'b') return true;
        }

        // King + Bishop vs King + Bishop (same color bishops)
        if (whitePieces.length === 1 && blackPieces.length === 1) {
            if (whitePieces[0].type === 'b' && blackPieces[0].type === 'b') {
                const wSquareColor = (whitePieces[0].row + whitePieces[0].col) % 2;
                const bSquareColor = (blackPieces[0].row + blackPieces[0].col) % 2;
                if (wSquareColor === bSquareColor) return true;
            }
        }

        return false;
    }

    // Resign
    resign(color) {
        this.gameOver = true;
        this.gameResult = {
            winner: color === 'w' ? 'b' : 'w',
            reason: 'resignation'
        };
    }

    // Draw by agreement
    draw() {
        this.gameOver = true;
        this.gameResult = {
            winner: null,
            reason: 'agreement'
        };
    }

    // Undo last move
    undo() {
        if (this.moveHistory.length === 0) return null;

        // This is a simplified undo - for full undo, you'd need to store complete game state
        // For now, we'll rebuild from move history
        const moves = [...this.moveHistory];
        moves.pop();
        
        this.reset();
        
        for (const move of moves) {
            this.move(move.from, move.to, move.promotion || 'q');
        }
        
        return true;
    }

    // Get FEN string
    getFEN() {
        let fen = '';

        // Piece placement
        for (let row = 0; row < 8; row++) {
            let empty = 0;
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    if (empty > 0) {
                        fen += empty;
                        empty = 0;
                    }
                    let letter = piece.type;
                    if (piece.color === 'w') letter = letter.toUpperCase();
                    fen += letter;
                } else {
                    empty++;
                }
            }
            if (empty > 0) fen += empty;
            if (row < 7) fen += '/';
        }

        // Active color
        fen += ' ' + this.turn;

        // Castling
        let castling = '';
        if (this.castlingRights.w.k) castling += 'K';
        if (this.castlingRights.w.q) castling += 'Q';
        if (this.castlingRights.b.k) castling += 'k';
        if (this.castlingRights.b.q) castling += 'q';
        fen += ' ' + (castling || '-');

        // En passant
        fen += ' ' + (this.enPassantSquare || '-');

        // Half-move clock
        fen += ' ' + this.halfMoveClock;

        // Full-move number
        fen += ' ' + this.fullMoveNumber;

        return fen;
    }

    // Load from FEN string
    loadFEN(fen) {
        const parts = fen.split(' ');
        
        // Clear board
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Parse piece placement
        const rows = parts[0].split('/');
        for (let row = 0; row < 8; row++) {
            let col = 0;
            for (const char of rows[row]) {
                if (char >= '1' && char <= '8') {
                    col += parseInt(char);
                } else {
                    const color = char === char.toUpperCase() ? 'w' : 'b';
                    const type = char.toLowerCase();
                    this.board[row][col] = { type, color };
                    col++;
                }
            }
        }

        // Active color
        this.turn = parts[1] || 'w';

        // Castling rights
        this.castlingRights = { w: { k: false, q: false }, b: { k: false, q: false } };
        if (parts[2] && parts[2] !== '-') {
            if (parts[2].includes('K')) this.castlingRights.w.k = true;
            if (parts[2].includes('Q')) this.castlingRights.w.q = true;
            if (parts[2].includes('k')) this.castlingRights.b.k = true;
            if (parts[2].includes('q')) this.castlingRights.b.q = true;
        }

        // En passant
        this.enPassantSquare = parts[3] === '-' ? null : parts[3];

        // Clocks
        this.halfMoveClock = parseInt(parts[4]) || 0;
        this.fullMoveNumber = parseInt(parts[5]) || 1;

        // Reset history
        this.moveHistory = [];
        this.positionHistory = [fen];
        this.gameOver = false;
        this.gameResult = null;
    }

    // Export to PGN
    toPGN(headers = {}) {
        const date = new Date();
        const defaultHeaders = {
            Event: 'The Brothers Gambit',
            Site: 'Online',
            Date: `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`,
            Round: '1',
            White: 'Player 1',
            Black: 'Player 2',
            Result: this.gameOver ? 
                (this.gameResult.winner === 'w' ? '1-0' : 
                 this.gameResult.winner === 'b' ? '0-1' : '1/2-1/2') : '*'
        };

        const allHeaders = { ...defaultHeaders, ...headers };
        let pgn = '';

        // Headers
        for (const [key, value] of Object.entries(allHeaders)) {
            pgn += `[${key} "${value}"]\n`;
        }
        pgn += '\n';

        // Moves
        let moveText = '';
        for (let i = 0; i < this.moveHistory.length; i++) {
            const move = this.moveHistory[i];
            if (i % 2 === 0) {
                moveText += `${Math.floor(i / 2) + 1}. `;
            }
            moveText += move.san + ' ';
        }
        moveText += allHeaders.Result;

        // Word wrap at 80 characters
        const words = moveText.split(' ');
        let line = '';
        for (const word of words) {
            if (line.length + word.length + 1 > 80) {
                pgn += line.trim() + '\n';
                line = word + ' ';
            } else {
                line += word + ' ';
            }
        }
        pgn += line.trim();

        return pgn;
    }

    // Get piece symbol for display
    static getPieceSymbol(piece) {
        const symbols = {
            'k': { w: '♔', b: '♚' },
            'q': { w: '♕', b: '♛' },
            'r': { w: '♖', b: '♜' },
            'b': { w: '♗', b: '♝' },
            'n': { w: '♘', b: '♞' },
            'p': { w: '♙', b: '♟' }
        };
        return symbols[piece.type][piece.color];
    }
}

// Export for use in other modules
window.Chess = Chess;
