// Dostoevsky Chess - Main Application Logic

class DostoevskyChess {
    constructor() {
        this.game = null;
        this.board = null;
        this.selectedSquare = null;
        this.possibleMoves = [];
        this.currentPlayer = 'w';
        this.gameMode = null; // 'ai', 'local', 'online'
        this.aiDifficulty = 5;
        this.stockfish = null;
        this.isAITurn = false;
        this.peerConnection = null;
        this.dataConnection = null;
        this.peer = null;
        this.isHost = false;
        this.roomCode = null;
        this.peerId = null;
        this.moveHistory = [];
        this.capturedPieces = { w: [], b: [] };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showMainMenu();
        this.initQuotes();
    }

    initQuotes() {
        const quotes = [
            "The soul is healed by being with children",
            "Pain and suffering are always inevitable for a large intelligence and a deep heart",
            "The mystery of human existence lies not in just staying alive, but in finding something to live for",
            "To go wrong in one's own way is better than to go right in someone else's",
            "The cleverest of all, in my opinion, is the man who calls himself a fool at least once a month",
            "Man only likes to count his troubles; he doesn't calculate his happiness",
            "The degree of civilization in a society can be judged by entering its prisons"
        ];
        
        let currentQuote = 0;
        const quoteElement = document.getElementById('quote');
        
        setInterval(() => {
            currentQuote = (currentQuote + 1) % quotes.length;
            quoteElement.style.opacity = '0';
            setTimeout(() => {
                quoteElement.textContent = `"${quotes[currentQuote]}"`;
                quoteElement.style.opacity = '1';
            }, 300);
        }, 8000);
        
        // Initial fade-in
        quoteElement.style.transition = 'opacity 0.5s ease-in-out';
    }

