/**
 * Main Application - The Brothers Chess
 * A Dostoevsky-themed chess experience
 */

// Global instances
let game = null;
let stockfish = null;
let multiplayer = null;
let selectedTimeControl = 0;
let currentScreen = 'menuScreen';

// Dostoevsky quotes for various occasions
const dostoevskQuotes = {
    welcome: [
        "The soul is healed by being with children... and by playing chess.",
        "Man is a mystery. It needs to be unravelled, and if you spend your whole life unravelling it, don't say that you've wasted time.",
        "Taking a new step, uttering a new word, is what people fear most.",
        "Beauty will save the world.",
        "The cleverest of all, in my opinion, is the man who calls himself a fool at least once a month."
    ],
    thinking: [
        "To think too much is a disease...",
        "Pain and suffering are always inevitable for a large intelligence and a deep heart.",
        "The soul is healed by being with children.",
        "The darker the night, the brighter the stars.",
        "Realists do not fear the results of their study."
    ],
    victory: [
        "To go wrong in one's own way is better than to go right in someone else's.",
        "The cleverest of all, in my opinion, is the man who calls himself a fool at least once a month.",
        "A real gentleman, even if he loses everything he owns, must show no emotion.",
        "Right or wrong, it's very pleasant to break something from time to time.",
        "Man only likes to count his troubles; he doesn't calculate his happiness."
    ],
    defeat: [
        "Suffering is the sole origin of consciousness.",
        "Pain and suffering are always inevitable for a large intelligence.",
        "To love is to suffer and there is no love otherwise.",
        "What is hell? I maintain that it is the suffering of being unable to love.",
        "The darker the night, the brighter the stars, The deeper the grief, the closer is God!"
    ],
    draw: [
        "Much unhappiness has come into the world because of bewilderment and things left unsaid.",
        "If you want to be respected by others, the great thing is to respect yourself.",
        "To remain human, sometimes you have to accept a draw.",
        "Power is given only to those who dare to lower themselves and pick it up.",
        "It takes something more than intelligence to act intelligently."
    ],
    check: [
        "The soul is healed by being with children.",
        "Above all, don't lie to yourself.",
        "We sometimes encounter people, even perfect strangers, who begin to interest us at first sight.",
        "To study the meaning of man and of life — I am making significant progress here.",
        "What do you think, would not one tiny crime be wiped out by thousands of good deeds?"
    ]
};

/**
 * Initialize the application
 */
