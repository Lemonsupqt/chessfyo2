/**
 * THE GRAND INQUISITOR'S CHESS
 * Main Application Module
 */

// Global instances
let game;
let ui;
let stockfish;
let multiplayer;

// Game state
let currentMode = null;
let selectedColor = 'white';
let pendingGameMode = null;

// DOM Elements
const mainMenu = document.getElementById('mainMenu');
const onlineMenu = document.getElementById('onlineMenu');
const gameScreen = document.getElementById('gameScreen');
const settingsModal = document.getElementById('settingsModal');

/**
 * Initialize the application
 */
async function init() {
    // Initialize chess game
    game = new ChessGame();
    ui = new ChessUI(game);
    
    // Initialize Stockfish
    stockfish = new StockfishEngine();
    try {
        await stockfish.init();
        console.log('Stockfish initialized');
    } catch (e) {
        console.warn('Stockfish initialization failed:', e);
    }
    
    // Initialize multiplayer manager
    multiplayer = new MultiplayerManager();
    
    // Check for join link in URL
    checkJoinLink();
    
    // Update quote periodically
    setInterval(() => {
        ui.updateQuoteBanner();
    }, 30000);
    
    console.log('The Grand Inquisitor\'s Chess initialized');
}

/**
 * Check if there's a join code in the URL
 */
function checkJoinLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    
    if (joinCode) {
        // Clear the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Show online menu and auto-fill code
        showOnlineMenu();
        document.getElementById('gameCodeInput').value = joinCode;
        showJoinForm();
        
        // Auto-join after a short delay
        setTimeout(() => {
            joinOnlineGame();
        }, 500);
    }
}

/**
 * Start a game
 */
function startGame(mode) {
    pendingGameMode = mode;
    
    // Show settings modal for AI and local modes
    if (mode === 'ai') {
        document.getElementById('aiSettings').classList.remove('hidden');
        document.getElementById('colorChoice').classList.remove('hidden');
        showSettings();
    } else if (mode === 'local') {
        document.getElementById('aiSettings').classList.add('hidden');
        document.getElementById('colorChoice').classList.add('hidden');
        showSettings();
    } else if (mode === 'analysis') {
        document.getElementById('aiSettings').classList.add('hidden');
        document.getElementById('colorChoice').classList.add('hidden');
        showSettings();
    }
}

/**
 * Show settings modal
 */
function showSettings() {
    settingsModal.classList.remove('hidden');
}

/**
 * Close settings modal
 */
function closeSettings() {
    settingsModal.classList.add('hidden');
    pendingGameMode = null;
}

/**
 * Select player color
 */
function selectColor(color) {
    selectedColor = color;
    
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === color);
    });
}

/**
 * Confirm settings and start game
 */
function confirmSettings() {
    const timeControl = parseInt(document.getElementById('timeControl').value);
    const aiDifficulty = parseInt(document.getElementById('aiDifficulty').value);
    
    // Resolve random color
    let playerColor = selectedColor;
    if (playerColor === 'random') {
        playerColor = Math.random() < 0.5 ? 'white' : 'black';
    }
    
    const options = {
        timeControl,
        playerColor,
        aiDifficulty
    };
    
    closeSettings();
    launchGame(pendingGameMode, options);
}

/**
 * Launch a game with given options
 */
function launchGame(mode, options = {}) {
    currentMode = mode;
    
    // Hide menus, show game screen
    mainMenu.classList.add('hidden');
    onlineMenu.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    // Initialize new game
    game.newGame(mode, options);
    
    // Update UI
    ui.init();
    ui.updatePlayerAvatars();
    
    // Set mode display
    const modeNames = {
        'local': 'Brothers Karamazov — Local Match',
        'ai': `Crime & Punishment — vs Stockfish (Level ${options.aiDifficulty || 10})`,
        'online': 'Notes from Underground — Online Match',
        'analysis': 'The Idiot\'s Study — Analysis Board'
    };
    document.getElementById('gameModeDisplay').textContent = modeNames[mode] || 'Chess';
    
    // Set player names based on mode
    switch (mode) {
        case 'local':
            ui.setPlayerNames('White', 'Black');
            break;
        case 'ai':
            const aiNames = ['Sonya', 'Dmitri', 'Ivan', 'Porfiry', 'Smerdyakov', 'The Inquisitor', 'The Almighty'];
            const aiIndex = Math.min(Math.floor(options.aiDifficulty / 3), aiNames.length - 1);
            const aiName = aiNames[aiIndex];
            
            if (options.playerColor === 'white') {
                ui.setPlayerNames('You', aiName);
            } else {
                ui.setPlayerNames('You', aiName);
            }
            
            // Set Stockfish difficulty
            stockfish.setSkillLevel(options.aiDifficulty);
            break;
        case 'online':
            ui.setPlayerNames('You', multiplayer.isHost ? 'Opponent' : 'Host');
            break;
        case 'analysis':
            ui.setPlayerNames('Analysis', 'Board');
            document.getElementById('enginePanel').classList.remove('hidden');
            break;
    }
    
    // Configure controls based on mode
    configureControls(mode);
    
    // Initialize timers
    if (options.timeControl > 0) {
        ui.updateTimers(options.timeControl * 60, options.timeControl * 60);
    } else {
        document.getElementById('playerTimer').textContent = '∞';
        document.getElementById('opponentTimer').textContent = '∞';
    }
    
    // Setup mode-specific handlers
    if (mode === 'ai') {
        setupAIGame(options);
    } else if (mode === 'analysis') {
        setupAnalysisMode();
    }
    
    ui.showRandomQuote('gameStart');
}

