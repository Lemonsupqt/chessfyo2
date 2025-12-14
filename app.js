// Main application logic

let chessGame = null;
let multiplayer = null;
let stockfish = null;
let currentMode = null;
let moveHistory = [];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    chessGame = new ChessGame();
    multiplayer = new SimpleMultiplayer();
    
    setupEventListeners();
    initializeStockfish();
});

function setupEventListeners() {
    // Game mode buttons
    document.getElementById('localMode').addEventListener('click', () => startLocalGame());
    document.getElementById('onlineMode').addEventListener('click', () => startOnlineGame());
    document.getElementById('aiMode').addEventListener('click', () => startAIGame());
    document.getElementById('practiceMode').addEventListener('click', () => startPracticeGame());

    // Game control buttons
    document.getElementById('newGameBtn').addEventListener('click', () => newGame());
    document.getElementById('resignBtn').addEventListener('click', () => resign());
    document.getElementById('offerDrawBtn').addEventListener('click', () => offerDraw());
    document.getElementById('shareBtn').addEventListener('click', () => shareGame());

    // Online settings
    document.getElementById('copyLinkBtn').addEventListener('click', () => copyShareLink());

    // Modal
    document.getElementById('modalClose').addEventListener('click', () => closeModal());

    // Chess game callbacks
    chessGame.setOnMove((move) => {
        handleMove(move);
    });

    chessGame.setOnGameOver((result) => {
        handleGameOver(result);
    });

    // Multiplayer callbacks
    multiplayer.setOnMessage((message) => {
        handleMultiplayerMessage(message);
    });
}

function initializeStockfish() {
    try {
        // Use Stockfish.js from CDN as a Worker
        if (typeof Worker !== 'undefined') {
            stockfish = new Worker('https://cdn.jsdelivr.net/npm/stockfish.js@16.0.0/stockfish.js');
            
            let stockfishReady = false;
            
            stockfish.onmessage = (event) => {
                const message = event.data;
                
                if (message === 'uciok') {
                    stockfishReady = true;
                }
                
                if (message.startsWith('bestmove')) {
                    const parts = message.split(' ');
                    if (parts.length > 1 && parts[1] !== 'none') {
                        const move = parts[1];
                        const from = move.substring(0, 2);
                        const to = move.substring(2, 4);
                        const promotion = move.length > 4 ? move.substring(4, 5) : 'q';
                        
                        setTimeout(() => {
                            if (chessGame && currentMode === 'ai' && stockfishReady) {
                                const result = chessGame.makeMove(from, to, promotion);
                                if (!result) {
                                    // If move fails, try making it from notation
                                    chessGame.makeMoveFromNotation(move);
                                }
                            }
                        }, 300);
                    }
                }
            };

            stockfish.postMessage('uci');
            stockfish.postMessage('isready');
        }
    } catch (e) {
        console.error('Failed to initialize Stockfish:', e);
    }
}

function startLocalGame() {
    currentMode = 'local';
    chessGame.setPlayerColor('white');
    chessGame.init(document.getElementById('chessboard'));
    chessGame.reset();
    
    document.getElementById('gameContainer').classList.remove('hidden');
    document.getElementById('aiSettings').classList.add('hidden');
    document.getElementById('onlineSettings').classList.add('hidden');
    
    updatePlayerNames('Player 1 (White)', 'Player 2 (Black)');
    updateGameStatus('White to move');
    moveHistory = [];
    updateMoveHistory();
}

