// ===================================
// Dostoevsky Chess - Main Game Logic
// ===================================

// === Global State ===
let game = null;
let board = null;
let selectedSquare = null;
let gameMode = null; // 'local', 'ai', 'online'
let playerColor = 'white';
let aiDifficulty = 5;
let peer = null;
let connection = null;
let gameId = null;
let stockfish = null;
let settings = {
    sound: true,
    highlights: true,
    boardTheme: 'classic'
};

// Dostoevsky quotes for atmosphere
const dostoevskiyQuotes = [
    { text: "To live without hope is to cease to live.", author: "Fyodor Dostoevsky" },
    { text: "Pain and suffering are always inevitable for a large intelligence and a deep heart.", author: "Crime and Punishment" },
    { text: "Man is a creature that can get accustomed to anything.", author: "The House of the Dead" },
    { text: "The mystery of human existence lies not in just staying alive, but in finding something to live for.", author: "The Brothers Karamazov" },
    { text: "Power is given only to those who dare to lower themselves and pick it up.", author: "Crime and Punishment" },
    { text: "The soul is healed by being with children.", author: "The Idiot" },
    { text: "Beauty will save the world.", author: "The Idiot" },
    { text: "To go wrong in one's own way is better than to go right in someone else's.", author: "Crime and Punishment" },
    { text: "We sometimes encounter people, even perfect strangers, who begin to interest us at first sight.", author: "Crime and Punishment" },
    { text: "A real gentleman, even if he loses everything he owns, must show no emotion.", author: "The Gambler" }
];

// Philosophical musings for the game
const musings = [
    "The degree of civilization in a society can be judged by entering its prisons... or observing its chess games.",
    "Every piece on the board suffers its own existential crisis.",
    "The knight moves in ways the pawn cannot comprehend.",
    "Is free will an illusion when every move is predetermined by strategy?",
    "The king's weakness is his greatest strength - he inspires sacrifice.",
    "Each captured piece represents a small death, a loss of potential.",
    "The chess board: a microcosm of human struggle and ambition.",
    "To sacrifice a queen is to embrace the nobility of suffering.",
    "Even in checkmate, there is a kind of liberation.",
    "The endgame reveals what was always hidden in the opening."
];

// === Initialization ===
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    setRandomQuote();
    setInterval(changeMusingPeriodically, 45000); // Change musing every 45 seconds
});

function initializeGame() {
    game = new Chess();
    console.log('Chess game initialized');
}

function setRandomQuote() {
    const quote = dostoevskiyQuotes[Math.floor(Math.random() * dostoevskiyQuotes.length)];
    document.getElementById('quote').textContent = `"${quote.text}"`;
    document.getElementById('quote').nextElementSibling.textContent = `— ${quote.author}`;
}

function changeMusingPeriodically() {
    const musingText = document.getElementById('musingText');
    if (musingText && gameMode) {
        const randomMusing = musings[Math.floor(Math.random() * musings.length)];
        musingText.style.opacity = '0';
        setTimeout(() => {
            musingText.textContent = randomMusing;
            musingText.style.opacity = '1';
        }, 500);
    }
}

// === Menu Navigation ===
function showMode(mode) {
    hideAllScreens();
    if (mode === 'online') {
        document.getElementById('onlineSetup').classList.add('active');
    } else if (mode === 'ai') {
        document.getElementById('aiSetup').classList.add('active');
    } else if (mode === 'local') {
        startLocalGame();
    }
}

function showSettings() {
    hideAllScreens();
    document.getElementById('settingsScreen').classList.add('active');
}

function showMenu() {
    if (confirm('Return to main menu? Current game will be lost.')) {
        backToMenu();
    }
}

function backToMenu() {
    hideAllScreens();
    document.getElementById('mainMenu').classList.add('active');
    cleanupGame();
}

function hideAllScreens() {
    document.querySelectorAll('.menu-screen, .game-screen').forEach(screen => {
        screen.classList.remove('active');
    });
}