/**
 * Configure game controls based on mode
 */
function configureControls(mode) {
    const drawBtn = document.getElementById('drawBtn');
    const resignBtn = document.getElementById('resignBtn');
    const undoBtn = document.getElementById('undoBtn');
    const enginePanel = document.getElementById('enginePanel');
    
    switch (mode) {
        case 'local':
            drawBtn.style.display = 'flex';
            resignBtn.style.display = 'flex';
            undoBtn.style.display = 'flex';
            enginePanel.classList.add('hidden');
            break;
        case 'ai':
            drawBtn.style.display = 'none';
            resignBtn.style.display = 'flex';
            undoBtn.style.display = 'flex';
            enginePanel.classList.add('hidden');
            break;
        case 'online':
            drawBtn.style.display = 'flex';
            resignBtn.style.display = 'flex';
            undoBtn.style.display = 'none';
            enginePanel.classList.add('hidden');
            break;
        case 'analysis':
            drawBtn.style.display = 'none';
            resignBtn.style.display = 'none';
            undoBtn.style.display = 'flex';
            enginePanel.classList.remove('hidden');
            break;
    }
}

/**
 * Setup AI game
 */
function setupAIGame(options) {
    // Set game move callback
    game.onMove = async (move, status) => {
        // If it's now AI's turn and game is not over
        if (!status.over && !game.canMove()) {
            // Add a small delay for better UX
            setTimeout(async () => {
                await makeAIMove();
            }, 300);
        }
    };
    
    game.onGameOver = (status) => {
        ui.showGameOver(status);
    };
    
    // If AI plays first (player chose black)
    if (options.playerColor === 'black') {
        setTimeout(async () => {
            await makeAIMove();
        }, 500);
    }
}

/**
 * Make AI move
 */
async function makeAIMove() {
    if (game.gameOver) return;
    
    try {
        const result = await stockfish.getBestMove(game.getFen());
        
        if (result && result.move) {
            const moveData = StockfishEngine.parseUciMove(result.move);
            
            if (moveData) {
                // Select and make the move
                game.selectSquare(moveData.from);
                const moveResult = game.makeMove(
                    moveData.from,
                    moveData.to,
                    moveData.promotion
                );
                
                if (moveResult) {
                    ui.handleMoveResult(moveResult);
                    ui.renderBoard();
                }
            }
        }
    } catch (e) {
        console.error('AI move error:', e);
    }
}

/**
 * Setup analysis mode
 */
function setupAnalysisMode() {
    // Start engine analysis
    stockfish.onAnalysis = (analysis) => {
        updateEngineDisplay(analysis);
    };
    
    game.onMove = (move, status) => {
        // Update analysis on each move
        stockfish.startAnalysis(game.getFen());
    };
    
    // Start initial analysis
    stockfish.startAnalysis(game.getFen());
}

/**
 * Update engine analysis display
 */
function updateEngineDisplay(analysis) {
    const evalElement = document.getElementById('engineEval');
    const lineElement = document.getElementById('engineLine');
    const fillElement = document.getElementById('evalFill');
    
    if (evalElement && analysis.eval) {
        evalElement.textContent = analysis.eval;
    }
    
    if (lineElement && analysis.pv) {
        lineElement.textContent = analysis.pv.slice(0, 5).join(' ');
    }
    
    if (fillElement && analysis.scoreValue !== undefined) {
        // Convert centipawns to percentage (capped at ±5 pawns)
        let percentage = 50;
        if (analysis.scoreType === 'cp') {
            percentage = 50 + (analysis.scoreValue / 10);
            percentage = Math.max(5, Math.min(95, percentage));
        } else if (analysis.scoreType === 'mate') {
            percentage = analysis.scoreValue > 0 ? 95 : 5;
        }
        fillElement.style.width = `${percentage}%`;
    }
}

