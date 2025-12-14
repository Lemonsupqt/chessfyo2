// Main application logic
let chessGame;
let multiplayerManager;
let currentGameMode = null;
let currentRoomId = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    chessGame = new ChessGame();
    multiplayerManager = new MultiplayerManager();
    
    setupEventListeners();
    showMainMenu();
});

function setupEventListeners() {
    // Set up multiplayer callbacks
    multiplayerManager.onMoveCallback = (move) => {
        chessGame.makeMove(move.from, move.to, move.promotion);
    };

    multiplayerManager.onConnectionCallback = () => {
        updateGameStatus('Connected! Game starting...');
    };

    multiplayerManager.onDisconnectionCallback = () => {
        updateGameStatus('Connection lost. Reconnecting...');
    };

    // Set up chess game callbacks
    chessGame.onMoveCallback = (move) => {
        if (currentGameMode === 'online' && multiplayerManager.dataChannel) {
            multiplayerManager.sendMove({
                from: move.from,
                to: move.to,
                promotion: move.promotion
            });
        }
    };
}

function showMainMenu() {
    document.getElementById('mainMenu').classList.remove('hidden');
    document.getElementById('onlineScreen').classList.add('hidden');
    document.getElementById('gameContainer').classList.add('hidden');
    currentGameMode = null;
}

function showGameMode(mode) {
    if (mode === 'online') {
        showOnlineScreen();
    } else {
        startGame(mode);
    }
}

function showOnlineScreen() {
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('onlineScreen').classList.remove('hidden');
    document.getElementById('gameContainer').classList.add('hidden');
}

function startGame(mode) {
    currentGameMode = mode;
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('onlineScreen').classList.add('hidden');
    document.getElementById('gameContainer').classList.remove('hidden');

    // Initialize board if not already done
    if (!chessGame.board) {
        try {
            chessGame.initBoard('chessboard');
        } catch (error) {
            console.error('Error initializing board:', error);
            alert('Failed to initialize chess board. Please refresh the page.');
            return;
        }
    }

    chessGame.setGameMode(mode);
    chessGame.reset();

    // Update player names based on mode
    const whitePlayerEl = document.getElementById('whitePlayer');
    const blackPlayerEl = document.getElementById('blackPlayer');

    switch (mode) {
        case 'local':
            whitePlayerEl.textContent = 'Player 1';
            blackPlayerEl.textContent = 'Player 2';
            updateGameStatus('White to move');
            break;
        case 'ai':
            whitePlayerEl.textContent = 'You';
            blackPlayerEl.textContent = 'Stockfish';
            updateGameStatus('Your turn - White to move');
            break;
        case 'online':
            whitePlayerEl.textContent = 'You';
            blackPlayerEl.textContent = 'Opponent';
            updateGameStatus('Connecting...');
            break;
        case 'analysis':
            whitePlayerEl.textContent = 'Analysis';
            blackPlayerEl.textContent = 'Mode';
            updateGameStatus('Analysis mode - explore freely');
            break;
    }
}

async function createRoom() {
    try {
        updateGameStatus('Creating room...');
        const roomId = await multiplayerManager.createRoom();
        currentRoomId = roomId;
        
        document.getElementById('roomIdText').textContent = roomId;
        document.getElementById('roomIdDisplay').classList.remove('hidden');
        
        // Initialize connection
        await multiplayerManager.initiateConnection();
        
        // Start game after a short delay
        setTimeout(() => {
            startGame('online');
            document.getElementById('whitePlayer').textContent = 'You (Host)';
            updateGameStatus('Waiting for opponent...');
        }, 1000);
    } catch (error) {
        console.error('Error creating room:', error);
        alert('Failed to create room. Please try again. Note: Online multiplayer requires both players to be online simultaneously.');
    }
}

async function joinRoom() {
    const roomIdInput = document.getElementById('joinRoomId');
    const roomId = roomIdInput.value.trim();
    
    if (!roomId) {
        alert('Please enter a room ID');
        return;
    }

    try {
        updateGameStatus('Joining room...');
        await multiplayerManager.joinRoom(roomId);
        currentRoomId = roomId;
        
        // Start game
        startGame('online');
        document.getElementById('blackPlayer').textContent = 'You (Guest)';
        updateGameStatus('Connected! Game starting...');
    } catch (error) {
        console.error('Error joining room:', error);
        alert('Failed to join room. Please check the room ID and try again. Note: Online multiplayer requires both players to be online simultaneously and may need a few seconds to establish connection.');
    }
}

function copyRoomId() {
    const roomIdText = document.getElementById('roomIdText').textContent;
    navigator.clipboard.writeText(roomIdText).then(() => {
        const copyBtn = event.target;
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    });
}

function undoMove() {
    chessGame.undoMove();
}

function resetGame() {
    if (confirm('Are you sure you want to reset the game?')) {
        chessGame.reset();
        if (currentGameMode === 'online') {
            multiplayerManager.sendGameState({ type: 'reset' });
        }
    }
}

function flipBoard() {
    chessGame.flipBoard();
}

function exportPGN() {
    chessGame.exportPGN();
}

function shareGame() {
    const shareModal = document.getElementById('shareModal');
    const shareUrl = document.getElementById('shareUrl');
    
    // Create shareable URL
    const url = new URL(window.location.href);
    if (currentRoomId) {
        url.searchParams.set('room', currentRoomId);
    }
    url.searchParams.set('mode', currentGameMode || 'local');
    
    shareUrl.value = url.toString();
    shareModal.classList.remove('hidden');
}

function closeShareModal() {
    document.getElementById('shareModal').classList.add('hidden');
}

function copyShareUrl() {
    const shareUrl = document.getElementById('shareUrl');
    shareUrl.select();
    document.execCommand('copy');
    
    const copyBtn = event.target;
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyBtn.textContent = originalText;
    }, 2000);
}

function updateGameStatus(message) {
    const statusEl = document.getElementById('gameStatus');
    if (statusEl) {
        statusEl.textContent = message;
    }
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+Z or Cmd+Z for undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (chessGame && currentGameMode) {
            undoMove();
        }
    }
    // F for flip board
    if (e.key === 'f' || e.key === 'F') {
        if (chessGame && currentGameMode && document.activeElement.tagName !== 'INPUT') {
            e.preventDefault();
            flipBoard();
        }
    }
});

// Handle URL parameters for sharing
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    const mode = urlParams.get('mode');
    
    if (roomId && mode === 'online') {
        document.getElementById('joinRoomId').value = roomId;
        setTimeout(() => {
            joinRoom();
        }, 500);
    }
});

// Handle page visibility to maintain connection
document.addEventListener('visibilitychange', () => {
    if (document.hidden && currentGameMode === 'online') {
        // Optionally pause or maintain connection
    }
});
