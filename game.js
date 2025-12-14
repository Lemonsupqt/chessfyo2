// ==========================================
// DOSTOEVSKY CHESS - Main Game Logic
// ==========================================

// Dostoevsky Quotes for rotation
const dostoevsky_quotes = [
    "The best way to keep a prisoner from escaping is to make sure he never knows he's in prison.",
    "Pain and suffering are always inevitable for a large intelligence and a deep heart.",
    "To live without Hope is to Cease to live.",
    "Man is a mystery. It needs to be unraveled, and if you spend your whole life unraveling it, don't say that you've wasted time.",
    "The soul is healed by being with children.",
    "If you want to overcome the whole world, overcome yourself.",
    "The degree of civilization in a society can be judged by entering its prisons.",
    "We sometimes encounter people, even perfect strangers, who begin to interest us at first sight.",
    "Beauty will save the world.",
    "Above all, don't lie to yourself. The man who lies to himself and listens to his own lie comes to a point that he cannot distinguish the truth within him.",
    "It takes something more than intelligence to act intelligently.",
    "Sarcasm: the last refuge of modest and chaste-souled people when the privacy of their soul is coarsely and intrusively invaded."
];

// Game quotes for during gameplay
const game_quotes = [
    "The greatest happiness is to know the source of unhappiness.",
    "Power is given only to those who dare to lower themselves and pick it up.",
    "What is hell? I maintain that it is the suffering of being unable to love.",
    "Man grows used to everything, the scoundrel.",
    "The cleverest of all, in my opinion, is the man who calls himself a fool at least once a month.",
    "It is not the brains that matter most, but that which guides them.",
    "Taking a new step, uttering a new word, is what people fear most.",
    "There is nothing in the world more difficult than candor, and nothing easier than flattery."
];

// ==========================================
// GLOBAL STATE
// ==========================================

let currentScreen = 'mode-selection';
let gameMode = null; // 'ai', 'local', 'online'
let chess = new Chess();
let selectedSquare = null;
let playerColor = 'white';
let stockfish = null;
let aiDifficulty = 10;
let peer = null;
let connection = null;
let gameId = null;
let isMyTurn = true;
let moveHistory = [];
let capturedPieces = { white: [], black: [] };
let lastMoveSquares = [];

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Hide loading screen
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        showScreen('mode-selection');
    }, 1000);
    
    initializeEventListeners();
    rotateQuotes();
    setInterval(rotateQuotes, 15000); // Rotate quotes every 15 seconds
});

function initializeEventListeners() {
    // Mode selection
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.currentTarget.getAttribute('data-mode');
            selectMode(mode);
        });
    });

    // AI Setup
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });

    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });

    document.getElementById('start-ai-game').addEventListener('click', startAIGame);
    document.getElementById('back-from-ai').addEventListener('click', () => showScreen('mode-selection'));
    document.getElementById('back-from-online').addEventListener('click', () => showScreen('mode-selection'));

    // Online Setup
    document.getElementById('create-game-btn').addEventListener('click', createOnlineGame);
    document.getElementById('join-game-btn').addEventListener('click', joinOnlineGame);
    document.getElementById('copy-link-btn').addEventListener('click', copyGameLink);

    // Game Controls
    document.getElementById('resign-btn').addEventListener('click', resignGame);
    document.getElementById('draw-btn').addEventListener('click', offerDraw);
    document.getElementById('new-game-btn').addEventListener('click', startNewGame);

    // Modal
    document.getElementById('modal-new-game').addEventListener('click', () => {
        hideModal();
        startNewGame();
    });
    document.getElementById('modal-main-menu').addEventListener('click', () => {
        hideModal();
        showScreen('mode-selection');
    });
}

// ==========================================
// SCREEN MANAGEMENT
// ==========================================

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;
}

// ==========================================
// MODE SELECTION
// ==========================================

function selectMode(mode) {
    gameMode = mode;
    
    if (mode === 'ai') {
        showScreen('ai-setup');
    } else if (mode === 'local') {
        startLocalGame();
    } else if (mode === 'online') {
        showScreen('online-setup');
    }
}

// ==========================================
// AI GAME
// ==========================================

