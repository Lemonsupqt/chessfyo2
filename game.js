// Dostoevsky Chess Game Logic

// Dostoevsky quotes
const dostoevsky_quotes = [
    "The mystery of human existence lies not in just staying alive, but in finding something to live for.",
    "Man is sometimes extraordinarily, passionately, in love with suffering.",
    "Beauty will save the world.",
    "To love someone means to see them as God intended them.",
    "The best way to keep a prisoner from escaping is to make sure he never knows he's in prison.",
    "Pain and suffering are always inevitable for a large intelligence and a deep heart.",
    "It takes something more than intelligence to act intelligently.",
    "The soul is healed by being with children.",
    "Above all, don't lie to yourself. The man who lies to himself and listens to his own lie comes to a point that he cannot distinguish the truth within him.",
    "What is hell? I maintain that it is the suffering of being unable to love.",
    "The darker the night, the brighter the stars.",
    "To go wrong in one's own way is better than to go right in someone else's.",
    "Power is given only to those who dare to lower themselves and pick it up. Only one thing matters, one thing; to be able to dare!",
    "If you want to overcome the whole world, overcome yourself.",
    "We sometimes encounter people, even perfect strangers, who begin to interest us at first sight, somehow suddenly, all at once, before a word has been spoken.",
    "There is nothing in the world more difficult than candor, and nothing easier than flattery.",
    "Realists do not fear the results of their study.",
    "A real gentleman, even if he loses everything he owns, must show no emotion. Money must be so far beneath a gentleman that it is hardly worth troubling about."
];

// Game state
let gameState = {
    mode: null, // 'ai-easy', 'ai-medium', 'ai-hard', 'online', 'local'
    chess: null,
    selectedSquare: null,
    playerColor: 'white',
    isPlayerTurn: true,
    moveHistory: [],
    capturedPieces: { white: [], black: [] },
    peer: null,
    conn: null,
    roomCode: null,
    isHost: false,
    stockfish: null,
    lastMove: null
};

// Unicode chess pieces
const pieces = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

// Initialize game on page load
window.onload = function() {
    displayRandomQuote();
    setInterval(displayRandomQuote, 15000); // Change quote every 15 seconds
};

// Display random Dostoevsky quote
function displayRandomQuote() {
    const quote = dostoevsky_quotes[Math.floor(Math.random() * dostoevsky_quotes.length)];
    const quoteElement = document.getElementById('randomQuote');
    if (quoteElement) {
        quoteElement.style.opacity = '0';
        setTimeout(() => {
            quoteElement.textContent = `"${quote}"`;
            quoteElement.style.opacity = '1';
        }, 300);
    }
}