/**
 * Show online menu
 */
function showOnlineMenu() {
    mainMenu.classList.add('hidden');
    onlineMenu.classList.remove('hidden');
    document.getElementById('joinForm').classList.add('hidden');
    document.getElementById('connectionStatus').classList.add('hidden');
}

/**
 * Show main menu
 */
function showMainMenu() {
    onlineMenu.classList.add('hidden');
    gameScreen.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    
    // Clean up any connections
    if (multiplayer) {
        multiplayer.disconnect();
    }
    
    // Stop analysis
    if (stockfish) {
        stockfish.stopAnalysis();
    }
}

/**
 * Show join form
 */
function showJoinForm() {
    document.getElementById('joinForm').classList.remove('hidden');
}

/**
 * Create online game
 */
async function createOnlineGame() {
    const timeControl = 5; // Default 5 minutes
    
    document.getElementById('connectionStatus').classList.remove('hidden');
    document.getElementById('statusText').textContent = 'Creating game...';
    document.getElementById('gameLinkContainer').classList.add('hidden');
    
    try {
        const result = await multiplayer.createGame({ timeControl });
        
        document.getElementById('statusText').textContent = 'Waiting for opponent to join...';
        document.getElementById('gameLinkContainer').classList.remove('hidden');
        document.getElementById('gameCode').textContent = result.gameCode;
        
        // Setup connection callback
        multiplayer.onConnected = () => {
            ui.showToast('Opponent connected!', 'success');
            document.getElementById('statusText').textContent = 'Opponent connected! Starting game...';
            
            // Start the game
            setTimeout(() => {
                multiplayer.startGame();
                startOnlineGame(result.playerColor, { timeControl });
            }, 1000);
        };
        
        multiplayer.onDisconnected = () => {
            ui.showToast('Opponent disconnected', 'error');
        };
        
    } catch (error) {
        document.getElementById('statusText').textContent = 'Failed to create game: ' + error.message;
        ui.showToast('Failed to create game', 'error');
    }
}

/**
 * Join online game
 */
async function joinOnlineGame() {
    const gameCode = document.getElementById('gameCodeInput').value.trim().toUpperCase();
    
    if (!gameCode) {
        ui.showToast('Please enter a game code', 'error');
        return;
    }
    
    document.getElementById('connectionStatus').classList.remove('hidden');
    document.getElementById('statusText').textContent = 'Connecting to game...';
    document.getElementById('gameLinkContainer').classList.add('hidden');
    
    try {
        const result = await multiplayer.joinGame(gameCode);
        
        document.getElementById('statusText').textContent = 'Connected! Waiting for game to start...';
        
        // Setup callbacks
        multiplayer.onGameStart = (playerColor, settings) => {
            startOnlineGame(playerColor, settings);
        };
        
        multiplayer.onDisconnected = () => {
            ui.showToast('Disconnected from game', 'error');
        };
        
    } catch (error) {
        document.getElementById('statusText').textContent = 'Failed to join: ' + error.message;
        ui.showToast(error.message, 'error');
    }
}

/**
 * Start online game
 */
function startOnlineGame(playerColor, settings) {
    const options = {
        timeControl: settings.timeControl || 5,
        playerColor
    };
    
    // Setup multiplayer callbacks
    multiplayer.onMove = (moveData) => {
        // Opponent made a move
        game.selectSquare(moveData.from);
        const result = game.makeMove(moveData.from, moveData.to, moveData.promotion);
        
        if (result) {
            ui.handleMoveResult(result);
            ui.renderBoard();
        }
    };
    
    multiplayer.onDrawOffer = () => {
        if (confirm('Your opponent offers a draw. Accept?')) {
            multiplayer.acceptDraw();
            endGameWithResult({ over: true, result: 'draw', winner: null });
        } else {
            multiplayer.declineDraw();
        }
    };
    
    multiplayer.onDrawAccept = () => {
        endGameWithResult({ over: true, result: 'draw', winner: null });
    };
    
    multiplayer.onResign = () => {
        const winner = playerColor;
        endGameWithResult({ over: true, result: 'resignation', winner });
    };
    
    // Set game move callback
    game.onMove = (move, status) => {
        // Send move to opponent
        multiplayer.sendMove(move);
        
        if (status.over) {
            ui.showGameOver(status);
        }
    };
    
    game.onGameOver = (status) => {
        ui.showGameOver(status);
    };
    
    launchGame('online', options);
}