async function startAIGame() {
    // Get selected color
    const selectedColorBtn = document.querySelector('.color-btn.active');
    let color = selectedColorBtn.getAttribute('data-color');
    
    if (color === 'random') {
        color = Math.random() < 0.5 ? 'white' : 'black';
    }
    
    playerColor = color;
    
    // Get difficulty
    const selectedDifficultyBtn = document.querySelector('.difficulty-btn.active');
    aiDifficulty = parseInt(selectedDifficultyBtn.getAttribute('data-level'));
    
    // Initialize Stockfish
    try {
        stockfish = new StockfishEngine();
        await stockfish.init();
        console.log('Stockfish initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Stockfish:', error);
        alert('Could not load Stockfish AI. Please check your internet connection.');
        return;
    }
    
    // Update player names
    document.getElementById('player-name').textContent = 'You';
    document.getElementById('opponent-name').textContent = 'Stockfish';
    
    // Start game
    startGame();
    
    // If player is black, AI makes first move
    if (playerColor === 'black') {
        setTimeout(() => makeAIMove(), 500);
    }
}

async function makeAIMove() {
    if (!stockfish || chess.game_over()) return;
    
    updateStatus('Stockfish is thinking...');
    
    try {
        // Get all moves in algebraic notation
        const moves = chess.history({ verbose: true });
        const moveString = moves.map(m => m.from + m.to + (m.promotion || '')).join(' ');
        
        if (moveString) {
            stockfish.setPositionMoves(moveString);
        } else {
            stockfish.send('position startpos');
        }
        
        const bestMove = await stockfish.getBestMove(aiDifficulty);
        
        if (bestMove && bestMove !== '(none)') {
            const from = bestMove.substring(0, 2);
            const to = bestMove.substring(2, 4);
            const promotion = bestMove.length > 4 ? bestMove[4] : undefined;
            
            const move = chess.move({
                from: from,
                to: to,
                promotion: promotion
            });
            
            if (move) {
                lastMoveSquares = [from, to];
                updateBoard();
                updateMoveHistory();
                updateCapturedPieces();
                updateStatus();
                checkGameOver();
            }
        }
    } catch (error) {
        console.error('AI move error:', error);
        updateStatus('AI error - your turn');
    }
}

// ==========================================
// LOCAL GAME
// ==========================================

function startLocalGame() {
    playerColor = 'white';
    document.getElementById('player-name').textContent = 'Player 1';
    document.getElementById('opponent-name').textContent = 'Player 2';
    startGame();
}

// ==========================================
// ONLINE GAME
// ==========================================

function createOnlineGame() {
    // Initialize PeerJS
    peer = new Peer();
    
    peer.on('open', (id) => {
        gameId = id;
        document.getElementById('display-game-id').textContent = id;
        
        const gameLink = `${window.location.origin}${window.location.pathname}?game=${id}`;
        document.getElementById('game-link').value = gameLink;
        
        document.getElementById('waiting-room').classList.remove('hidden');
        
        playerColor = 'white'; // Creator is always white
    });
    
    peer.on('connection', (conn) => {
        connection = conn;
        setupConnection();
        startGame();
        document.getElementById('player-name').textContent = 'You (White)';
        document.getElementById('opponent-name').textContent = 'Opponent (Black)';
    });
    
    peer.on('error', (error) => {
        console.error('Peer error:', error);
        alert('Connection error: ' + error.message);
    });
}

function joinOnlineGame() {
    const inputGameId = document.getElementById('game-id-input').value.trim();
    
    if (!inputGameId) {
        alert('Please enter a Game ID');
        return;
    }
    
    gameId = inputGameId;
    
    // Initialize PeerJS
    peer = new Peer();
    
    peer.on('open', () => {
        connection = peer.connect(gameId);
        setupConnection();
        
        playerColor = 'black'; // Joiner is always black
        
        document.getElementById('player-name').textContent = 'You (Black)';
        document.getElementById('opponent-name').textContent = 'Opponent (White)';
        
        connection.on('open', () => {
            startGame();
            isMyTurn = false; // Black waits for white's first move
        });
    });
    
    peer.on('error', (error) => {
        console.error('Peer error:', error);
        alert('Could not connect to game. Please check the Game ID.');
    });
}

function setupConnection() {
    connection.on('data', (data) => {
        handleOpponentMove(data);
    });
    
    connection.on('close', () => {
        alert('Opponent disconnected');
        showScreen('mode-selection');
    });
}