function startOnlineGame() {
    currentMode = 'online';
    
    // Check if joining existing room from URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    
    if (roomId) {
        // Joining existing room
        if (multiplayer.joinRoom(roomId)) {
            chessGame.setPlayerColor('black');
            document.getElementById('shareLink').value = window.location.href;
            document.getElementById('connectionStatus').textContent = 'Connected! Waiting for host...';
            document.getElementById('connectionStatus').classList.add('connected');
            updatePlayerNames('Opponent (White)', 'You (Black)');
            updateGameStatus('Waiting for opponent...');
        } else {
            alert('Could not join room. Please check the link.');
            return;
        }
    } else {
        // Creating new room
        const roomData = multiplayer.createRoom();
        const shareUrl = `${window.location.origin}${window.location.pathname}?room=${roomData}`;
        document.getElementById('shareLink').value = shareUrl;
        document.getElementById('connectionStatus').textContent = 'Waiting for opponent...';
        document.getElementById('connectionStatus').classList.remove('connected');
        chessGame.setPlayerColor('white');
        updatePlayerNames('You (White)', 'Opponent (Black)');
        updateGameStatus('Share the link above with your friend');
        
        // Update URL
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('room', roomData);
        window.history.pushState({}, '', newUrl);
    }
    
    document.getElementById('gameContainer').classList.remove('hidden');
    document.getElementById('aiSettings').classList.add('hidden');
    document.getElementById('onlineSettings').classList.remove('hidden');
    
    chessGame.init(document.getElementById('chessboard'));
    chessGame.reset();
    
    moveHistory = [];
    updateMoveHistory();
}

function joinRoom(roomId) {
    if (multiplayer.joinRoom(roomId)) {
        chessGame.setPlayerColor('black');
        document.getElementById('connectionStatus').textContent = 'Connected! Waiting for opponent...';
        document.getElementById('connectionStatus').classList.add('connected');
        updatePlayerNames('Opponent (White)', 'You (Black)');
        updateGameStatus('Opponent to move');
        
        // Update URL without reload
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('room', roomId);
        window.history.pushState({}, '', newUrl);
    } else {
        document.getElementById('connectionStatus').textContent = 'Failed to join room. Please check the link.';
        document.getElementById('connectionStatus').classList.remove('connected');
    }
}

function startAIGame() {
    currentMode = 'ai';
    chessGame.setPlayerColor('white');
    chessGame.init(document.getElementById('chessboard'));
    chessGame.reset();
    
    document.getElementById('gameContainer').classList.remove('hidden');
    document.getElementById('aiSettings').classList.remove('hidden');
    document.getElementById('onlineSettings').classList.add('hidden');
    
    updatePlayerNames('You (White)', 'Stockfish (Black)');
    updateGameStatus('Your move');
    moveHistory = [];
    updateMoveHistory();
    
    setStockfishLevel(5);
}

function startPracticeGame() {
    currentMode = 'practice';
    chessGame.setPlayerColor('white');
    chessGame.init(document.getElementById('chessboard'));
    chessGame.reset();
    
    document.getElementById('gameContainer').classList.remove('hidden');
    document.getElementById('aiSettings').classList.add('hidden');
    document.getElementById('onlineSettings').classList.add('hidden');
    
    updatePlayerNames('Practice Mode', '');
    updateGameStatus('Practice - Take your time');
    moveHistory = [];
    updateMoveHistory();
}

function setStockfishLevel(level) {
    if (stockfish) {
        // Set skill level (0-20, where 20 is strongest)
        stockfish.postMessage(`setoption name Skill Level value ${level}`);
        // Set depth for stronger play
        const depth = Math.min(5 + Math.floor(level / 4), 15);
        stockfish.postMessage(`setoption name UCI_LimitStrength value false`);
        stockfish.postMessage('ucinewgame');
    }
}

document.getElementById('aiDifficulty').addEventListener('change', (e) => {
    if (currentMode === 'ai' && stockfish) {
        setStockfishLevel(parseInt(e.target.value));
    }
});

function handleMove(move) {
    moveHistory.push(move);
    updateMoveHistory();
    
    const turn = chessGame.getTurn();
    updateGameStatus(turn === 'w' ? 'White to move' : 'Black to move');

    // Send move in online mode
    if (currentMode === 'online') {
        multiplayer.sendMove({
            from: move.from,
            to: move.to,
            san: move.san,
            promotion: move.promotion
        });
        document.getElementById('connectionStatus').textContent = 'Move sent. Waiting for opponent...';
        document.getElementById('connectionStatus').classList.remove('connected');
    }

    // AI move in AI mode
    if (currentMode === 'ai' && turn === 'b' && stockfish) {
        updateGameStatus('AI is thinking...');
        setTimeout(() => {
            const fen = chessGame.getFEN();
            const difficulty = parseInt(document.getElementById('aiDifficulty').value) || 5;
            const depth = Math.min(5 + Math.floor(difficulty / 4), 15);
            stockfish.postMessage(`position fen ${fen}`);
            stockfish.postMessage(`go depth ${depth}`);
        }, 100);
    }
}