function init() {
    // Initialize game
    game = new ChessGame();
    
    // Initialize Stockfish
    stockfish = new StockfishEngine();
    
    // Initialize multiplayer
    multiplayer = new MultiplayerManager();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup quote rotation
    rotateQuotes();
    
    // Check for game invitation in URL
    if (MultiplayerManager.hasGameInvitation()) {
        const gameId = MultiplayerManager.getGameIdFromUrl();
        showScreen('multiplayerLobby');
        document.getElementById('gameCodeInput').value = gameId;
        showToast('Game invitation detected! Click "Join Game" to connect.');
    }
    
    // Randomly show a welcome quote
    updateQuoteBanner(getRandomQuote('welcome'));
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Time control buttons
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const parent = e.target.closest('.time-options');
            parent.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            selectedTimeControl = parseInt(e.target.dataset.time) || 0;
        });
    });
    
    // Color choice buttons
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
    
    // Setup Stockfish callbacks
    stockfish.onBestMove = (from, to, promotion) => {
        if (game.gameMode === 'ai' && !game.canMove()) {
            game.applyMove(from, to, promotion);
            updateAnalysis();
        }
    };
    
    stockfish.onEvaluation = (evalData) => {
        updateEvaluationDisplay(evalData);
    };
    
    // Setup multiplayer callbacks
    multiplayer.onOpponentJoined = (info) => {
        if (info) {
            // We're the joiner, got game info
            game.setPlayerColor(info.playerColor);
            if (info.timeControl > 0) {
                game.startTimer(info.timeControl);
            }
            updatePlayerNames();
        }
        
        document.getElementById('waitingText').textContent = '✓ Opponent connected!';
        showToast('Opponent has joined the game!');
        
        setTimeout(() => {
            showScreen('gameScreen');
            game.updateStatus();
        }, 1000);
    };
    
    multiplayer.onOpponentMove = (from, to, promotion) => {
        game.isPlayerTurn = true;
        game.applyMove(from, to, promotion);
        updateAnalysis();
    };
    
    multiplayer.onOpponentDisconnected = () => {
        showToast('Opponent disconnected!');
        game.showGameOverModal('Opponent Disconnected', 'Your opponent has left the game.');
    };
    
    multiplayer.onDrawOffer = () => {
        document.getElementById('drawOfferModal').classList.remove('hidden');
    };
    
    multiplayer.onResign = () => {
        game.gameOver = true;
        game.stopTimer();
        game.showGameOverModal('Opponent Resigned', 'Your opponent has resigned. You win!');
    };
    
    multiplayer.onConnectionError = (errorType) => {
        showToast(`Connection error: ${errorType}`);
    };
    
    // Setup game move callback for multiplayer
    game.onMoveCallback = (move) => {
        if (game.gameMode === 'online' && multiplayer.isConnected()) {
            multiplayer.sendMove(move.from, move.to, move.promotion);
            game.isPlayerTurn = false;
        } else if (game.gameMode === 'ai') {
            // Trigger AI move
            setTimeout(() => {
                if (!game.gameOver && !game.canMove()) {
                    stockfish.getBestMove(game.getFen(), game.aiDifficulty);
                }
            }, 500);
        }
        
        // Update analysis
        updateAnalysis();
    };
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (currentScreen === 'gameScreen') {
            if (e.key === 'f' || e.key === 'F') {
                flipBoard();
            } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
                undoMove();
            } else if (e.key === 'm' || e.key === 'M') {
                toggleSound();
            }
        } else if (e.key === 'Escape') {
            closeModal();
        }
    });
}

/**
 * Show a screen
 */
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
        currentScreen = screenId;
    }
}

/**
 * Start a new game
 */
function startGame(mode, difficulty = 'medium') {
    game.reset();
    game.setGameMode(mode, difficulty);
    
    if (mode === 'ai') {
        stockfish.setDifficulty(difficulty);
        game.setPlayerColor('white');
        document.getElementById('opponentName').textContent = getDifficultyName(difficulty);
        document.getElementById('playerName').textContent = 'You';
        
        // Show analysis panel for AI games
        document.getElementById('analysisPanel').style.display = 'block';
    } else if (mode === 'local') {
        document.getElementById('opponentName').textContent = 'Black';
        document.getElementById('playerName').textContent = 'White';
        document.getElementById('analysisPanel').style.display = 'block';
    } else if (mode === 'analysis') {
        document.getElementById('opponentName').textContent = 'Analysis';
        document.getElementById('playerName').textContent = 'Mode';
        document.getElementById('analysisPanel').style.display = 'block';
    }
    
    // Start timer if set
    if (selectedTimeControl > 0) {
        game.startTimer(selectedTimeControl);
    }
    
    showScreen('gameScreen');
    game.updateStatus();
    updateAnalysis();
}

/**
 * Get difficulty display name
 */
function getDifficultyName(difficulty) {
    const names = {
        easy: 'Alyosha (Easy)',
        medium: 'Ivan (Medium)',
        hard: 'Dmitri (Hard)',
        master: 'Grand Inquisitor'
    };
    return names[difficulty] || 'Opponent';
}

/**
 * Create multiplayer game
 */
async function createMultiplayerGame() {
    const colorBtn = document.querySelector('.color-btn.active');
    const playerColor = colorBtn ? colorBtn.dataset.color : 'white';
    
    const timeBtn = document.querySelector('.mp-time .time-btn.active');
    const timeControl = timeBtn ? parseInt(timeBtn.dataset.time) || 0 : 0;
    
    try {
        showToast('Creating game room...');
        
        const result = await multiplayer.createGame(playerColor, timeControl);
        
        game.reset();
        game.setGameMode('online');
        game.setPlayerColor(result.playerColor);
        game.isPlayerTurn = result.playerColor === 'white';
        
        if (timeControl > 0) {
            game.startTimer(timeControl);
            game.stopTimer(); // Stop until opponent joins
        }
        
        // Show link display
        const linkDisplay = document.getElementById('linkDisplay');
        linkDisplay.classList.remove('hidden');
        
        document.getElementById('gameLink').value = result.link;
        document.getElementById('gameCodeDisplay').textContent = result.gameId;
        document.getElementById('waitingText').textContent = '⏳ Waiting for opponent to join...';
        
        // Hide analysis panel for online games
        document.getElementById('analysisPanel').style.display = 'none';
        
        updatePlayerNames();
        
    } catch (error) {
        console.error('Failed to create game:', error);
        showToast('Failed to create game. Please try again.');
    }
}