    setupEventListeners() {
        // Main menu buttons
        document.getElementById('vsAIBtn').addEventListener('click', () => this.showAIDifficultyMenu());
        document.getElementById('localBtn').addEventListener('click', () => this.startLocalGame());
        document.getElementById('onlineBtn').addEventListener('click', () => this.showOnlineMenu());
        document.getElementById('joinBtn').addEventListener('click', () => this.showOnlineMenu());
        
        // Online menu
        document.getElementById('createRoomBtn').addEventListener('click', () => this.createOnlineRoom());
        document.getElementById('joinRoomBtn').addEventListener('click', () => this.joinOnlineRoom());
        document.getElementById('backToMainBtn').addEventListener('click', () => this.showMainMenu());
        
        // AI difficulty menu
        document.querySelectorAll('[data-difficulty]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.aiDifficulty = parseInt(e.target.dataset.difficulty);
                this.startAIGame();
            });
        });
        document.getElementById('backFromDifficultyBtn').addEventListener('click', () => this.showMainMenu());
        
        // Game controls
        document.getElementById('menuBtn').addEventListener('click', () => this.toggleGameMenu());
        document.getElementById('resumeBtn').addEventListener('click', () => this.toggleGameMenu());
        document.getElementById('newGameFromMenuBtn').addEventListener('click', () => this.confirmNewGame());
        document.getElementById('mainMenuFromGameBtn').addEventListener('click', () => this.returnToMainMenu());
        document.getElementById('undoBtn').addEventListener('click', () => this.undoMove());
        document.getElementById('resignBtn').addEventListener('click', () => this.resign());
        document.getElementById('newGameBtn').addEventListener('click', () => this.confirmNewGame());
        document.getElementById('shareBtn').addEventListener('click', () => this.shareGame());
        document.getElementById('statusBtn').addEventListener('click', () => this.hideGameStatus());
        
        // Room code input enter key
        document.getElementById('roomCodeInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.joinOnlineRoom();
            }
        });
    }

    showMainMenu() {
        document.getElementById('mainMenu').classList.remove('hidden');
        document.getElementById('onlineMenu').classList.add('hidden');
        document.getElementById('aiDifficultyMenu').classList.add('hidden');
        document.getElementById('gameScreen').classList.add('hidden');
        this.cleanup();
    }

    showOnlineMenu() {
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('onlineMenu').classList.remove('hidden');
        document.getElementById('gameScreen').classList.add('hidden');
    }

    showAIDifficultyMenu() {
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('aiDifficultyMenu').classList.remove('hidden');
    }

    startAIGame() {
        this.gameMode = 'ai';
        this.initStockfish();
        this.startNewGame();
    }

    startLocalGame() {
        this.gameMode = 'local';
        this.startNewGame();
    }

    async createOnlineRoom() {
        this.isHost = true;
        this.roomCode = this.generateRoomCode();
        this.gameMode = 'online';
        await this.setupPeerJS(true);
        this.startNewGame();
        this.showRoomCode();
    }

    async joinOnlineRoom() {
        const code = document.getElementById('roomCodeInput').value.trim().toUpperCase();
        if (!code || code.length !== 6) {
            alert('Please enter a valid 6-character room code');
            return;
        }
        this.isHost = false;
        this.roomCode = code;
        this.gameMode = 'online';
        await this.setupPeerJS(false);
        // Don't start new game yet - wait for connection and game state
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('onlineMenu').classList.add('hidden');
        document.getElementById('gameScreen').classList.remove('hidden');
        this.updateGameModeDisplay();
        this.showRoomCode();
        // Initialize empty board while waiting for connection
        this.game = new Chess();
        this.renderBoard();
    }

    generateRoomCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    showRoomCode() {
        const display = document.getElementById('roomCodeDisplay');
        display.textContent = `Room: ${this.roomCode}`;
        display.classList.remove('hidden');
    }

    startNewGame() {
        this.game = new Chess();
        this.selectedSquare = null;
        this.possibleMoves = [];
        this.currentPlayer = 'w';
        this.moveHistory = [];
        this.capturedPieces = { w: [], b: [] };
        this.isAITurn = false;
        
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('onlineMenu').classList.add('hidden');
        document.getElementById('aiDifficultyMenu').classList.add('hidden');
        document.getElementById('gameScreen').classList.remove('hidden');
        document.getElementById('gameMenuOverlay').classList.add('hidden');
        
        this.updateGameModeDisplay();
        this.renderBoard();
        this.updateMoveHistory();
        this.updateCapturedPieces();
        
        if (this.gameMode === 'ai' && this.currentPlayer === 'b') {
            this.makeAIMove();
        }
    }

    updateGameModeDisplay() {
        const modeText = {
            'ai': 'vs Stockfish',
            'local': 'Local Multiplayer',
            'online': 'Online Multiplayer'
        };
        document.getElementById('gameMode').textContent = modeText[this.gameMode];
    }

    initStockfish() {
        if (typeof Stockfish === 'undefined') {
            console.error('Stockfish not loaded');
            return;
        }
        
        this.stockfish = new Stockfish();
        this.stockfish.addMessageListener((line) => {
            if (line.includes('bestmove')) {
                const match = line.match(/bestmove ([a-h][1-8][a-h][1-8][qrnb]?)/);
                if (match) {
                    const move = match[1];
                    this.executeAIMove(move);
                }
            }
        });
        
        this.stockfish.postMessage('uci');
        this.stockfish.postMessage('isready');
    }

    makeAIMove() {
        if (!this.stockfish || this.isAITurn || this.game.game_over()) return;
        
        this.isAITurn = true;
        const depth = this.aiDifficulty;
        
        this.stockfish.postMessage(`position fen ${this.game.fen()}`);
        this.stockfish.postMessage(`go depth ${depth}`);
    }

    executeAIMove(moveString) {
        try {
            const move = this.game.move({
                from: moveString.substring(0, 2),
                to: moveString.substring(2, 4),
                promotion: moveString.length > 4 ? moveString[4] : 'q'
            });
            
            if (move) {
                this.handleMove(move);
                this.isAITurn = false;
            }
        } catch (e) {
            console.error('AI move error:', e);
            this.isAITurn = false;
        }
    }

    renderBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';
        
        const isFlipped = this.gameMode === 'ai' && this.currentPlayer === 'b';
        const ranks = isFlipped ? [1, 2, 3, 4, 5, 6, 7, 8].reverse() : [8, 7, 6, 5, 4, 3, 2, 1];
        const files = isFlipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        
        ranks.forEach(rank => {
            files.forEach(file => {
                const square = `${file}${rank}`;
                const squareElement = document.createElement('div');
                squareElement.className = 'square';
                squareElement.dataset.square = square;
                
                const isLight = (rank + file.charCodeAt(0) - 96) % 2 === 0;
                squareElement.classList.add(isLight ? 'light' : 'dark');
                
                const piece = this.game.get(square);
                if (piece) {
                    const pieceElement = document.createElement('span');
                    pieceElement.className = 'piece';
                    pieceElement.textContent = this.getPieceSymbol(piece);
                    squareElement.appendChild(pieceElement);
                }
                
                // Check if king is in check
                if (this.game.in_check() && piece && piece.type === 'k' && piece.color === this.currentPlayer) {
                    squareElement.classList.add('check');
                }
                
                squareElement.addEventListener('click', () => this.handleSquareClick(square));
                boardElement.appendChild(squareElement);
            });
        });
        
        this.updateSelectedSquare();
        this.updatePossibleMoves();
    }

    getPieceSymbol(piece) {
        const symbols = {
            'w': { 'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙' },
            'b': { 'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟' }
        };
        return symbols[piece.color][piece.type];
    }

    handleSquareClick(square) {
        if (this.isAITurn || this.game.game_over()) return;
        
        // Check if it's the player's turn
        if (this.gameMode === 'online' && this.isHost && this.currentPlayer === 'b') return;
        if (this.gameMode === 'online' && !this.isHost && this.currentPlayer === 'w') return;
        
        const piece = this.game.get(square);
        
        if (this.selectedSquare === square) {
            // Deselect
            this.selectedSquare = null;
            this.possibleMoves = [];
        } else if (piece && piece.color === this.currentPlayer) {
            // Select piece
            this.selectedSquare = square;
            this.possibleMoves = this.getPossibleMoves(square);
        } else if (this.selectedSquare) {
            // Try to make move
            const move = this.game.move({
                from: this.selectedSquare,
                to: square,
                promotion: 'q'
            });
            
            if (move) {
                this.handleMove(move);
            } else {
                // Invalid move, try selecting new piece
                if (piece && piece.color === this.currentPlayer) {
                    this.selectedSquare = square;
                    this.possibleMoves = this.getPossibleMoves(square);
                } else {
                    this.selectedSquare = null;
                    this.possibleMoves = [];
                }
            }
        }
        
        this.renderBoard();
    }

    getPossibleMoves(square) {
        const moves = this.game.moves({ square: square, verbose: true });
        return moves.map(move => move.to);
    }

    updateSelectedSquare() {
        if (this.selectedSquare) {
            const squareElement = document.querySelector(`[data-square="${this.selectedSquare}"]`);
            if (squareElement) {
                squareElement.classList.add('selected');
            }
        }
    }

    updatePossibleMoves() {
        this.possibleMoves.forEach(square => {
            const squareElement = document.querySelector(`[data-square="${square}"]`);
            if (squareElement) {
                squareElement.classList.add('possible-move');
            }
        });
    }

    handleMove(move) {
        this.moveHistory.push(move);
        
        // Track captured pieces
        if (move.captured) {
            const capturedColor = move.color === 'w' ? 'b' : 'w';
            this.capturedPieces[capturedColor].push(move.captured);
        }
        
        this.selectedSquare = null;
        this.possibleMoves = [];
        this.currentPlayer = this.game.turn();
        
        this.updateMoveHistory();
        this.updateCapturedPieces();
        this.updatePlayerInfo();
        
        // Send move to peer in online mode
        if (this.gameMode === 'online' && this.dataConnection && this.dataConnection.open) {
            this.dataConnection.send(JSON.stringify({ type: 'move', move: move.san }));
        }
        
        // Check game status
        if (this.game.game_over()) {
            this.handleGameOver();
        } else if (this.gameMode === 'ai' && this.currentPlayer === 'b') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    updateMoveHistory() {
        const historyElement = document.getElementById('moveHistory');
        historyElement.innerHTML = '';
        
        for (let i = 0; i < this.moveHistory.length; i += 2) {
            const moveEntry = document.createElement('div');
            moveEntry.className = 'move-entry';
            
            const moveNumber = Math.floor(i / 2) + 1;
            const whiteMove = this.moveHistory[i].san;
            const blackMove = this.moveHistory[i + 1] ? this.moveHistory[i + 1].san : '';
            
            moveEntry.innerHTML = `
                <span>${moveNumber}.</span>
                <span>${whiteMove} ${blackMove}</span>
            `;
            
            historyElement.appendChild(moveEntry);
        }
    }

    updateCapturedPieces() {
        const topCaptured = document.getElementById('topCaptured');
        const bottomCaptured = document.getElementById('bottomCaptured');
        
        const isFlipped = this.gameMode === 'ai' && this.currentPlayer === 'b';
        const topColor = isFlipped ? 'w' : 'b';
        const bottomColor = isFlipped ? 'b' : 'w';
        
        topCaptured.innerHTML = this.capturedPieces[topColor]
            .map(piece => this.getCapturedPieceSymbol(piece, topColor))
            .join('');
        
        bottomCaptured.innerHTML = this.capturedPieces[bottomColor]
            .map(piece => this.getCapturedPieceSymbol(piece, bottomColor))
            .join('');
    }

    getCapturedPieceSymbol(pieceType, color) {
        const symbols = {
            'w': { 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙' },
            'b': { 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟' }
        };
        return symbols[color][pieceType] || '';
    }

    updatePlayerInfo() {
        const isFlipped = this.gameMode === 'ai' && this.currentPlayer === 'b';
        
        if (this.gameMode === 'ai') {
            document.getElementById('topPlayerName').textContent = isFlipped ? 'You' : 'Stockfish';
            document.getElementById('bottomPlayerName').textContent = isFlipped ? 'Stockfish' : 'You';
        } else if (this.gameMode === 'local') {
            document.getElementById('topPlayerName').textContent = 'Black';
            document.getElementById('bottomPlayerName').textContent = 'White';
        } else {
            document.getElementById('topPlayerName').textContent = this.isHost ? 'Opponent' : 'You';
            document.getElementById('bottomPlayerName').textContent = this.isHost ? 'You' : 'Opponent';
        }
    }

    handleGameOver() {
        let title = '';
        let message = '';
        
        if (this.game.in_checkmate()) {
            const winner = this.currentPlayer === 'w' ? 'Black' : 'White';
            title = 'Checkmate!';
            message = `${winner} wins!`;
        } else if (this.game.in_draw()) {
            title = 'Draw!';
            if (this.game.in_stalemate()) {
                message = 'Stalemate - no legal moves';
            } else if (this.game.insufficient_material()) {
                message = 'Insufficient material';
            } else if (this.game.in_threefold_repetition()) {
                message = 'Threefold repetition';
            } else {
                message = 'Draw by agreement';
            }
        }
        
        this.showGameStatus(title, message);
    }

    showGameStatus(title, message) {
        document.getElementById('statusTitle').textContent = title;
        document.getElementById('statusMessage').textContent = message;
        document.getElementById('gameStatus').classList.remove('hidden');
    }

    hideGameStatus() {
        document.getElementById('gameStatus').classList.add('hidden');
    }

    undoMove() {
        if (this.moveHistory.length === 0) return;
        
        this.game.undo();
        const lastMove = this.moveHistory.pop();
        
        // Restore captured piece if needed
        if (lastMove.captured) {
            const capturedColor = lastMove.color === 'w' ? 'b' : 'w';
            this.capturedPieces[capturedColor].pop();
        }
        
        this.currentPlayer = this.game.turn();
        this.renderBoard();
        this.updateMoveHistory();
        this.updateCapturedPieces();
        this.updatePlayerInfo();
    }

    resign() {
        if (confirm('Are you sure you want to resign?')) {
            const winner = this.currentPlayer === 'w' ? 'Black' : 'White';
            this.showGameStatus('Resignation', `${winner} wins by resignation`);
        }
    }

    confirmNewGame() {
        if (confirm('Start a new game? Current game will be lost.')) {
            this.startNewGame();
            this.toggleGameMenu();
        }
    }

    returnToMainMenu() {
        if (confirm('Return to main menu? Current game will be lost.')) {
            this.showMainMenu();
        }
    }

    toggleGameMenu() {
        const overlay = document.getElementById('gameMenuOverlay');
        overlay.classList.toggle('hidden');
    }

    shareGame() {
        if (this.gameMode === 'online' && this.roomCode) {
            const url = `${window.location.origin}${window.location.pathname}?room=${this.roomCode}`;
            if (navigator.share) {
                navigator.share({
                    title: 'Join my Dostoevsky Chess game!',
                    text: `Join room: ${this.roomCode}`,
                    url: url
                }).catch(() => {
                    this.copyRoomCode(url);
                });
            } else {
                this.copyRoomCode(url);
            }
        } else {
            alert('Share feature available for online games only');
        }
    }

    copyRoomCode(url) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                alert(`Room code: ${this.roomCode}\n\nLink copied to clipboard! Share it with your friend.`);
            }).catch(() => {
                prompt('Copy this link:', url);
            });
        } else {
            prompt('Copy this link:', url);
        }
    }

    async setupPeerJS(isHost) {
        try {
            // Initialize PeerJS with room code as peer ID
            if (isHost) {
                this.peer = new Peer(this.roomCode, {
                    host: '0.peerjs.com',
                    port: 443,
                    path: '/',
                    secure: true
                });
                
                this.peer.on('open', (id) => {
                    console.log('Host peer connected:', id);
                    this.peerId = id;
                });
                
                this.peer.on('connection', (conn) => {
                    console.log('Peer connected');
                    this.dataConnection = conn;
                    this.setupDataConnection();
                });
                
                this.peer.on('error', (err) => {
                    console.error('Peer error:', err);
                    if (err.type === 'peer-unavailable') {
                        // Peer not found yet, waiting for connection
                    } else {
                        alert('Connection error. Please try again.');
                    }
                });
            } else {
                // Joining player uses room code to connect
                this.peer = new Peer(undefined, {
                    host: '0.peerjs.com',
                    port: 443,
                    path: '/',
                    secure: true
                });
                
                this.peer.on('open', (id) => {
                    console.log('Joining peer connected:', id);
                    this.peerId = id;
                    // Connect to host using room code
                    this.dataConnection = this.peer.connect(this.roomCode);
                    if (this.dataConnection) {
                        this.setupDataConnection();
                    }
                });
                
                this.peer.on('error', (err) => {
                    console.error('Peer error:', err);
                    if (err.type === 'peer-unavailable') {
                        alert('Room not found. Please check the room code.');
                    } else {
                        alert('Connection error. Please try again.');
                    }
                });
            }
        } catch (error) {
            console.error('PeerJS setup error:', error);
            alert('Failed to setup multiplayer connection. Please try again.');
        }
    }

    setupDataConnection() {
        if (!this.dataConnection) return;
        
        this.dataConnection.on('open', () => {
            console.log('Data connection opened');
            // Send initial game state if host
            if (this.isHost && this.game) {
                setTimeout(() => {
                    this.dataConnection.send(JSON.stringify({ 
                        type: 'gameState', 
                        fen: this.game.fen() 
                    }));
                }, 500);
            } else if (!this.isHost) {
                // Request game state from host
                setTimeout(() => {
                    this.dataConnection.send(JSON.stringify({ 
                        type: 'requestState' 
                    }));
                }, 500);
            }
        });
        
        this.dataConnection.on('data', (data) => {
            try {
                const message = JSON.parse(data);
                
                if (message.type === 'move') {
                    const move = this.game.move(message.move);
                    if (move) {
                        this.handleMove(move);
                        this.renderBoard();
                    }
                } else if (message.type === 'gameState') {
                    // Sync game state when joining
                    if (message.fen) {
                        this.game = new Chess(message.fen);
                        this.currentPlayer = this.game.turn();
                        this.moveHistory = [];
                        this.capturedPieces = { w: [], b: [] };
                        // Reconstruct move history from FEN if needed, or just render current state
                        this.renderBoard();
                        this.updateMoveHistory();
                        this.updateCapturedPieces();
                        this.updatePlayerInfo();
                    }
                } else if (message.type === 'requestState' && this.isHost) {
                    // Send current game state to joining player
                    if (this.game) {
                        this.dataConnection.send(JSON.stringify({ 
                            type: 'gameState', 
                            fen: this.game.fen() 
                        }));
                    }
                }
            } catch (error) {
                console.error('Data connection error:', error);
            }
        });
        
        this.dataConnection.on('error', (err) => {
            console.error('Data connection error:', err);
        });
        
        this.dataConnection.on('close', () => {
            console.log('Data connection closed');
            alert('Connection lost. Returning to main menu.');
            this.showMainMenu();
        });
    }

    cleanup() {
        if (this.stockfish) {
            this.stockfish.terminate();
            this.stockfish = null;
        }
        
        if (this.dataConnection) {
            this.dataConnection.close();
            this.dataConnection = null;
        }
        
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chessApp = new DostoevskyChess();
    
    // Check for room code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('room');
    if (roomCode) {
        document.getElementById('roomCodeInput').value = roomCode;
        // Auto-show online menu
        setTimeout(() => {
            document.getElementById('joinBtn').click();
        }, 500);
    }
});