// Navigation functions
function showMainMenu() {
    document.querySelectorAll('.menu-screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('mainMenu').classList.add('active');
    document.getElementById('gameScreen').classList.remove('active');
    
    // Clean up connections
    if (gameState.conn) gameState.conn.close();
    if (gameState.peer) gameState.peer.destroy();
    if (gameState.stockfish) gameState.stockfish.terminate();
    gameState = {
        mode: null,
        chess: null,
        selectedSquare: null,
        playerColor: 'white',
        isPlayerTurn: true,
        moveHistory: [],
        capturedPieces: { white: [], black: [] },
        peer: null,
        conn: null,
        roomCode: null,
        isHost: false,
        stockfish: null,
        lastMove: null
    };
}

function showModeSelection() {
    document.querySelectorAll('.menu-screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('modeSelection').classList.add('active');
}

function showJoinGame() {
    document.querySelectorAll('.menu-screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('joinGame').classList.add('active');
}

function showAbout() {
    document.querySelectorAll('.menu-screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('aboutScreen').classList.add('active');
}

// Start game with selected mode
async function startGame(mode) {
    gameState.mode = mode;
    gameState.chess = new Chess();
    gameState.moveHistory = [];
    gameState.capturedPieces = { white: [], black: [] };
    gameState.selectedSquare = null;
    gameState.lastMove = null;
    
    // Hide all menus and show game screen
    document.querySelectorAll('.menu-screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('gameScreen').classList.add('active');
    
    // Update game mode display
    let modeText = '';
    let whitePlayer = 'You';
    let blackPlayer = 'Opponent';
    
    if (mode === 'ai-easy') {
        modeText = 'Playing vs Stockfish (Easy)';
        blackPlayer = 'Stockfish (Easy)';
        gameState.stockfish = new StockfishEngine();
        await gameState.stockfish.init();
        gameState.stockfish.setDifficulty(1);
    } else if (mode === 'ai-medium') {
        modeText = 'Playing vs Stockfish (Medium)';
        blackPlayer = 'Stockfish (Medium)';
        gameState.stockfish = new StockfishEngine();
        await gameState.stockfish.init();
        gameState.stockfish.setDifficulty(10);
    } else if (mode === 'ai-hard') {
        modeText = 'Playing vs Stockfish (Hard)';
        blackPlayer = 'Stockfish (Master)';
        gameState.stockfish = new StockfishEngine();
        await gameState.stockfish.init();
        gameState.stockfish.setDifficulty(20);
    } else if (mode === 'online') {
        modeText = 'Online Multiplayer';
        await setupOnlineGame();
        document.getElementById('shareBtn').style.display = 'block';
    } else if (mode === 'local') {
        modeText = 'Local Multiplayer';
        whitePlayer = 'White';
        blackPlayer = 'Black';
    }
    
    document.getElementById('gameMode').textContent = modeText;
    document.getElementById('whitePlayerName').textContent = whitePlayer;
    document.getElementById('blackPlayerName').textContent = blackPlayer;
    
    // Display a game quote
    const gameQuote = dostoevsky_quotes[Math.floor(Math.random() * dostoevsky_quotes.length)];
    document.getElementById('gameQuote').textContent = `"${gameQuote}"`;
    
    // Initialize board
    initBoard();
    updateGameStatus();
}

// Setup online game with PeerJS
async function setupOnlineGame() {
    gameState.isHost = true;
    gameState.roomCode = generateRoomCode();
    
    // Initialize PeerJS
    gameState.peer = new Peer(gameState.roomCode, {
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        }
    });
    
    gameState.peer.on('open', (id) => {
        updateConnectionStatus('Waiting for opponent...');
        console.log('Room created:', id);
    });
    
    gameState.peer.on('connection', (conn) => {
        gameState.conn = conn;
        setupConnection();
        updateConnectionStatus('Opponent connected!');
        setTimeout(() => {
            document.getElementById('connectionStatus').style.display = 'none';
        }, 3000);
    });
    
    gameState.peer.on('error', (err) => {
        console.error('Peer error:', err);
        updateConnectionStatus('Connection error. Please try again.');
    });
}

// Join online game
function joinRoom() {
    const roomCode = document.getElementById('roomCodeInput').value.trim().toUpperCase();
    
    if (!roomCode) {
        alert('Please enter a room code');
        return;
    }
    
    gameState.mode = 'online';
    gameState.chess = new Chess();
    gameState.isHost = false;
    gameState.playerColor = 'black';
    gameState.isPlayerTurn = false;
    
    // Hide menus and show game
    document.querySelectorAll('.menu-screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('gameScreen').classList.add('active');
    
    document.getElementById('gameMode').textContent = 'Online Multiplayer';
    document.getElementById('whitePlayerName').textContent = 'Opponent';
    document.getElementById('blackPlayerName').textContent = 'You';
    
    const gameQuote = dostoevsky_quotes[Math.floor(Math.random() * dostoevsky_quotes.length)];
    document.getElementById('gameQuote').textContent = `"${gameQuote}"`;
    
    // Connect to peer
    gameState.peer = new Peer({
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        }
    });
    
    gameState.peer.on('open', () => {
        gameState.conn = gameState.peer.connect(roomCode);
        setupConnection();
        updateConnectionStatus('Connecting...');
    });
    
    initBoard();
    updateGameStatus();
}

// Setup connection handlers
function setupConnection() {
    gameState.conn.on('open', () => {
        console.log('Connected to peer');
        updateConnectionStatus('Connected!');
        setTimeout(() => {
            document.getElementById('connectionStatus').style.display = 'none';
        }, 2000);
    });
    
    gameState.conn.on('data', (data) => {
        if (data.type === 'move') {
            receiveMove(data.move);
        } else if (data.type === 'resign') {
            showGameEnd('Victory!', 'Your opponent has resigned.');
        }
    });
    
    gameState.conn.on('close', () => {
        updateConnectionStatus('Opponent disconnected');
    });
}

// Send move to opponent
function sendMove(move) {
    if (gameState.conn && gameState.conn.open) {
        gameState.conn.send({ type: 'move', move: move });
    }
}

// Receive move from opponent
function receiveMove(move) {
    const result = gameState.chess.move(move);
    if (result) {
        updateCapturedPieces(result);
        gameState.moveHistory.push(result);
        gameState.lastMove = { from: move.from, to: move.to };
        gameState.isPlayerTurn = true;
        renderBoard();
        updateMoveHistory();
        updateGameStatus();
        checkGameEnd();
    }
}

// Update connection status
function updateConnectionStatus(message) {
    const statusElement = document.getElementById('connectionStatus');
    const statusText = document.getElementById('statusText');
    statusElement.style.display = 'block';
    statusText.textContent = message;
}

// Show room code
function showRoomCode() {
    if (gameState.roomCode) {
        const message = `Share this code with your friend:\n\n${gameState.roomCode}`;
        alert(message);
        
        // Copy to clipboard
        navigator.clipboard.writeText(gameState.roomCode).then(() => {
            alert('Room code copied to clipboard!');
        });
    }
}

// Generate random room code
function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Initialize chessboard
function initBoard() {
    const board = document.getElementById('chessboard');
    board.innerHTML = '';
    
    const isFlipped = gameState.playerColor === 'black';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            const displayRow = isFlipped ? row : 7 - row;
            const displayCol = isFlipped ? 7 - col : col;
            
            const file = String.fromCharCode(97 + displayCol); // a-h
            const rank = displayRow + 1; // 1-8
            const squareId = file + rank;
            
            square.className = 'square ' + ((row + col) % 2 === 0 ? 'light' : 'dark');
            square.dataset.square = squareId;
            square.onclick = () => handleSquareClick(squareId);
            
            board.appendChild(square);
        }
    }
    
    renderBoard();
}

// Render current board state
function renderBoard() {
    const board = gameState.chess.board();
    const isFlipped = gameState.playerColor === 'black';
    
    document.querySelectorAll('.square').forEach(square => {
        const squareId = square.dataset.square;
        const file = squareId.charCodeAt(0) - 97;
        const rank = parseInt(squareId[1]) - 1;
        
        const piece = board[7 - rank][file];
        square.textContent = piece ? pieces[piece.type.toUpperCase() === piece.type ? piece.type.toUpperCase() : piece.type] : '';
        
        // Remove all highlighting
        square.classList.remove('selected', 'valid-move', 'valid-capture', 'last-move');
        
        // Highlight last move
        if (gameState.lastMove) {
            if (squareId === gameState.lastMove.from || squareId === gameState.lastMove.to) {
                square.classList.add('last-move');
            }
        }
    });
}

// Handle square click
function handleSquareClick(squareId) {
    if (!gameState.isPlayerTurn) return;
    
    // Check if it's the right turn in local mode
    if (gameState.mode === 'local') {
        const turn = gameState.chess.turn();
        // In local mode, both players can move
        gameState.isPlayerTurn = true;
    }
    
    const piece = gameState.chess.get(squareId);
    
    // If a square is already selected
    if (gameState.selectedSquare) {
        // Try to make a move
        const move = makeMove(gameState.selectedSquare, squareId);
        
        if (move) {
            gameState.selectedSquare = null;
            renderBoard();
        } else if (piece && piece.color === gameState.chess.turn()) {
            // Select new piece
            gameState.selectedSquare = squareId;
            highlightMoves(squareId);
        } else {
            // Deselect
            gameState.selectedSquare = null;
            renderBoard();
        }
    } else {
        // Select a piece
        if (piece && piece.color === gameState.chess.turn()) {
            // In online mode, check if it's the player's color
            if (gameState.mode === 'online') {
                const playerTurnColor = gameState.playerColor === 'white' ? 'w' : 'b';
                if (piece.color !== playerTurnColor) return;
            }
            
            gameState.selectedSquare = squareId;
            highlightMoves(squareId);
        }
    }
}

// Highlight valid moves
function highlightMoves(squareId) {
    renderBoard();
    
    const square = document.querySelector(`[data-square="${squareId}"]`);
    square.classList.add('selected');
    
    const moves = gameState.chess.moves({ square: squareId, verbose: true });
    
    moves.forEach(move => {
        const targetSquare = document.querySelector(`[data-square="${move.to}"]`);
        if (move.captured) {
            targetSquare.classList.add('valid-capture');
        } else {
            targetSquare.classList.add('valid-move');
        }
    });
}

// Make a move
function makeMove(from, to) {
    // Check for pawn promotion
    const piece = gameState.chess.get(from);
    let promotion = undefined;
    
    if (piece && piece.type === 'p') {
        const toRank = parseInt(to[1]);
        if ((piece.color === 'w' && toRank === 8) || (piece.color === 'b' && toRank === 1)) {
            promotion = 'q'; // Auto-promote to queen
        }
    }
    
    const move = gameState.chess.move({ from, to, promotion });
    
    if (move) {
        updateCapturedPieces(move);
        gameState.moveHistory.push(move);
        gameState.lastMove = { from, to };
        updateMoveHistory();
        updateGameStatus();
        
        // Send move in online mode
        if (gameState.mode === 'online') {
            sendMove({ from, to, promotion });
            gameState.isPlayerTurn = false;
        }
        
        // Check for game end
        const gameEnd = checkGameEnd();
        if (gameEnd) return move;
        
        // AI move
        if (gameState.mode.startsWith('ai-') && gameState.chess.turn() === 'b') {
            gameState.isPlayerTurn = false;
            updateGameStatus();
            
            setTimeout(() => {
                makeAIMove();
            }, 500);
        }
        
        return move;
    }
    
    return null;
}

// Make AI move using Stockfish
function makeAIMove() {
    if (!gameState.stockfish || !gameState.stockfish.ready) {
        // Fallback to random move
        const moves = gameState.chess.moves({ verbose: true });
        if (moves.length > 0) {
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            makeMove(randomMove.from, randomMove.to);
        }
        return;
    }
    
    gameState.stockfish.getBestMove(gameState.chess.fen(), (moveString) => {
        const from = moveString.substring(0, 2);
        const to = moveString.substring(2, 4);
        const promotion = moveString.length > 4 ? moveString[4] : undefined;
        
        const move = gameState.chess.move({ from, to, promotion });
        if (move) {
            updateCapturedPieces(move);
            gameState.moveHistory.push(move);
            gameState.lastMove = { from, to };
            gameState.isPlayerTurn = true;
            renderBoard();
            updateMoveHistory();
            updateGameStatus();
            checkGameEnd();
        }
    });
}

// Update captured pieces display
function updateCapturedPieces(move) {
    if (move.captured) {
        const capturingColor = move.color;
        const capturedPiece = move.captured;
        
        if (capturingColor === 'w') {
            gameState.capturedPieces.white.push(capturedPiece);
        } else {
            gameState.capturedPieces.black.push(capturedPiece);
        }
    }
    
    // Update display
    const whiteCaptured = gameState.capturedPieces.white
        .map(p => pieces[p])
        .join(' ');
    const blackCaptured = gameState.capturedPieces.black
        .map(p => pieces[p.toUpperCase()])
        .join(' ');
    
    document.getElementById('whiteCaptured').textContent = whiteCaptured;
    document.getElementById('blackCaptured').textContent = blackCaptured;
}

// Update move history display
function updateMoveHistory() {
    const historyDiv = document.getElementById('moveHistory');
    historyDiv.innerHTML = '';
    
    for (let i = 0; i < gameState.moveHistory.length; i += 2) {
        const moveDiv = document.createElement('div');
        moveDiv.className = 'move-pair';
        
        const moveNumber = document.createElement('span');
        moveNumber.className = 'move-number';
        moveNumber.textContent = Math.floor(i / 2) + 1 + '.';
        
        const whiteMove = document.createElement('span');
        whiteMove.className = 'move';
        whiteMove.textContent = gameState.moveHistory[i].san;
        
        moveDiv.appendChild(moveNumber);
        moveDiv.appendChild(whiteMove);
        
        if (i + 1 < gameState.moveHistory.length) {
            const blackMove = document.createElement('span');
            blackMove.className = 'move';
            blackMove.textContent = gameState.moveHistory[i + 1].san;
            moveDiv.appendChild(blackMove);
        }
        
        historyDiv.appendChild(moveDiv);
    }
    
    // Scroll to bottom
    historyDiv.scrollTop = historyDiv.scrollHeight;
}

// Update game status
function updateGameStatus() {
    const turn = gameState.chess.turn() === 'w' ? 'White' : 'Black';
    let status = turn + ' to move';
    
    if (gameState.chess.in_check()) {
        status = turn + ' is in check!';
    }
    
    if (!gameState.isPlayerTurn && gameState.mode.startsWith('ai-')) {
        status = 'AI is thinking...';
    }
    
    if (!gameState.isPlayerTurn && gameState.mode === 'online') {
        status = 'Waiting for opponent...';
    }
    
    document.getElementById('gameStatus').textContent = status;
}

// Check for game end
function checkGameEnd() {
    if (gameState.chess.game_over()) {
        let title = '';
        let message = '';
        
        if (gameState.chess.in_checkmate()) {
            const winner = gameState.chess.turn() === 'w' ? 'Black' : 'White';
            title = winner + ' wins!';
            message = 'Checkmate! ' + winner + ' is victorious.';
        } else if (gameState.chess.in_draw()) {
            title = 'Draw!';
            if (gameState.chess.in_stalemate()) {
                message = 'The game ends in stalemate.';
            } else if (gameState.chess.in_threefold_repetition()) {
                message = 'Draw by threefold repetition.';
            } else if (gameState.chess.insufficient_material()) {
                message = 'Draw by insufficient material.';
            } else {
                message = 'The game is a draw.';
            }
        }
        
        showGameEnd(title, message);
        return true;
    }
    
    return false;
}

// Show game end modal
function showGameEnd(title, message) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('gameEndModal').classList.add('active');
}

// Undo last move
function undoMove() {
    if (gameState.moveHistory.length === 0) return;
    
    // Can't undo in online mode
    if (gameState.mode === 'online') {
        alert('Cannot undo moves in online games');
        return;
    }
    
    // Undo twice for AI mode (player move + AI move)
    if (gameState.mode.startsWith('ai-')) {
        if (gameState.moveHistory.length >= 2) {
            gameState.chess.undo();
            gameState.chess.undo();
            gameState.moveHistory.pop();
            gameState.moveHistory.pop();
        }
    } else {
        gameState.chess.undo();
        gameState.moveHistory.pop();
    }
    
    // Recalculate captured pieces
    gameState.capturedPieces = { white: [], black: [] };
    gameState.moveHistory.forEach(move => {
        if (move.captured) {
            if (move.color === 'w') {
                gameState.capturedPieces.white.push(move.captured);
            } else {
                gameState.capturedPieces.black.push(move.captured);
            }
        }
    });
    
    updateCapturedPieces({});
    gameState.selectedSquare = null;
    gameState.isPlayerTurn = true;
    renderBoard();
    updateMoveHistory();
    updateGameStatus();
}

// Resign game
function resignGame() {
    if (confirm('Are you sure you want to resign?')) {
        if (gameState.mode === 'online' && gameState.conn && gameState.conn.open) {
            gameState.conn.send({ type: 'resign' });
        }
        showGameEnd('You resigned', 'You have chosen to surrender.');
    }
}

// Rematch
function rematch() {
    document.getElementById('gameEndModal').classList.remove('active');
    startGame(gameState.mode);
}

// Return to menu
function returnToMenu() {
    document.getElementById('gameEndModal').classList.remove('active');
    showMainMenu();
}