/**
 * Join multiplayer game
 */
async function joinMultiplayerGame() {
    const gameCode = document.getElementById('gameCodeInput').value.trim();
    
    if (!gameCode) {
        showToast('Please enter a game code');
        return;
    }
    
    try {
        showToast('Connecting to game...');
        
        await multiplayer.joinGame(gameCode);
        
        game.reset();
        game.setGameMode('online');
        
        // Hide analysis panel for online games
        document.getElementById('analysisPanel').style.display = 'none';
        
    } catch (error) {
        console.error('Failed to join game:', error);
        showToast('Failed to join game. Check the game code and try again.');
    }
}

/**
 * Join from URL parameter
 */
function joinFromUrl() {
    const gameId = MultiplayerManager.getGameIdFromUrl();
    if (gameId) {
        document.getElementById('gameCodeInput').value = gameId;
        showScreen('multiplayerLobby');
        joinMultiplayerGame();
    } else {
        showScreen('multiplayerLobby');
    }
}

/**
 * Update player names
 */
function updatePlayerNames() {
    if (game.gameMode === 'online') {
        const playerColor = multiplayer.playerColor;
        document.getElementById('playerName').textContent = `You (${playerColor})`;
        document.getElementById('opponentName').textContent = `Opponent (${playerColor === 'white' ? 'black' : 'white'})`;
    }
}

/**
 * Copy game link to clipboard
 */
function copyGameLink() {
    const linkInput = document.getElementById('gameLink');
    linkInput.select();
    document.execCommand('copy');
    
    // Also try modern clipboard API
    navigator.clipboard.writeText(linkInput.value).catch(() => {});
    
    showToast('Link copied to clipboard!');
}

/**
 * Flip the board
 */
function flipBoard() {
    game.flipBoard();
}

/**
 * Offer draw
 */
function offerDraw() {
    if (game.gameMode === 'online' && multiplayer.isConnected()) {
        multiplayer.offerDraw();
        showToast('Draw offer sent');
    } else if (game.gameMode === 'local') {
        // In local mode, just accept the draw
        game.gameOver = true;
        game.stopTimer();
        game.showGameOverModal('Draw Agreed', 'Both players agreed to a draw.');
    }
}

/**
 * Accept draw
 */
function acceptDraw() {
    document.getElementById('drawOfferModal').classList.add('hidden');
    
    if (game.gameMode === 'online') {
        multiplayer.acceptDraw();
    }
    
    game.gameOver = true;
    game.stopTimer();
    game.showGameOverModal('Draw Agreed', 'Both players agreed to a draw.');
}

/**
 * Decline draw
 */
function declineDraw() {
    document.getElementById('drawOfferModal').classList.add('hidden');
    
    if (game.gameMode === 'online') {
        multiplayer.declineDraw();
    }
    
    showToast('Draw declined');
}

/**
 * Resign game
 */
function resignGame() {
    if (confirm('Are you sure you want to resign?')) {
        if (game.gameMode === 'online' && multiplayer.isConnected()) {
            multiplayer.resign();
        }
        
        game.gameOver = true;
        game.stopTimer();
        
        const winner = game.playerColor === 'white' ? 'Black' : 'White';
        game.showGameOverModal('Resignation', `You resigned. ${winner} wins.`);
    }
}

/**
 * Undo move
 */
function undoMove() {
    if (game.gameMode !== 'online') {
        game.undoMove();
        
        // In AI mode, undo two moves (player + AI)
        if (game.gameMode === 'ai' && game.moveHistory.length > 0) {
            game.undoMove();
        }
        
        updateAnalysis();
    }
}