/**
 * End game with result
 */
function endGameWithResult(status) {
    game.endGame();
    ui.showGameOver(status);
}

/**
 * Copy game code
 */
function copyGameCode() {
    const code = document.getElementById('gameCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        ui.showToast('Code copied!', 'success');
    });
}

/**
 * Copy game link
 */
function copyGameLink() {
    const link = multiplayer.getShareLink();
    if (link) {
        navigator.clipboard.writeText(link).then(() => {
            ui.showToast('Link copied!', 'success');
        });
    }
}

/**
 * Confirm exit from game
 */
function confirmExit() {
    if (game.gameStarted && !game.gameOver) {
        if (!confirm('Are you sure you want to leave this game?')) {
            return;
        }
    }
    
    // Clean up
    if (currentMode === 'online') {
        multiplayer.resign();
        multiplayer.disconnect();
    }
    
    if (currentMode === 'analysis') {
        stockfish.stopAnalysis();
    }
    
    showMainMenu();
}

/**
 * Offer draw
 */
function offerDraw() {
    if (currentMode === 'online') {
        multiplayer.offerDraw();
        ui.showToast('Draw offered', 'info');
    } else if (currentMode === 'local') {
        if (confirm('Both players agree to a draw?')) {
            endGameWithResult({ over: true, result: 'draw', winner: null });
        }
    }
}

/**
 * Resign game
 */
function resignGame() {
    if (!confirm('Are you sure you want to resign?')) {
        return;
    }
    
    if (currentMode === 'online') {
        multiplayer.resign();
    }
    
    const resigningColor = currentMode === 'local' ? game.getTurn() : game.playerColor;
    const status = game.resign(resigningColor);
    ui.showGameOver(status);
}

/**
 * Undo move
 */
function undoMove() {
    if (currentMode === 'online') return;
    
    if (currentMode === 'ai') {
        // Undo two moves (player's and AI's)
        game.undo();
        game.undo();
    } else {
        game.undo();
    }
    
    ui.renderBoard();
    ui.updateMoveHistory();
    ui.updateCapturedPieces();
    
    // Update analysis
    if (currentMode === 'analysis') {
        stockfish.startAnalysis(game.getFen());
    }
}

/**
 * Flip board
 */
function flipBoard() {
    game.flipBoard();
}

/**
 * Toggle game settings
 */
function toggleGameSettings() {
    // Could show in-game settings like sound, board theme, etc.
    ui.toggleSound();
    const soundStatus = ui.soundEnabled ? 'enabled' : 'disabled';
    ui.showToast(`Sound ${soundStatus}`, 'info');
}

/**
 * Play again
 */
function playAgain() {
    ui.hideGameOver();
    
    if (currentMode === 'online') {
        // Would need rematch logic
        showMainMenu();
    } else {
        // Restart with same settings
        game.newGame(currentMode, {
            timeControl: game.timeControl / 60,
            playerColor: game.playerColor,
            aiDifficulty: game.aiDifficulty
        });
        ui.init();
        
        if (currentMode === 'ai' && game.playerColor === 'black') {
            setTimeout(makeAIMove, 500);
        }
    }
}

/**
 * Return to menu
 */
function returnToMenu() {
    ui.hideGameOver();
    
    if (currentMode === 'online') {
        multiplayer.disconnect();
    }
    
    if (currentMode === 'analysis') {
        stockfish.stopAnalysis();
    }
    
    showMainMenu();
}

/**
 * Analyze game
 */
function analyzeGame() {
    ui.hideGameOver();
    
    // Switch to analysis mode with current position
    currentMode = 'analysis';
    document.getElementById('gameModeDisplay').textContent = 'The Idiot\'s Study — Post-Game Analysis';
    
    configureControls('analysis');
    setupAnalysisMode();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Handle page visibility
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, could pause timer in local games
    } else {
        // Page is visible again
    }
});

// Handle beforeunload
window.addEventListener('beforeunload', (e) => {
    if (game && game.gameStarted && !game.gameOver && currentMode === 'online') {
        e.preventDefault();
        e.returnValue = '';
    }
});
