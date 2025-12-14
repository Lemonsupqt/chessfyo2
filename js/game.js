class GameManager {
    constructor() {
        this.game = new Chess();
        this.board = null;
        this.boardConfig = {
            draggable: true,
            position: 'start',
            onDragStart: this.onDragStart.bind(this),
            onDrop: this.onDrop.bind(this),
            onSnapEnd: this.onSnapEnd.bind(this),
            pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png' // Default for now
        };
        this.mode = 'local'; // local, ai, online
        this.playerColor = 'w'; // w or b
        this.isGameOver = false;
        
        // Callbacks
        this.onMoveCallback = null;
    }

    init(elementId) {
        this.board = Chessboard(elementId, this.boardConfig);
        $(window).resize(() => this.board.resize());
    }

    reset() {
        this.game.reset();
        this.board.start();
        this.isGameOver = false;
        this.updateStatus();
    }

    loadFEN(fen) {
        this.game.load(fen);
        this.board.position(fen);
        this.updateStatus();
    }

    setMode(mode) {
        this.mode = mode;
        if (mode === 'local') {
            this.playerColor = 'w'; // Actually both
        }
    }

    setPlayerColor(color) {
        this.playerColor = color;
        this.board.orientation(color === 'w' ? 'white' : 'black');
    }

    onDragStart(source, piece, position, orientation) {
        if (this.game.game_over()) return false;

        // Enforce turn order for all modes
        if ((this.game.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (this.game.turn() === 'b' && piece.search(/^w/) !== -1)) {
            return false;
        }

        // Mode specific restrictions (can only move own pieces in AI/Online)
        if (this.mode === 'ai' || this.mode === 'online') {
            // Check if player owns the pieces they are trying to move
            if ((this.playerColor === 'w' && piece.search(/^b/) !== -1) ||
                (this.playerColor === 'b' && piece.search(/^w/) !== -1)) {
                return false;
            }
        }
    }

    onDrop(source, target) {
        // see if the move is legal
        let move = this.game.move({
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        });

        // illegal move
        if (move === null) return 'snapback';

        this.updateStatus();
        
        // Trigger callback (for AI or Network to send move)
        if (this.onMoveCallback) {
            this.onMoveCallback(move);
        }
    }

    onSnapEnd() {
        this.board.position(this.game.fen());
    }

    makeMove(moveObj) {
        // moveObj can be SAN string or object {from, to}
        let move = this.game.move(moveObj);
        if (move) {
            this.board.position(this.game.fen());
            this.updateStatus();
        }
        return move;
    }

    updateStatus() {
        let status = '';
        let moveColor = (this.game.turn() === 'w') ? 'White' : 'Black';

        if (this.game.in_checkmate()) {
            status = 'Game over, ' + moveColor + ' is in checkmate.';
            this.isGameOver = true;
            Theme.updateQuote(); // Show a new quote on game over
        } else if (this.game.in_draw()) {
            status = 'Game over, drawn position';
            this.isGameOver = true;
            Theme.updateQuote();
        } else {
            status = moveColor + ' to move';
            if (this.game.in_check()) {
                status += ', ' + moveColor + ' is in check';
            }
        }

        $('#status-text').text(status);
        $('#pgn').text(this.game.pgn());
    }

    flipBoard() {
        this.board.flip();
        this.playerColor = (this.playerColor === 'w') ? 'b' : 'w'; // Toggle for local play visualization if needed
    }
}

// Global instance
window.gameManager = new GameManager();