/**
 * Toggle sound
 */
function toggleSound() {
    game.toggleSound();
}

/**
 * Play again
 */
function playAgain() {
    closeModal();
    
    if (game.gameMode === 'online' && multiplayer.isConnected()) {
        multiplayer.requestRematch();
        showToast('Rematch requested');
    }
    
    game.reset();
    
    if (game.timeControl > 0) {
        game.startTimer(game.timeControl);
    }
    
    game.updateStatus();
}

/**
 * Quit game
 */
function quitGame() {
    if (game.gameMode === 'online') {
        multiplayer.disconnect();
    }
    
    game.reset();
    game.stopTimer();
    
    // Reset link display
    document.getElementById('linkDisplay').classList.add('hidden');
    
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
    
    showScreen('menuScreen');
}

/**
 * Close modal
 */
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
}

/**
 * Update analysis panel
 */
function updateAnalysis() {
    if (game.gameMode === 'analysis' || game.gameMode === 'ai' || game.gameMode === 'local') {
        stockfish.analyzePosition(game.getFen());
    }
}

/**
 * Update evaluation display
 */
function updateEvaluationDisplay(evalData) {
    const evalFill = document.getElementById('evalFill');
    const evalText = document.getElementById('evalText');
    const bestMove = document.getElementById('bestMove');
    
    if (evalData.evaluation !== null) {
        // Calculate bar position (clamp between -10 and +10)
        const clampedEval = Math.max(-10, Math.min(10, evalData.evaluation));
        const percentage = ((clampedEval + 10) / 20) * 100;
        
        evalFill.style.left = `${percentage}%`;
        evalFill.style.transform = 'translateX(-50%)';
        
        // Display evaluation
        if (Math.abs(evalData.evaluation) >= 100) {
            evalText.textContent = evalData.evaluation > 0 ? 'White wins' : 'Black wins';
        } else {
            const sign = evalData.evaluation >= 0 ? '+' : '';
            evalText.textContent = `${sign}${evalData.evaluation.toFixed(2)} (depth ${evalData.depth || '?'})`;
        }
    }
    
    if (evalData.bestLine) {
        bestMove.textContent = `Best: ${evalData.bestLine}`;
    }
}

/**
 * Get random quote
 */
function getRandomQuote(category) {
    const quotes = dostoevskQuotes[category] || dostoevskQuotes.welcome;
    return quotes[Math.floor(Math.random() * quotes.length)];
}

/**
 * Update quote banner
 */
function updateQuoteBanner(quote) {
    const quoteText = document.getElementById('quoteText');
    quoteText.style.opacity = 0;
    
    setTimeout(() => {
        quoteText.textContent = quote;
        quoteText.style.opacity = 1;
    }, 300);
}

/**
 * Rotate quotes periodically
 */
function rotateQuotes() {
    setInterval(() => {
        if (currentScreen === 'menuScreen') {
            updateQuoteBanner(getRandomQuote('welcome'));
        }
    }, 15000);
}

/**
 * Show toast notification
 */
function showToast(message, duration = 3000) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Remove after duration
    setTimeout(() => {
        toast.style.opacity = 0;
        toast.style.transform = 'translate(-50%, 20px)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', init);

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause timer when page is hidden (optional)
    }
});

// Prevent accidental page close during game
window.addEventListener('beforeunload', (e) => {
    if (currentScreen === 'gameScreen' && !game.gameOver) {
        e.preventDefault();
        e.returnValue = 'You have a game in progress. Are you sure you want to leave?';
        return e.returnValue;
    }
});

// Export functions for HTML onclick handlers
window.showScreen = showScreen;
window.startGame = startGame;
window.createMultiplayerGame = createMultiplayerGame;
window.joinMultiplayerGame = joinMultiplayerGame;
window.joinFromUrl = joinFromUrl;
window.copyGameLink = copyGameLink;
window.flipBoard = flipBoard;
window.offerDraw = offerDraw;
window.acceptDraw = acceptDraw;
window.declineDraw = declineDraw;
window.resignGame = resignGame;
window.undoMove = undoMove;
window.toggleSound = toggleSound;
window.playAgain = playAgain;
window.quitGame = quitGame;
window.closeModal = closeModal;
