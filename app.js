// Game state
let game = null;
let board = null;
let gameMode = null;
let currentPlayer = 'white';
let stockfish = null;
let aiDifficulty = 2;
let boardTheme = 'classic';
let moveHistory = [];
let peer = null;
let isHost = false;
let roomCode = null;
let dataChannel = null;
let aiThinking = false;

// Dostoevsky quotes
const quotes = [
    "The mystery of human existence lies not in just staying alive, but in finding something to live for.",
    "Pain and suffering are always inevitable for a large intelligence and a deep heart.",
    "The soul is healed by being with children.",
    "To live without hope is to cease to live.",
    "Man is a mystery. It needs to be unravelled, and if you spend your whole life unravelling it, don't say that you've wasted time.",
    "The darker the night, the brighter the stars, the deeper the grief, the closer is God!",
    "Taking a new step, uttering a new word, is what people fear most.",
    "Above all, don't lie to yourself. The man who lies to himself and listens to his own lie comes to a point that he cannot distinguish the truth within him.",
    "The degree of civilization in a society can be judged by entering its prisons.",
    "It is not the brains that matter most, but that which guides them — the character, the heart, generous qualities, progressive ideas."
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    updateQuote();
    setInterval(updateQuote, 30000); // Update quote every 30 seconds
    setupKeyboardShortcuts();
});

// Keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Don't trigger shortcuts when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Ctrl/Cmd + Z: Undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            if (game && game.history().length > 0) {
                undoMove();
            }
        }
        
        // Ctrl/Cmd + R: Reset
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            if (game) {
                resetGame();
            }
        }
        
        // F: Flip board
        if (e.key === 'f' || e.key === 'F') {
            e.preventDefault();
            if (board) {
                flipBoard();
            }
        }
        
        // Escape: Return to menu
        if (e.key === 'Escape') {
            if (!document.getElementById('mainMenu').classList.contains('hidden')) {
                return; // Already on main menu
            }
            if (confirm('Return to main menu? Current game will be lost.')) {
                showMainMenu();
            }
        }
    });
}

function initializeGame() {
    // Load settings
    const savedDifficulty = localStorage.getItem('aiDifficulty');
    const savedTheme = localStorage.getItem('boardTheme');
    if (savedDifficulty) aiDifficulty = parseInt(savedDifficulty);
    if (savedTheme) boardTheme = savedTheme;
    
    document.getElementById('aiDifficulty').value = aiDifficulty;
    document.getElementById('boardTheme').value = boardTheme;
}

function updateQuote() {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('quoteText').textContent = `"${randomQuote}"`;
}

// Menu Navigation
function showMainMenu() {
    hideAllScreens();
    document.getElementById('mainMenu').classList.remove('hidden');
    
    // Clean up connections
    if (peerConnection) {
        peerConnection.destroy();
        peerConnection = null;
    }
    dataChannel = null;
    
    // Reset game state
    if (game) {
        game = null;
        moveHistory = [];
    }
    if (board) {
        board.destroy();
        board = null;
    }
    if (stockfish) {
        stockfish.terminate();
        stockfish = null;
    }
    
    // Hide room code display
    document.getElementById('roomCodeDisplay').classList.add('hidden');
}

function showModeSelection() {
    hideAllScreens();
    document.getElementById('modeSelection').classList.remove('hidden');
}

function showJoinRoom() {
    hideAllScreens();
    document.getElementById('joinRoom').classList.remove('hidden');
    document.getElementById('roomCodeInput').focus();
}

function showSettings() {
    hideAllScreens();
    document.getElementById('settings').classList.remove('hidden');
}

function hideAllScreens() {
    document.querySelectorAll('.menu-screen, .game-screen').forEach(screen => {
        screen.classList.add('hidden');
    });
}

// Game Modes
function startGame(mode) {
    gameMode = mode;
    hideAllScreens();
    document.getElementById('gameScreen').classList.remove('hidden');
    
    // Initialize chess game
    game = new Chess();
    moveHistory = [];
    
    // Set player names
    if (mode === 'ai') {
        document.getElementById('whitePlayer').textContent = 'You';
        document.getElementById('blackPlayer').textContent = 'Stockfish AI';
        currentPlayer = 'white';
    } else if (mode === 'local') {
        document.getElementById('whitePlayer').textContent = 'Player 1';
        document.getElementById('blackPlayer').textContent = 'Player 2';
        currentPlayer = 'white';
    } else if (mode === 'online') {
        createOnlineRoom();
        return;
    }
    
    initializeBoard();
    updateGameStatus();
}