function cleanupGame() {
    if (connection) {
        connection.close();
        connection = null;
    }
    if (peer) {
        peer.destroy();
        peer = null;
    }
    if (stockfish) {
        stockfish.terminate();
        stockfish = null;
    }
    game = new Chess();
    selectedSquare = null;
    gameMode = null;
}

// === Settings ===
function toggleSound() {
    settings.sound = document.getElementById('soundToggle').checked;
}

function toggleHighlights() {
    settings.highlights = document.getElementById('highlightToggle').checked;
}

function changeBoardTheme(theme) {
    settings.boardTheme = theme;
    const root = document.documentElement;
    
    if (theme === 'dark') {
        root.style.setProperty('--board-light', '#4a4a5a');
        root.style.setProperty('--board-dark', '#0a0a0f');
    } else if (theme === 'crimson') {
        root.style.setProperty('--board-light', '#a0616a');
        root.style.setProperty('--board-dark', '#2d1820');
    } else {
        root.style.setProperty('--board-light', '#d4af37');
        root.style.setProperty('--board-dark', '#1a1a28');
    }
}

// === AI Setup ===
function selectColor(color) {
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${color}Btn`).classList.add('active');
    
    if (color === 'random') {
        playerColor = Math.random() > 0.5 ? 'white' : 'black';
    } else {
        playerColor = color;
    }
}

function updateDifficulty(value) {
    aiDifficulty = parseInt(value);
    const labels = ['Novice', 'Easy', 'Medium', 'Hard', 'Expert', 'Master', 'Grandmaster'];
    const labelIndex = Math.min(Math.floor(value / 3), labels.length - 1);
    document.getElementById('difficultyValue').textContent = `${labels[labelIndex]} (${value})`;
}

function startAIGame() {
    gameMode = 'ai';
    initializeStockfish();
    hideAllScreens();
    document.getElementById('gameScreen').classList.add('active');
    document.getElementById('gameMode').textContent = 'vs AI';
    document.getElementById('aiAnalysis').style.display = 'block';
    document.getElementById('opponentName').textContent = 'Stockfish AI';
    renderBoard();
    
    if (playerColor === 'black') {
        setTimeout(() => makeAIMove(), 500);
    }
}

// === Local Game ===
function startLocalGame() {
    gameMode = 'local';
    hideAllScreens();
    document.getElementById('gameScreen').classList.add('active');
    document.getElementById('gameMode').textContent = 'Pass & Play';
    document.getElementById('opponentName').textContent = 'Player 2';
    document.getElementById('playerName').textContent = 'Player 1';
    renderBoard();
}

// === Online Multiplayer ===
function hostGame() {
    showLoading('Creating game room...');
    
    // Initialize PeerJS
    peer = new Peer();
    
    peer.on('open', (id) => {
        gameId = id;
        document.getElementById('gameId').value = id;
        document.getElementById('hostInfo').style.display = 'block';
        hideLoading();
    });
    
    peer.on('connection', (conn) => {
        connection = conn;
        setupConnection();
        document.getElementById('waitingMessage').textContent = 'Opponent connected! Starting game...';
        setTimeout(() => startOnlineGame(true), 1000);
    });
    
    peer.on('error', (err) => {
        console.error('Peer error:', err);
        alert('Connection error: ' + err.message);
        hideLoading();
    });
}

function joinGame() {
    const joinId = document.getElementById('joinGameId').value.trim();
    if (!joinId) {
        alert('Please enter a Game ID');
        return;
    }
    
    showLoading('Connecting to game...');
    
    peer = new Peer();
    
    peer.on('open', () => {
        connection = peer.connect(joinId);
        setupConnection();
        
        connection.on('open', () => {
            startOnlineGame(false);
        });
    });
    
    peer.on('error', (err) => {
        console.error('Peer error:', err);
        alert('Failed to connect. Check the Game ID and try again.');
        hideLoading();
    });
}

function setupConnection() {
    connection.on('data', (data) => {
        handleOnlineMove(data);
    });
    
    connection.on('close', () => {
        alert('Opponent disconnected');
        backToMenu();
    });
}

function startOnlineGame(isHost) {
    gameMode = 'online';
    playerColor = isHost ? 'white' : 'black';
    hideAllScreens();
    hideLoading();
    document.getElementById('gameScreen').classList.add('active');
    document.getElementById('gameMode').textContent = 'Online';
    document.getElementById('opponentName').textContent = 'Opponent';
    renderBoard();
}

function handleOnlineMove(data) {
    if (data.type === 'move') {
        game.move(data.move);
        renderBoard();
        updateMoveHistory();
        checkGameOver();
    } else if (data.type === 'resign') {
        showGameOver('Victory!', 'Your opponent has resigned.');
    } else if (data.type === 'draw_offer') {
        if (confirm('Your opponent offers a draw. Accept?')) {
            connection.send({ type: 'draw_accept' });
            showGameOver('Draw', 'Game ended by mutual agreement.');
        }
    } else if (data.type === 'draw_accept') {
        showGameOver('Draw', 'Game ended by mutual agreement.');
    }
}

function copyGameId() {
    const gameIdInput = document.getElementById('gameId');
    gameIdInput.select();
    document.execCommand('copy');
    
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✓ Copied!';
    setTimeout(() => {
        btn.textContent = originalText;
    }, 2000);
}

// === Board Rendering ===
function renderBoard() {
    const boardElement = document.getElementById('chessBoard');
    boardElement.innerHTML = '';
    
    const isPlayerWhite = (gameMode === 'local') || (playerColor === 'white');
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const displayRow = isPlayerWhite ? row : 7 - row;
            const displayCol = isPlayerWhite ? col : 7 - col;
            
            const file = String.fromCharCode(97 + displayCol); // a-h
            const rank = 8 - displayRow; // 8-1
            const square = file + rank;
            
            const squareElement = document.createElement('div');
            squareElement.className = 'square ' + ((displayRow + displayCol) % 2 === 0 ? 'light' : 'dark');
            squareElement.dataset.square = square;
            
            const piece = game.get(square);
            if (piece) {
                squareElement.innerHTML = `<span class="piece">${getPieceUnicode(piece)}</span>`;
            }
            
            squareElement.addEventListener('click', () => handleSquareClick(square));
            boardElement.appendChild(squareElement);
        }
    }
    
    updateTurnIndicator();
    updateCapturedPieces();
}

function getPieceUnicode(piece) {
    const pieces = {
        'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
        'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
    };
    return pieces[piece.type.toLowerCase()] || '';
}

function handleSquareClick(square) {
    // Check if it's the player's turn
    if (gameMode === 'ai' && game.turn() !== playerColor[0]) {
        return; // Not player's turn in AI mode
    }
    
    if (gameMode === 'online' && game.turn() !== playerColor[0]) {
        return; // Not player's turn in online mode
    }
    
    if (selectedSquare) {
        // Try to make a move
        const move = game.move({
            from: selectedSquare,
            to: square,
            promotion: 'q' // Always promote to queen for simplicity
        });
        
        if (move) {
            playSound('move');
            clearHighlights();
            selectedSquare = null;
            renderBoard();
            updateMoveHistory();
            
            // Send move to opponent in online mode
            if (gameMode === 'online' && connection) {
                connection.send({ type: 'move', move: move });
            }
            
            checkGameOver();
            
            // AI makes a move
            if (gameMode === 'ai' && !game.game_over()) {
                setTimeout(() => makeAIMove(), 500);
            }
        } else {
            // Invalid move, try selecting the clicked square
            clearHighlights();
            selectSquare(square);
        }
    } else {
        selectSquare(square);
    }
}

function selectSquare(square) {
    const piece = game.get(square);
    
    // Check if there's a piece and it belongs to the current player
    if (piece && piece.color === game.turn()) {
        selectedSquare = square;
        highlightSquare(square);
        highlightValidMoves(square);
        playSound('select');
    }
}

function highlightSquare(square) {
    const squareElement = document.querySelector(`[data-square="${square}"]`);
    if (squareElement) {
        squareElement.classList.add('selected');
    }
}

function highlightValidMoves(square) {
    if (!settings.highlights) return;
    
    const moves = game.moves({ square: square, verbose: true });
    moves.forEach(move => {
        const targetSquare = document.querySelector(`[data-square="${move.to}"]`);
        if (targetSquare) {
            if (move.captured) {
                targetSquare.classList.add('valid-move', 'valid-capture');
            } else {
                targetSquare.classList.add('valid-move');
            }
        }
    });
}

function clearHighlights() {
    document.querySelectorAll('.square').forEach(square => {
        square.classList.remove('selected', 'valid-move', 'valid-capture');
    });
    selectedSquare = null;
}

// === Game State Updates ===
function updateTurnIndicator() {
    const turnElement = document.getElementById('turnIndicator');
    turnElement.textContent = game.turn() === 'w' ? 'White' : 'Black';
    turnElement.style.color = game.turn() === 'w' ? '#e8e8e8' : '#a0a0a0';
}

function updateCapturedPieces() {
    const captured = getCapturedPieces();
    document.getElementById('capturedWhite').innerHTML = captured.white.map(p => 
        `<span class="captured-piece">${getPieceUnicode(p)}</span>`
    ).join('');
    document.getElementById('capturedBlack').innerHTML = captured.black.map(p => 
        `<span class="captured-piece">${getPieceUnicode(p)}</span>`
    ).join('');
}

function getCapturedPieces() {
    const allPieces = {
        white: ['♙','♙','♙','♙','♙','♙','♙','♙','♖','♘','♗','♕','♗','♘','♖'],
        black: ['♟','♟','♟','♟','♟','♟','♟','♟','♜','♞','♝','♛','♝','♞','♜']
    };
    
    const board = game.board();
    board.forEach(row => {
        row.forEach(piece => {
            if (piece) {
                const unicode = getPieceUnicode(piece);
                const color = piece.color === 'w' ? 'white' : 'black';
                const index = allPieces[color].indexOf(unicode);
                if (index > -1) {
                    allPieces[color].splice(index, 1);
                }
            }
        });
    });
    
    return {
        white: allPieces.black, // White captured black pieces
        black: allPieces.white  // Black captured white pieces
    };
}

function updateMoveHistory() {
    const history = game.history();
    const historyElement = document.getElementById('moveHistory');
    historyElement.innerHTML = '';
    
    for (let i = 0; i < history.length; i += 2) {
        const moveRow = document.createElement('div');
        moveRow.className = 'move-row';
        
        const moveNumber = document.createElement('span');
        moveNumber.className = 'move-number';
        moveNumber.textContent = `${Math.floor(i / 2) + 1}.`;
        
        const whiteMove = document.createElement('span');
        whiteMove.className = 'move-notation';
        whiteMove.textContent = history[i];
        
        const blackMove = document.createElement('span');
        blackMove.className = 'move-notation';
        blackMove.textContent = history[i + 1] || '';
        
        moveRow.appendChild(moveNumber);
        moveRow.appendChild(whiteMove);
        moveRow.appendChild(blackMove);
        historyElement.appendChild(moveRow);
    }
    
    // Scroll to bottom
    historyElement.scrollTop = historyElement.scrollHeight;
}

// === Stockfish AI ===
function initializeStockfish() {
    if (typeof createStockfishWorker !== 'undefined') {
        try {
            stockfish = createStockfishWorker();
            stockfish.postMessage('uci');
            stockfish.postMessage(`setoption name Skill Level value ${aiDifficulty}`);
        } catch (e) {
            console.error('Failed to load Stockfish:', e);
            // Use fallback simple AI
            stockfish = null;
        }
    } else {
        console.warn('Stockfish not available, using fallback AI');
        stockfish = null;
    }
}

function makeAIMove() {
    if (game.game_over()) return;
    
    if (stockfish) {
        // Use Stockfish AI
        const fen = game.fen();
        stockfish.postMessage(`position fen ${fen}`);
        stockfish.postMessage(`go depth ${Math.min(aiDifficulty, 15)}`);
        
        stockfish.onmessage = function(event) {
            const message = event.data;
            
            if (message.startsWith('bestmove')) {
                const bestMove = message.split(' ')[1];
                const from = bestMove.substring(0, 2);
                const to = bestMove.substring(2, 4);
                const promotion = bestMove.length > 4 ? bestMove[4] : undefined;
                
                const move = game.move({ from, to, promotion });
                
                if (move) {
                    playSound('move');
                    renderBoard();
                    updateMoveHistory();
                    checkGameOver();
                }
            }
        };
    } else {
        // Fallback: Random legal move
        const moves = game.moves({ verbose: true });
        if (moves.length > 0) {
            // Prioritize captures and center control
            let selectedMove = moves[0];
            
            // Look for captures first
            const captures = moves.filter(m => m.captured);
            if (captures.length > 0) {
                selectedMove = captures[Math.floor(Math.random() * captures.length)];
            } else {
                // Otherwise random move
                selectedMove = moves[Math.floor(Math.random() * moves.length)];
            }
            
            game.move(selectedMove);
            playSound('move');
            renderBoard();
            updateMoveHistory();
            checkGameOver();
        }
    }
}

// === Game Control ===
function undoMove() {
    if (game.history().length === 0) return;
    
    if (gameMode === 'ai') {
        game.undo(); // Undo AI move
        game.undo(); // Undo player move
    } else if (gameMode === 'local') {
        game.undo();
    } else {
        alert('Cannot undo in online mode');
        return;
    }
    
    renderBoard();
    updateMoveHistory();
}

function offerDraw() {
    if (gameMode === 'online' && connection) {
        connection.send({ type: 'draw_offer' });
        alert('Draw offer sent to opponent');
    } else if (gameMode === 'local') {
        if (confirm('Offer draw?')) {
            showGameOver('Draw', 'Game ended by mutual agreement.');
        }
    } else {
        if (confirm('Accept draw?')) {
            showGameOver('Draw', 'Game ended by mutual agreement.');
        }
    }
}

function resignGame() {
    if (confirm('Are you sure you want to resign?')) {
        if (gameMode === 'online' && connection) {
            connection.send({ type: 'resign' });
        }
        showGameOver('Defeat', 'You have resigned.');
    }
}

function checkGameOver() {
    if (game.game_over()) {
        let title, message;
        
        if (game.in_checkmate()) {
            const winner = game.turn() === 'w' ? 'Black' : 'White';
            title = (gameMode === 'local') ? `${winner} Wins!` : 
                    (winner.toLowerCase() === playerColor) ? 'Victory!' : 'Defeat';
            message = `Checkmate! ${winner} wins.`;
        } else if (game.in_draw()) {
            title = 'Draw';
            if (game.in_stalemate()) {
                message = 'Game ended in stalemate.';
            } else if (game.in_threefold_repetition()) {
                message = 'Draw by threefold repetition.';
            } else if (game.insufficient_material()) {
                message = 'Draw by insufficient material.';
            } else {
                message = 'Game ended in a draw.';
            }
        }
        
        setTimeout(() => showGameOver(title, message), 500);
    }
}

function showGameOver(title, message) {
    const modal = document.getElementById('gameOverModal');
    document.getElementById('gameOverTitle').textContent = title;
    document.getElementById('gameOverMessage').textContent = message;
    modal.classList.add('active');
    playSound('gameOver');
}

function rematch() {
    const modal = document.getElementById('gameOverModal');
    modal.classList.remove('active');
    game.reset();
    renderBoard();
    updateMoveHistory();
    
    if (gameMode === 'ai' && playerColor === 'black') {
        setTimeout(() => makeAIMove(), 500);
    }
}

// === Sound Effects ===
function playSound(type) {
    if (!settings.sound) return;
    
    // Create simple sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'move') {
        oscillator.frequency.value = 440;
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'select') {
        oscillator.frequency.value = 523;
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
    } else if (type === 'gameOver') {
        oscillator.frequency.value = 330;
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
}

// === Loading Screen ===
function showLoading(text) {
    document.getElementById('loadingText').textContent = text;
    document.getElementById('loadingScreen').classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingScreen').classList.remove('active');
}