function handleOpponentMove(data) {
    if (data.type === 'move') {
        const move = chess.move({
            from: data.from,
            to: data.to,
            promotion: data.promotion
        });
        
        if (move) {
            lastMoveSquares = [data.from, data.to];
            updateBoard();
            updateMoveHistory();
            updateCapturedPieces();
            updateStatus();
            checkGameOver();
            isMyTurn = true;
        }
    } else if (data.type === 'resign') {
        showGameOver(`Opponent resigned!`, 'You win!');
    } else if (data.type === 'draw-offer') {
        if (confirm('Opponent offers a draw. Accept?')) {
            connection.send({ type: 'draw-accept' });
            showGameOver('Draw by agreement', 'Game drawn');
        }
    } else if (data.type === 'draw-accept') {
        showGameOver('Draw by agreement', 'Game drawn');
    }
}

function copyGameLink() {
    const linkInput = document.getElementById('game-link');
    linkInput.select();
    document.execCommand('copy');
    
    const btn = document.getElementById('copy-link-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
        btn.textContent = originalText;
    }, 2000);
}

// ==========================================
// GAME INITIALIZATION
// ==========================================

function startGame() {
    chess = new Chess();
    selectedSquare = null;
    moveHistory = [];
    capturedPieces = { white: [], black: [] };
    lastMoveSquares = [];
    isMyTurn = (gameMode === 'online') ? (playerColor === 'white') : true;
    
    createBoard();
    updateBoard();
    updateStatus();
    showScreen('game-screen');
    rotateGameQuote();
}

function createBoard() {
    const board = document.getElementById('chess-board');
    board.innerHTML = '';
    
    for (let rank = 7; rank >= 0; rank--) {
        for (let file = 0; file < 8; file++) {
            const square = document.createElement('div');
            const squareId = String.fromCharCode(97 + file) + (rank + 1);
            
            square.classList.add('square');
            square.classList.add((rank + file) % 2 === 0 ? 'dark' : 'light');
            square.setAttribute('data-square', squareId);
            square.setAttribute('data-file', String.fromCharCode(97 + file));
            square.setAttribute('data-rank', rank + 1);
            
            square.addEventListener('click', () => handleSquareClick(squareId));
            
            board.appendChild(square);
        }
    }
}

// ==========================================
// BOARD RENDERING
// ==========================================

function updateBoard() {
    const board = chess.board();
    
    for (let rank = 7; rank >= 0; rank--) {
        for (let file = 0; file < 8; file++) {
            const squareId = String.fromCharCode(97 + file) + (rank + 1);
            const squareElement = document.querySelector(`[data-square="${squareId}"]`);
            const piece = board[rank][file];
            
            // Clear square
            squareElement.innerHTML = '';
            squareElement.classList.remove('selected', 'legal-move', 'legal-capture', 'check', 'last-move', 'highlight');
            
            // Add piece
            if (piece) {
                const pieceSpan = document.createElement('span');
                pieceSpan.classList.add('piece');
                pieceSpan.textContent = getPieceUnicode(piece);
                squareElement.appendChild(pieceSpan);
            }
            
            // Highlight last move
            if (lastMoveSquares.includes(squareId)) {
                squareElement.classList.add('last-move');
            }
        }
    }
    
    // Highlight king in check
    if (chess.in_check()) {
        const turn = chess.turn();
        const kingSquare = findKingSquare(turn);
        if (kingSquare) {
            document.querySelector(`[data-square="${kingSquare}"]`).classList.add('check');
        }
    }
}

function getPieceUnicode(piece) {
    const unicodePieces = {
        'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚',
        'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔'
    };
    return unicodePieces[piece.type + (piece.color === 'w' ? '' : piece.type.toLowerCase())] || 
           unicodePieces[piece.color === 'w' ? piece.type.toUpperCase() : piece.type];
}

function findKingSquare(color) {
    const board = chess.board();
    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            const piece = board[rank][file];
            if (piece && piece.type === 'k' && piece.color === color) {
                return String.fromCharCode(97 + file) + (rank + 1);
            }
        }
    }
    return null;
}

// ==========================================
// MOVE HANDLING
// ==========================================