function handleMultiplayerMessage(message) {
    if (message.type === 'move') {
        const move = message.move;
        // Try to make the move using the move object
        let moveMade = false;
        if (move.from && move.to) {
            moveMade = chessGame.makeMove(move.from, move.to, move.promotion || 'q');
        }
        if (!moveMade && move.san) {
            moveMade = chessGame.makeMoveFromNotation(move.san);
        }
        
        if (moveMade) {
            const turn = chessGame.getTurn();
            updateGameStatus(turn === 'w' ? 'White to move' : 'Black to move');
            document.getElementById('connectionStatus').textContent = 'Connected';
            document.getElementById('connectionStatus').classList.add('connected');
        }
    }
}

function handleGameOver(result) {
    let message = '';
    let title = 'Game Over';

    if (result.type === 'checkmate') {
        title = 'Checkmate!';
        message = `${result.winner === 'white' ? 'White' : 'Black'} wins by checkmate!`;
    } else if (result.type === 'stalemate') {
        title = 'Stalemate';
        message = 'The game ends in a draw by stalemate.';
    } else if (result.type === 'threefold') {
        title = 'Draw';
        message = 'The game ends in a draw by threefold repetition.';
    } else if (result.type === 'insufficient') {
        title = 'Draw';
        message = 'The game ends in a draw due to insufficient material.';
    } else if (result.type === 'fifty-move') {
        title = 'Draw';
        message = 'The game ends in a draw by the fifty-move rule.';
    } else {
        title = 'Draw';
        message = 'The game ends in a draw.';
    }

    showModal(title, message);
}

function updatePlayerNames(whiteName, blackName) {
    document.getElementById('whitePlayer').textContent = whiteName;
    document.getElementById('blackPlayer').textContent = blackName;
}

function updateGameStatus(status) {
    document.getElementById('gameStatus').textContent = status;
}

function updateMoveHistory() {
    const moveList = document.getElementById('moveList');
    moveList.innerHTML = '';

    for (let i = 0; i < moveHistory.length; i += 2) {
        const moveNumber = Math.floor(i / 2) + 1;
        const whiteMove = moveHistory[i];
        const blackMove = moveHistory[i + 1];

        const moveItem = document.createElement('div');
        moveItem.className = 'move-item';
        moveItem.textContent = `${moveNumber}. ${whiteMove.san}${blackMove ? ' ' + blackMove.san : ''}`;
        moveList.appendChild(moveItem);
    }
}

function newGame() {
    if (currentMode === 'online') {
        multiplayer.disconnect();
    }
    
    if (currentMode === 'local') {
        startLocalGame();
    } else if (currentMode === 'online') {
        startOnlineGame();
    } else if (currentMode === 'ai') {
        startAIGame();
    } else if (currentMode === 'practice') {
        startPracticeGame();
    }
}

function resign() {
    const currentTurn = chessGame.getTurn();
    const winner = currentTurn === 'w' ? 'black' : 'white';
    showModal('Resignation', `${winner === 'white' ? 'White' : 'Black'} wins by resignation.`);
}

function offerDraw() {
    showModal('Draw Offered', 'Draw offer sent. Waiting for opponent response...');
}

function shareGame() {
    if (currentMode === 'online') {
        copyShareLink();
    } else {
        const pgn = chessGame.getPGN();
        const shareText = `Check out this chess game:\n\n${pgn}\n\nPlay at: ${window.location.href}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Chess Game',
                text: shareText
            });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                showModal('Shared!', 'Game PGN copied to clipboard!');
            });
        }
    }
}

function copyShareLink() {
    const shareLink = document.getElementById('shareLink');
    shareLink.select();
    document.execCommand('copy');
    showModal('Link Copied!', 'Share this link with your friend to start playing.');
}

function showModal(title, message) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

// Handle room joining from URL
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    if (roomId) {
        // Auto-start online mode if room ID is in URL
        setTimeout(() => {
            startOnlineGame();
            setTimeout(() => {
                joinRoom(roomId);
            }, 100);
        }, 100);
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (multiplayer) {
        multiplayer.disconnect();
    }
    if (stockfish) {
        stockfish.terminate();
    }
});
