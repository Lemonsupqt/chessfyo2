// ========================================
// MAIN GAME CONTROLLER
// ========================================

let chessEngine;
let multiplayerManager;
let stockfishEngine;
let gameMode;

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Get game mode from localStorage
    gameMode = localStorage.getItem('gameMode');
    
    if (!gameMode) {
        // Redirect to home if no game mode set
        window.location.href = 'index.html';
        return;
    }
    
    // Update game mode display
    const gameModeDisplay = document.getElementById('gameModeDisplay');
    switch (gameMode) {
        case 'local':
            gameModeDisplay.textContent = 'Local Game - Two Players';
            break;
        case 'ai':
            gameModeDisplay.textContent = 'vs Stockfish AI';
            break;
        case 'online':
            gameModeDisplay.textContent = 'Online Multiplayer';
            break;
    }
    
    // Initialize chess engine
    chessEngine = new ChessEngine();
    
    // Initialize appropriate game mode
    if (gameMode === 'online') {
        multiplayerManager = new MultiplayerManager(chessEngine);
        multiplayerManager.initialize();
        window.multiplayerManager = multiplayerManager;
        
        // Modify handleSquareClick to check if it's player's turn
        const originalHandleClick = chessEngine.handleSquareClick.bind(chessEngine);
        chessEngine.handleSquareClick = function(square) {
            if (!multiplayerManager.canMove()) {
                return; // Not our turn
            }
            originalHandleClick(square);
        };
    } else if (gameMode === 'ai') {
        stockfishEngine = new StockfishEngine(chessEngine);
        stockfishEngine.initialize();
        window.stockfishEngine = stockfishEngine;
    } else if (gameMode === 'local') {
        // Local mode - no special setup needed
        document.getElementById('blackPlayerName').textContent = 'Black';
    }
});

// Control functions
function undoMove() {
    if (gameMode === 'online') {
        alert('Undo is not available in online multiplayer');
        return;
    }
    
    if (gameMode === 'ai') {
        // Undo twice in AI mode (player move + AI move)
        chessEngine.undo();
        if (chessEngine.getGame().history().length > 0) {
            chessEngine.undo();
        }
    } else {
        chessEngine.undo();
    }
}

function resetGame() {
    if (gameMode === 'online') {
        if (confirm('Reset the game? Your opponent will also see this.')) {
            chessEngine.reset();
            if (multiplayerManager) {
                multiplayerManager.sendReset();
            }
        }
    } else {
        if (confirm('Start a new game?')) {
            chessEngine.reset();
            
            // If AI mode and AI should move first (if starting as black)
            if (gameMode === 'ai' && stockfishEngine) {
                const playerColor = localStorage.getItem('playerColor');
                if (playerColor === 'black') {
                    setTimeout(() => {
                        stockfishEngine.makeMove();
                    }, 500);
                }
            }
        }
    }
}

function toggleBoardOrientation() {
    chessEngine.flipBoard();
}

function returnHome() {
    if (confirm('Return to main menu? Current game will be lost.')) {
        // Clean up connections
        if (multiplayerManager) {
            multiplayerManager.destroy();
        }
        if (stockfishEngine) {
            stockfishEngine.destroy();
        }
        
        // Clear localStorage
        localStorage.removeItem('gameMode');
        localStorage.removeItem('roomCode');
        localStorage.removeItem('isHost');
        localStorage.removeItem('playerName');
        localStorage.removeItem('playerColor');
        
        window.location.href = 'index.html';
    }
}

// Handle page unload
window.addEventListener('beforeunload', (e) => {
    if (gameMode === 'online' && multiplayerManager && multiplayerManager.connected) {
        e.preventDefault();
        e.returnValue = '';
        return 'Your opponent will be disconnected. Are you sure you want to leave?';
    }
});

// Clean up on page unload
window.addEventListener('unload', () => {
    if (multiplayerManager) {
        multiplayerManager.destroy();
    }
    if (stockfishEngine) {
        stockfishEngine.destroy();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Z for undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undoMove();
    }
    
    // Ctrl/Cmd + R for reset (override default refresh)
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        resetGame();
    }
    
    // F for flip
    if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleBoardOrientation();
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        const gameOverModal = document.getElementById('gameOverModal');
        if (gameOverModal.style.display === 'flex') {
            gameOverModal.style.display = 'none';
        }
    }
});

// Additional Dostoevsky quotes that cycle through
const additionalQuotes = [
    { text: "The soul is healed by being with children.", cite: "The Idiot" },
    { text: "To love someone means to see them as God intended them.", cite: "The Brothers Karamazov" },
    { text: "Man is sometimes extraordinarily, passionately, in love with suffering.", cite: "Notes from Underground" },
    { text: "Beauty will save the world.", cite: "The Idiot" },
    { text: "Above all, don't lie to yourself.", cite: "The Brothers Karamazov" },
    { text: "What is hell? I maintain that it is the suffering of being unable to love.", cite: "The Brothers Karamazov" },
    { text: "The cleverest of all, in my opinion, is the man who calls himself a fool at least once a month.", cite: "Notes from Underground" },
    { text: "It takes something more than intelligence to act intelligently.", cite: "Crime and Punishment" }
];

// Rotate quotes periodically
let quoteIndex = 0;
setInterval(() => {
    if (chessEngine && !chessEngine.getGame().game_over()) {
        const quoteElement = document.getElementById('gameQuote');
        const quote = additionalQuotes[quoteIndex];
        quoteElement.innerHTML = `${quote.text}<cite>— ${quote.cite}</cite>`;
        quoteIndex = (quoteIndex + 1) % additionalQuotes.length;
    }
}, 30000); // Change quote every 30 seconds

// Add sound effects (optional enhancement)
function playMoveSound() {
    // Could add audio here if desired
}

function playCheckSound() {
    // Could add audio here if desired
}

function playCaptureSound() {
    // Could add audio here if desired
}