function handleSquareClick(squareId) {
    // Check if it's player's turn
    if (gameMode === 'ai' && chess.turn() !== playerColor[0]) return;
    if (gameMode === 'online' && !isMyTurn) return;
    
    const piece = chess.get(squareId);
    
    // If no square selected, select this square if it has a piece of current color
    if (!selectedSquare) {
        if (piece && piece.color === chess.turn()) {
            selectedSquare = squareId;
            highlightSquare(squareId);
            showLegalMoves(squareId);
        }
    } else {
        // Try to make a move
        const move = attemptMove(selectedSquare, squareId);
        
        if (move) {
            lastMoveSquares = [selectedSquare, squareId];
            selectedSquare = null;
            updateBoard();
            updateMoveHistory();
            updateCapturedPieces();
            updateStatus();
            
            // Handle online move
            if (gameMode === 'online' && connection) {
                connection.send({
                    type: 'move',
                    from: move.from,
                    to: move.to,
                    promotion: move.promotion
                });
                isMyTurn = false;
            }
            
            // Check game over
            if (checkGameOver()) return;
            
            // AI move
            if (gameMode === 'ai' && chess.turn() !== playerColor[0]) {
                setTimeout(() => makeAIMove(), 500);
            }
        } else {
            // If clicked on another piece of same color, select it
            if (piece && piece.color === chess.turn()) {
                selectedSquare = squareId;
                updateBoard();
                highlightSquare(squareId);
                showLegalMoves(squareId);
            } else {
                // Deselect
                selectedSquare = null;
                updateBoard();
            }
        }
    }
}

function attemptMove(from, to) {
    // Check for pawn promotion
    const piece = chess.get(from);
    if (piece && piece.type === 'p') {
        const toRank = to[1];
        if ((piece.color === 'w' && toRank === '8') || (piece.color === 'b' && toRank === '1')) {
            return chess.move({
                from: from,
                to: to,
                promotion: 'q' // Auto-promote to queen
            });
        }
    }
    
    return chess.move({
        from: from,
        to: to
    });
}

function highlightSquare(squareId) {
    const squareElement = document.querySelector(`[data-square="${squareId}"]`);
    squareElement.classList.add('selected');
}

function showLegalMoves(squareId) {
    const moves = chess.moves({ square: squareId, verbose: true });
    
    moves.forEach(move => {
        const targetSquare = document.querySelector(`[data-square="${move.to}"]`);
        if (move.captured) {
            targetSquare.classList.add('legal-capture');
        } else {
            targetSquare.classList.add('legal-move');
        }
    });
}

// ==========================================
// GAME STATUS
// ==========================================

function updateStatus() {
    const statusElement = document.getElementById('game-status');
    const turn = chess.turn() === 'w' ? 'White' : 'Black';
    
    if (chess.in_checkmate()) {
        statusElement.querySelector('.status-text').textContent = `Checkmate! ${turn === 'White' ? 'Black' : 'White'} wins!`;
    } else if (chess.in_draw() || chess.in_stalemate() || chess.in_threefold_repetition() || chess.insufficient_material()) {
        statusElement.querySelector('.status-text').textContent = 'Draw!';
    } else if (chess.in_check()) {
        statusElement.querySelector('.status-text').textContent = `${turn} in check!`;
    } else {
        statusElement.querySelector('.status-text').textContent = `${turn} to move`;
    }
}

function checkGameOver() {
    if (chess.in_checkmate()) {
        const winner = chess.turn() === 'w' ? 'Black' : 'White';
        showGameOver('Checkmate!', `${winner} wins!`);
        return true;
    } else if (chess.in_draw()) {
        showGameOver('Draw!', 'Game ended in a draw.');
        return true;
    } else if (chess.in_stalemate()) {
        showGameOver('Stalemate!', 'Game ended in a draw.');
        return true;
    } else if (chess.in_threefold_repetition()) {
        showGameOver('Draw by repetition!', 'Same position occurred three times.');
        return true;
    } else if (chess.insufficient_material()) {
        showGameOver('Draw!', 'Insufficient material to checkmate.');
        return true;
    }
    return false;
}

// ==========================================
// MOVE HISTORY
// ==========================================