function createOnlineRoom() {
    // Generate room code
    roomCode = generateRoomCode();
    isHost = true;
    
    document.getElementById('whitePlayer').textContent = 'You (Host)';
    document.getElementById('blackPlayer').textContent = 'Waiting for opponent...';
    document.getElementById('roomCodeDisplay').classList.remove('hidden');
    document.getElementById('roomCodeText').textContent = roomCode;
    
    // Initialize WebRTC as host
    initializeWebRTC(true);
    
    initializeBoard();
    updateGameStatus();
}

function joinRoom() {
    const code = document.getElementById('roomCodeInput').value.toUpperCase().trim();
    if (code.length !== 6) {
        alert('Please enter a valid 6-character room code');
        return;
    }
    
    // Validate room code format (alphanumeric)
    if (!/^[A-Z0-9]{6}$/.test(code)) {
        alert('Room code must contain only letters and numbers');
        return;
    }
    
    roomCode = code;
    isHost = false;
    
    document.getElementById('whitePlayer').textContent = 'Waiting for host...';
    document.getElementById('blackPlayer').textContent = 'You';
    document.getElementById('roomCodeDisplay').classList.remove('hidden');
    document.getElementById('roomCodeText').textContent = roomCode;
    
    hideAllScreens();
    document.getElementById('gameScreen').classList.remove('hidden');
    
    // Initialize WebRTC as client
    initializeWebRTC(false);
    
    // Initialize game (will be synced when connection is established)
    game = new Chess();
    moveHistory = [];
    initializeBoard();
    updateGameStatus('Connecting to room...');
}

function generateRoomCode() {
    // Generate a 6-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function copyRoomCode() {
    navigator.clipboard.writeText(roomCode).then(() => {
        alert('Room code copied to clipboard!');
    });
}

// Chess Board Initialization
function initializeBoard() {
    const boardConfig = {
        position: 'start',
        draggable: true,
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd,
        pieceTheme: 'https://cdn.jsdelivr.net/npm/chessboardjs@1.0.0/img/chesspieces/wikipedia/{piece}.png',
        orientation: currentPlayer === 'white' ? 'white' : 'black'
    };
    
    board = Chessboard('chessboard', boardConfig);
    updateMoveHistory();
}

function onDragStart(source, piece, position, orientation) {
    // Prevent moving if it's not the player's turn
    if (gameMode === 'ai' && game.turn() === 'b') {
        return false;
    }
    
    if (gameMode === 'local' || gameMode === 'online') {
        const pieceColor = piece[0];
        const currentTurn = game.turn() === 'w' ? 'white' : 'black';
        
        // In online mode, check if it's your turn
        if (gameMode === 'online') {
            const isWhiteTurn = game.turn() === 'w';
            const isHostWhite = isHost;
            // Host plays white, client plays black
            if ((isHostWhite && !isWhiteTurn) || (!isHostWhite && isWhiteTurn)) {
                return false;
            }
        }
        
        if ((pieceColor === 'w' && currentTurn !== 'white') || 
            (pieceColor === 'b' && currentTurn !== 'black')) {
            return false;
        }
    }
    
    // Don't allow moving if game is over
    if (game.isGameOver()) {
        return false;
    }
    
    // In online mode, check if connected
    if (gameMode === 'online' && (!dataChannel || !dataChannel.open)) {
        return false;
    }
}

function onDrop(source, target) {
    // Make the move
    const move = game.move({
        from: source,
        to: target,
        promotion: 'q' // Always promote to queen for simplicity
    });
    
    // If move is illegal, snapback
    if (move === null) {
        return 'snapback';
    }
    
    // Add to move history
    moveHistory.push({
        move: move,
        notation: game.history({ verbose: true })[game.history().length - 1]
    });
    
    updateMoveHistory();
    updateGameStatus();
    
    // Send move to opponent if online
    if (gameMode === 'online' && dataChannel && dataChannel.open) {
        try {
            dataChannel.send(JSON.stringify({
                type: 'move',
                from: source,
                to: target,
                promotion: move.promotion || 'q'
            }));
        } catch (e) {
            console.error('Error sending move:', e);
        }
    }
    
    // If AI mode and it's AI's turn, make AI move
    if (gameMode === 'ai' && game.turn() === 'b' && !game.isGameOver()) {
        aiThinking = true;
        updateGameStatus('AI is thinking...');
        setTimeout(() => makeAIMove(), 500);
    }
    
    return true;
}

function onSnapEnd() {
    board.position(game.fen());
}

function makeAIMove() {
    if (!stockfish) {
        initializeStockfish();
    }
    
    if (!stockfish) {
        // Fallback AI if Stockfish fails
        makeSimpleAIMove();
        return;
    }
    
    stockfish.postMessage('position fen ' + game.fen());
    stockfish.postMessage('go depth ' + aiDifficulty);
}

function initializeStockfish() {
    // Initialize Stockfish as a Web Worker
    try {
        // Use Stockfish.js from a reliable CDN
        // Using unpkg CDN for Stockfish
        stockfish = new Worker('https://unpkg.com/stockfish.js@10.0.0/src/stockfish.js');
        stockfish.onmessage = handleStockfishMessage;
        
        // Configure Stockfish
        stockfish.postMessage('uci');
        stockfish.postMessage('ucinewgame');
    } catch (e) {
        // Fallback: Use a simpler AI if Stockfish fails
        console.error('Stockfish initialization failed, using fallback AI', e);
        stockfish = null;
        setTimeout(() => makeSimpleAIMove(), 500);
        return;
    }
}

function handleStockfishMessage(event) {
    const message = event.data || event;
    
    if (typeof message === 'string' && message.includes('bestmove')) {
        const bestMove = message.split('bestmove ')[1].split(' ')[0];
        if (bestMove && bestMove !== 'null' && bestMove.length >= 4) {
            const from = bestMove.substring(0, 2);
            const to = bestMove.substring(2, 4);
            const promotion = bestMove.length > 4 ? bestMove[4] : null;
            
            const move = game.move({
                from: from,
                to: to,
                promotion: promotion || 'q'
            });
            
            if (move) {
                aiThinking = false;
                moveHistory.push({
                    move: move,
                    notation: game.history({ verbose: true })[game.history().length - 1]
                });
                
                board.position(game.fen());
                updateMoveHistory();
                updateGameStatus();
            }
        }
    }
}