function updateMoveHistory() {
    const movesListElement = document.getElementById('moves-list');
    const history = chess.history();
    
    movesListElement.innerHTML = '';
    
    for (let i = 0; i < history.length; i += 2) {
        const movePair = document.createElement('div');
        movePair.classList.add('move-pair');
        
        const moveNumber = document.createElement('span');
        moveNumber.classList.add('move-number');
        moveNumber.textContent = `${Math.floor(i / 2) + 1}.`;
        
        const whiteMove = document.createElement('span');
        whiteMove.classList.add('move-item');
        whiteMove.textContent = history[i];
        
        movePair.appendChild(moveNumber);
        movePair.appendChild(whiteMove);
        
        if (i + 1 < history.length) {
            const blackMove = document.createElement('span');
            blackMove.classList.add('move-item');
            blackMove.textContent = history[i + 1];
            movePair.appendChild(blackMove);
        }
        
        movesListElement.appendChild(movePair);
    }
    
    // Scroll to bottom
    movesListElement.scrollTop = movesListElement.scrollHeight;
}

// ==========================================
// CAPTURED PIECES
// ==========================================

function updateCapturedPieces() {
    const history = chess.history({ verbose: true });
    capturedPieces = { white: [], black: [] };
    
    history.forEach(move => {
        if (move.captured) {
            if (move.color === 'w') {
                capturedPieces.white.push(move.captured);
            } else {
                capturedPieces.black.push(move.captured);
            }
        }
    });
    
    // Display captured pieces
    displayCapturedPieces('white', 'captured-by-player');
    displayCapturedPieces('black', 'captured-by-opponent');
}

function displayCapturedPieces(color, elementId) {
    const element = document.getElementById(elementId);
    const pieces = color === 'white' ? capturedPieces.white : capturedPieces.black;
    
    element.innerHTML = '';
    
    const sortOrder = { 'q': 1, 'r': 2, 'b': 3, 'n': 4, 'p': 5 };
    pieces.sort((a, b) => sortOrder[a] - sortOrder[b]);
    
    pieces.forEach(piece => {
        const pieceSpan = document.createElement('span');
        pieceSpan.textContent = getPieceUnicode({ type: piece, color: color[0] });
        element.appendChild(pieceSpan);
    });
}

// ==========================================
// GAME CONTROLS
// ==========================================

function resignGame() {
    if (confirm('Are you sure you want to resign?')) {
        if (gameMode === 'online' && connection) {
            connection.send({ type: 'resign' });
        }
        showGameOver('You resigned', 'Better luck next time!');
    }
}

function offerDraw() {
    if (gameMode === 'online' && connection) {
        connection.send({ type: 'draw-offer' });
        alert('Draw offer sent to opponent');
    } else if (gameMode === 'local') {
        if (confirm('Agree to a draw?')) {
            showGameOver('Draw by agreement', 'Game drawn');
        }
    } else {
        alert('Cannot offer draw in AI mode');
    }
}

function startNewGame() {
    if (gameMode === 'ai') {
        startAIGame();
    } else if (gameMode === 'local') {
        startLocalGame();
    } else if (gameMode === 'online') {
        // Can't restart online game, return to menu
        showScreen('mode-selection');
    }
}

// ==========================================
// MODAL
// ==========================================

function showGameOver(title, message) {
    document.getElementById('game-over-title').textContent = title;
    document.getElementById('game-over-message').textContent = message;
    document.getElementById('game-over-modal').classList.remove('hidden');
}

function hideModal() {
    document.getElementById('game-over-modal').classList.add('hidden');
}

// ==========================================
// QUOTES ROTATION
// ==========================================

function rotateQuotes() {
    const quoteElement = document.getElementById('rotating-quote');
    const randomQuote = dostoevsky_quotes[Math.floor(Math.random() * dostoevsky_quotes.length)];
    
    quoteElement.style.opacity = '0';
    setTimeout(() => {
        quoteElement.textContent = randomQuote;
        quoteElement.style.opacity = '1';
    }, 500);
}

function rotateGameQuote() {
    const quoteElement = document.getElementById('game-quote');
    const randomQuote = game_quotes[Math.floor(Math.random() * game_quotes.length)];
    
    if (quoteElement) {
        quoteElement.textContent = randomQuote;
    }
}

// ==========================================
// URL PARAMETER HANDLING (for joining games)
// ==========================================

window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameParam = urlParams.get('game');
    
    if (gameParam) {
        // Auto-fill game ID and show online setup
        document.getElementById('game-id-input').value = gameParam;
        selectMode('online');
    }
});