// Fallback simple AI if Stockfish fails
function makeSimpleAIMove() {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) {
        aiThinking = false;
        return;
    }
    
    // Add a small delay to simulate thinking
    setTimeout(() => {
        // Simple AI: prioritize captures, then checks, then random
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (const move of moves) {
            let score = 0;
            
            // Prioritize captures
            if (move.captured) {
                const pieceValues = { 'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0 };
                score += pieceValues[move.captured] || 0;
            }
            
            // Prioritize checks
            game.move(move);
            if (game.inCheck()) {
                score += 5;
            }
            game.undo();
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        // If no good move found, pick random
        if (!bestMove) {
            bestMove = moves[Math.floor(Math.random() * moves.length)];
        }
        
        const move = game.move(bestMove);
        if (move) {
            aiThinking = false;
            moveHistory.push({
                move: move,
                notation: game.history({ verbose: true })[game.history().length - 1]
            });
            
            board.position(game.fen());
            updateMoveHistory();
            updateGameStatus();
        }
    }, 800 + Math.random() * 500); // Random delay between 800-1300ms
}

// WebRTC for Online Multiplayer using PeerJS
let peerConnection = null;
let peerId = null;

function initializeWebRTC(isHosting) {
    if (typeof Peer === 'undefined') {
        alert('PeerJS library failed to load. Please refresh the page.');
        return;
    }
    
    try {
        if (isHosting) {
            // Host creates a peer with the room code as ID
            peerConnection = new Peer(roomCode, {
                host: '0.peerjs.com',
                port: 443,
                path: '/',
                secure: true
            });
            
            peerConnection.on('open', (id) => {
                console.log('Host peer ID:', id);
                document.getElementById('blackPlayer').textContent = 'Waiting for opponent...';
                updateGameStatus('Waiting for opponent to join...');
            });
            
            peerConnection.on('connection', (conn) => {
                dataChannel = conn;
                dataChannel.on('open', () => {
                    document.getElementById('blackPlayer').textContent = 'Opponent';
                    updateGameStatus('Opponent connected! White to move.');
                    
                    // Send initial game state
                    try {
                        dataChannel.send(JSON.stringify({
                            type: 'init',
                            fen: game.fen(),
                            history: game.history()
                        }));
                    } catch (e) {
                        console.error('Error sending init:', e);
                    }
                });
                
                dataChannel.on('data', handlePeerData);
                dataChannel.on('close', () => {
                    updateGameStatus('Opponent disconnected');
                    dataChannel = null;
                });
                dataChannel.on('error', (err) => {
                    console.error('Data channel error:', err);
                });
            });
            
            peerConnection.on('error', (err) => {
                console.error('PeerJS error:', err);
                if (err.type === 'peer-unavailable') {
                    // Room code might be taken, generate new one
                    roomCode = generateRoomCode();
                    document.getElementById('roomCodeText').textContent = roomCode;
                    initializeWebRTC(true);
                }
            });
        } else {
            // Client connects to host's peer ID
            peerConnection = new Peer({
                host: '0.peerjs.com',
                port: 443,
                path: '/',
                secure: true
            });
            
            peerConnection.on('open', (id) => {
                console.log('Client peer ID:', id);
                // Connect to host
                dataChannel = peerConnection.connect(roomCode);
                
                dataChannel.on('open', () => {
                    document.getElementById('whitePlayer').textContent = 'Opponent';
                    document.getElementById('blackPlayer').textContent = 'You';
                    updateGameStatus('Connected! Waiting for host to start...');
                });
                
                dataChannel.on('data', handlePeerData);
                dataChannel.on('close', () => {
                    updateGameStatus('Host disconnected');
                    dataChannel = null;
                });
                dataChannel.on('error', (err) => {
                    console.error('Data channel error:', err);
                });
            });
            
            peerConnection.on('error', (err) => {
                console.error('PeerJS error:', err);
                if (err.type === 'peer-unavailable') {
                    alert('Room not found. Please check the room code.');
                }
            });
        }
    } catch (e) {
        console.error('WebRTC initialization failed:', e);
        alert('Failed to initialize online multiplayer. Please try again or use local multiplayer.');
    }
}

function handlePeerData(data) {
    try {
        const message = JSON.parse(data);
        
        switch (message.type) {
            case 'init':
                // Initialize game state from host
                game = new Chess(message.fen);
                board.position(message.fen);
                updateMoveHistory();
                updateGameStatus();
                break;
                
            case 'move':
                // Apply opponent's move
                const move = game.move({
                    from: message.from,
                    to: message.to,
                    promotion: message.promotion || 'q'
                });
                
                if (move) {
                    moveHistory.push({
                        move: move,
                        notation: game.history({ verbose: true })[game.history().length - 1]
                    });
                    
                    board.position(game.fen());
                    updateMoveHistory();
                    updateGameStatus();
                }
                break;
                
            case 'undo':
                if (game.history().length > 0) {
                    game.undo();
                    moveHistory.pop();
                    board.position(game.fen());
                    updateMoveHistory();
                    updateGameStatus();
                }
                break;
                
            case 'reset':
                game = new Chess();
                moveHistory = [];
                board.position('start');
                updateMoveHistory();
                updateGameStatus();
                break;
        }
    } catch (e) {
        console.error('Error handling peer data:', e);
    }
}

// Game Controls
function undoMove() {
    if (game.history().length === 0) return;
    
    game.undo();
    moveHistory.pop();
    board.position(game.fen());
    updateMoveHistory();
    updateGameStatus();
    
    if (gameMode === 'online' && dataChannel && dataChannel.open) {
        dataChannel.send(JSON.stringify({ type: 'undo' }));
    }
}

function resetGame() {
    if (confirm('Are you sure you want to reset the game?')) {
        game = new Chess();
        moveHistory = [];
        board.position('start');
        updateMoveHistory();
        updateGameStatus();
        
        if (gameMode === 'online' && dataChannel && dataChannel.open) {
            dataChannel.send(JSON.stringify({ type: 'reset' }));
        }
    }
}

function flipBoard() {
    if (board) {
        board.flip();
    }
}

function shareGame() {
    if (!game) return;
    
    const gameState = {
        fen: game.fen(),
        history: game.history(),
        mode: gameMode,
        roomCode: roomCode || null
    };
    
    const shareText = `Chess Game State:\nFEN: ${gameState.fen}\nMoves: ${gameState.history.join(', ')}\n${roomCode ? `Room Code: ${roomCode}` : ''}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Chess Game State',
            text: shareText
        }).catch(err => {
            console.log('Error sharing:', err);
            copyToClipboard(shareText);
        });
    } else {
        copyToClipboard(shareText);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const statusDiv = document.getElementById('gameStatus');
        const originalText = statusDiv.textContent;
        statusDiv.textContent = 'Game state copied to clipboard!';
        statusDiv.style.color = '#4ade80';
        setTimeout(() => {
            updateGameStatus();
        }, 2000);
    }).catch(err => {
        alert('Failed to copy to clipboard. Please copy manually:\n\n' + text);
    });
}

function updateMoveHistory() {
    const moveList = document.getElementById('moveHistory');
    moveList.innerHTML = '';
    
    const history = game.history({ verbose: true });
    for (let i = 0; i < history.length; i += 2) {
        const moveNumber = Math.floor(i / 2) + 1;
        const whiteMove = history[i];
        const blackMove = history[i + 1];
        
        const moveDiv = document.createElement('div');
        moveDiv.innerHTML = `
            <strong>${moveNumber}.</strong> 
            ${whiteMove ? whiteMove.san : ''} 
            ${blackMove ? blackMove.san : ''}
        `;
        moveList.appendChild(moveDiv);
    }
}

function updateGameStatus(customMessage) {
    const statusDiv = document.getElementById('gameStatus');
    
    if (customMessage) {
        statusDiv.textContent = customMessage;
        statusDiv.style.color = 'var(--accent-gold)';
        return;
    }
    
    if (!game) return;
    
    if (game.isCheckmate()) {
        const winner = game.turn() === 'w' ? 'Black' : 'White';
        statusDiv.textContent = `Checkmate! ${winner} wins!`;
        statusDiv.style.color = '#ff6b6b';
    } else if (game.isDraw()) {
        statusDiv.textContent = 'Draw!';
        statusDiv.style.color = '#ffd93d';
    } else if (game.isStalemate()) {
        statusDiv.textContent = 'Stalemate!';
        statusDiv.style.color = '#ffd93d';
    } else if (game.isCheck()) {
        const player = game.turn() === 'w' ? 'White' : 'Black';
        statusDiv.textContent = `${player} is in check!`;
        statusDiv.style.color = '#ff6b6b';
    } else {
        const player = game.turn() === 'w' ? 'White' : 'Black';
        statusDiv.textContent = `${player}'s turn`;
        statusDiv.style.color = 'var(--accent-gold)';
    }
}

// Settings
document.getElementById('aiDifficulty').addEventListener('change', (e) => {
    aiDifficulty = parseInt(e.target.value);
    localStorage.setItem('aiDifficulty', aiDifficulty);
});

document.getElementById('boardTheme').addEventListener('change', (e) => {
    boardTheme = e.target.value;
    localStorage.setItem('boardTheme', boardTheme);
    applyBoardTheme();
});

function applyBoardTheme() {
    const root = document.documentElement;
    if (boardTheme === 'dark') {
        root.style.setProperty('--board-light', '#8b7355');
        root.style.setProperty('--board-dark', '#5a4a3a');
    } else if (boardTheme === 'sepia') {
        root.style.setProperty('--board-light', '#d4c4a8');
        root.style.setProperty('--board-dark', '#8b7355');
    } else {
        root.style.setProperty('--board-light', '#f0d9b5');
        root.style.setProperty('--board-dark', '#b58863');
    }
}

// Apply theme on load
applyBoardTheme();
