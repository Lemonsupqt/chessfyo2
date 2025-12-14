/**
 * The Brothers Gambit - Main Application
 * A Dostoevsky-themed Chess Experience
 */

// Dostoevsky quotes for atmosphere
const DOSTOEVSKY_QUOTES = [
    "The soul is healed by being with children... and by chess.",
    "Man is what he believes.",
    "The darker the night, the brighter the stars.",
    "Pain and suffering are always inevitable for a large intelligence and a deep heart.",
    "To live without hope is to cease to live.",
    "The cleverest of all, in my opinion, is the man who calls himself a fool at least once a month.",
    "Taking a new step, uttering a new word, is what people fear most.",
    "Power is given only to those who dare to lower themselves and pick it up.",
    "Man grows used to everything, the scoundrel!",
    "To go wrong in one's own way is better than to go right in someone else's.",
    "What is hell? I maintain that it is the suffering of being unable to love.",
    "Beauty will save the world.",
    "Realists do not fear the results of their study.",
    "It takes something more than intelligence to act intelligently.",
    "The secret of man's being is not only to live but to have something to live for.",
    "If you want to overcome the whole world, overcome yourself.",
    "Every man has reminiscences which he would not tell to everyone.",
    "Much unhappiness has come into the world because of bewilderment and things left unsaid.",
    "Above all, don't lie to yourself.",
    "Originality and the feeling of one's own dignity are achieved only through work and struggle."
];

class BrothersGambit {
    constructor() {
        // Core game components
        this.game = null;
        this.board = null;
        this.stockfish = null;
        this.multiplayer = null;
        this.sounds = null;
        
        // Game state
        this.mode = null; // 'local', 'online', 'ai', 'analysis'
        this.playerColor = 'w';
        this.aiDifficulty = 5;
        this.timeControl = 300; // 5 minutes in seconds
        this.timers = { w: 0, b: 0 };
        this.timerInterval = null;
        this.gameInProgress = false;
        
        // UI elements
        this.screens = {};
        this.panels = {};
        
        this.init();
    }

    init() {
        // Initialize components
        this.sounds = new SoundManager();
        this.stockfish = new StockfishEngine();
        this.multiplayer = new MultiplayerManager();
        
        // Cache DOM elements
        this.cacheElements();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start rotating quotes
        this.startQuoteRotation();
        
        // Check for join link
        this.checkJoinLink();
        
        console.log('The Brothers Gambit initialized');
    }

    cacheElements() {
        // Screens
        this.screens = {
            menu: document.getElementById('menu-screen'),
            setup: document.getElementById('setup-screen'),
            game: document.getElementById('game-screen')
        };
        
        // Setup panels
        this.panels = {
            onlineCreate: document.getElementById('online-create-panel'),
            onlineJoin: document.getElementById('online-join-panel'),
            ai: document.getElementById('ai-panel'),
            timer: document.getElementById('timer-panel')
        };
        
        // Modals
        this.modals = {
            promotion: document.getElementById('promotion-modal'),
            gameover: document.getElementById('gameover-modal'),
            loading: document.getElementById('loading-modal')
        };
    }

    setupEventListeners() {
        // Menu buttons
        document.querySelectorAll('.menu-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.handleMenuClick(mode);
            });
        });
        
        // Setup back button
        document.getElementById('setup-back').addEventListener('click', () => {
            this.showScreen('menu');
            this.multiplayer.disconnect();
        });
        
        // Difficulty buttons
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.aiDifficulty = parseInt(btn.dataset.level);
            });
        });
        
        // Color buttons
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const color = btn.dataset.color;
                this.playerColor = color === 'random' 
                    ? (Math.random() < 0.5 ? 'w' : 'b')
                    : color === 'white' ? 'w' : 'b';
            });
        });
        
        // Timer buttons
        document.querySelectorAll('.timer-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.timer-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.timeControl = parseInt(btn.dataset.time);
            });
        });
        
        // Start buttons
        document.getElementById('start-ai').addEventListener('click', () => this.startAIGame());
        document.getElementById('start-local').addEventListener('click', () => this.startLocalGame());
        
        // Online controls
        document.getElementById('copy-room').addEventListener('click', () => this.copyRoomCode());
        document.getElementById('share-link').addEventListener('click', () => this.shareLink());
        document.getElementById('join-game').addEventListener('click', () => this.joinOnlineGame());
        
        // Join code input
        const joinInput = document.getElementById('join-code');
        joinInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
        joinInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.joinOnlineGame();
        });
        
        // Game controls
        document.getElementById('flip-board').addEventListener('click', () => this.flipBoard());
        document.getElementById('undo-move').addEventListener('click', () => this.undoMove());
        document.getElementById('offer-draw').addEventListener('click', () => this.offerDraw());
        document.getElementById('resign-game').addEventListener('click', () => this.resignGame());
        document.getElementById('toggle-sound').addEventListener('click', () => this.toggleSound());
        
        // Game actions
        document.getElementById('export-pgn').addEventListener('click', () => this.exportPGN());
        document.getElementById('new-game').addEventListener('click', () => this.newGame());
        
        // Game over modal
        document.getElementById('play-again').addEventListener('click', () => this.playAgain());
        document.getElementById('return-menu').addEventListener('click', () => this.returnToMenu());
        
        // Multiplayer callbacks
        this.multiplayer.onConnected = (color) => this.onMultiplayerConnected(color);
        this.multiplayer.onDisconnected = () => this.onMultiplayerDisconnected();
        this.multiplayer.onMove = (move) => this.onMultiplayerMove(move);
        this.multiplayer.onMessage = (msg) => this.onMultiplayerMessage(msg);
        this.multiplayer.onError = (err) => this.onMultiplayerError(err);
    }

    handleMenuClick(mode) {
        switch (mode) {
            case 'local':
                this.showSetupScreen('timer');
                this.mode = 'local';
                break;
            case 'online-create':
                this.mode = 'online';
                this.createOnlineGame();
                break;
            case 'online-join':
                this.showSetupScreen('online-join');
                this.mode = 'online';
                break;
            case 'ai':
                this.showSetupScreen('ai');
                this.mode = 'ai';
                break;
            case 'analysis':
                this.mode = 'analysis';
                this.startAnalysisMode();
                break;
        }
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => screen.classList.remove('active'));
        this.screens[screenName].classList.add('active');
    }

    showSetupScreen(panelName) {
        this.showScreen('setup');
        Object.values(this.panels).forEach(panel => panel.classList.remove('active'));
        
        const titles = {
            'online-create': 'Create Online Game',
            'online-join': 'Join Online Game',
            'ai': 'Challenge the AI',
            'timer': 'Game Settings'
        };
        
        document.getElementById('setup-title').textContent = titles[panelName] || 'Setup';
        
        if (panelName === 'ai') {
            this.panels.ai.classList.add('active');
        } else if (panelName === 'online-create') {
            this.panels.onlineCreate.classList.add('active');
        } else if (panelName === 'online-join') {
            this.panels.onlineJoin.classList.add('active');
        } else if (panelName === 'timer') {
            this.panels.timer.classList.add('active');
        }
    }

    showModal(modalName) {
        this.modals[modalName].classList.add('active');
    }

    hideModal(modalName) {
        this.modals[modalName].classList.remove('active');
    }

    showLoading(text = 'Loading...') {
        document.getElementById('loading-text').textContent = text;
        this.showModal('loading');
    }

    hideLoading() {
        this.hideModal('loading');
    }

    showToast(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    // Quote rotation
    startQuoteRotation() {
        const quoteEl = document.getElementById('rotating-quote');
        let index = Math.floor(Math.random() * DOSTOEVSKY_QUOTES.length);
        
        const updateQuote = () => {
            quoteEl.style.opacity = 0;
            setTimeout(() => {
                quoteEl.textContent = `"${DOSTOEVSKY_QUOTES[index]}"`;
                quoteEl.style.opacity = 1;
                index = (index + 1) % DOSTOEVSKY_QUOTES.length;
            }, 300);
        };
        
        updateQuote();
        setInterval(updateQuote, 8000);
    }

    // Check for join link in URL
    checkJoinLink() {
        const params = new URLSearchParams(window.location.search);
        const joinCode = params.get('join');
        
        if (joinCode) {
            this.mode = 'online';
            document.getElementById('join-code').value = joinCode.toUpperCase();
            this.showSetupScreen('online-join');
            // Clear the URL
            window.history.replaceState({}, '', window.location.pathname);
        }
    }

    // Game initialization
    initGame() {
        this.game = new Chess();
        this.board = new ChessBoard('chess-board', this.game, {
            orientation: this.playerColor === 'w' ? 'white' : 'black',
            interactive: true,
            onMove: (move) => this.onMove(move)
        });
    }

    startLocalGame() {
        this.initGame();
        this.playerColor = 'w';
        this.board.setOrientation('white');
        this.board.setInteractive(true);
        
        // Initialize timers
        this.timers = { 
            w: this.timeControl, 
            b: this.timeControl 
        };
        
        this.showScreen('game');
        this.updateGameInfo();
        this.startTimer();
        this.sounds.gameStart();
        this.gameInProgress = true;
        
        this.setRandomGameQuote();
    }

    async startAIGame() {
        this.initGame();
        
        // Set player color
        const colorBtn = document.querySelector('.color-btn.active');
        let color = colorBtn?.dataset.color || 'white';
        if (color === 'random') {
            color = Math.random() < 0.5 ? 'white' : 'black';
        }
        this.playerColor = color === 'white' ? 'w' : 'b';
        
        this.board.setOrientation(color);
        
        // Set AI difficulty
        this.stockfish.setDifficulty(this.aiDifficulty);
        
        // Initialize timers
        this.timers = { w: this.timeControl, b: this.timeControl };
        
        this.showScreen('game');
        this.updateGameInfo();
        this.startTimer();
        this.sounds.gameStart();
        this.gameInProgress = true;
        
        this.setRandomGameQuote();
        
        // If playing as black, let AI move first
        if (this.playerColor === 'b') {
            this.board.setInteractive(false);
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    startAnalysisMode() {
        this.initGame();
        this.playerColor = 'w';
        this.timeControl = 0;
        
        this.board.setOrientation('white');
        this.board.setInteractive(true);
        
        this.showScreen('game');
        this.updateGameInfo();
        this.gameInProgress = true;
        
        document.getElementById('player-timer').textContent = '∞';
        document.getElementById('opponent-timer').textContent = '∞';
        
        this.setRandomGameQuote();
    }

    async createOnlineGame() {
        this.showSetupScreen('online-create');
        document.getElementById('room-code').textContent = '------';
        
        try {
            const code = await this.multiplayer.createRoom();
            document.getElementById('room-code').textContent = code;
        } catch (error) {
            console.error('Failed to create room:', error);
            this.showToast('Failed to create game room');
            this.showScreen('menu');
        }
    }

    async joinOnlineGame() {
        const code = document.getElementById('join-code').value.trim();
        if (code.length !== 6) {
            this.showToast('Please enter a valid 6-character room code');
            return;
        }
        
        this.showLoading('Connecting to game...');
        
        try {
            await this.multiplayer.joinRoom(code);
        } catch (error) {
            console.error('Failed to join room:', error);
            this.hideLoading();
            this.showToast(error.message || 'Failed to join game');
        }
    }

    onMultiplayerConnected(color) {
        this.hideLoading();
        this.playerColor = color;
        
        this.initGame();
        this.board.setOrientation(color === 'w' ? 'white' : 'black');
        
        // Only allow moves on your turn
        this.board.setInteractive(this.game.turn === this.playerColor);
        
        this.timers = { w: this.timeControl, b: this.timeControl };
        
        this.showScreen('game');
        this.updateGameInfo();
        this.startTimer();
        this.sounds.gameStart();
        this.gameInProgress = true;
        
        const colorName = color === 'w' ? 'White' : 'Black';
        this.showToast(`Connected! You play as ${colorName}`);
        this.setRandomGameQuote();
    }

    onMultiplayerDisconnected() {
        if (this.gameInProgress) {
            this.showToast('Opponent disconnected');
            this.endGame(this.playerColor, 'opponent disconnected');
        }
    }

    onMultiplayerMove(move) {
        const result = this.game.move(move.from, move.to, move.promotion || 'q');
        if (result) {
            this.board.lastMove = { from: move.from, to: move.to };
            this.board.render();
            this.sounds.playMoveSound(result);
            this.updateMovesList();
            this.updateGameInfo();
            
            // Enable moves for this player
            this.board.setInteractive(this.game.turn === this.playerColor);
            
            // Check for game over
            if (this.game.gameOver) {
                this.handleGameOver();
            }
        }
    }

    onMultiplayerMessage(msg) {
        switch (msg.type) {
            case 'resign':
                this.endGame(this.playerColor, 'opponent resigned');
                break;
            case 'drawOffer':
                if (confirm('Your opponent offers a draw. Accept?')) {
                    this.multiplayer.acceptDraw();
                    this.endGame(null, 'draw by agreement');
                } else {
                    this.multiplayer.declineDraw();
                }
                break;
            case 'drawAccept':
                this.endGame(null, 'draw by agreement');
                break;
            case 'drawDecline':
                this.showToast('Draw offer declined');
                break;
            case 'rematch':
                if (confirm('Your opponent wants a rematch. Accept?')) {
                    this.multiplayer.acceptRematch();
                    this.startRematch();
                }
                break;
            case 'rematchAccept':
                this.startRematch();
                break;
        }
    }

    onMultiplayerError(error) {
        this.showToast('Connection error: ' + error.message);
    }

    // Move handling
    onMove(move) {
        this.sounds.playMoveSound(move);
        this.updateMovesList();
        this.updateGameInfo();
        
        // Check for game over
        if (this.game.gameOver) {
            this.handleGameOver();
            return;
        }
        
        // Handle based on mode
        if (this.mode === 'online') {
            this.multiplayer.sendMove(move);
            this.board.setInteractive(false);
        } else if (this.mode === 'ai') {
            this.board.setInteractive(false);
            this.showThinking(true);
            setTimeout(() => this.makeAIMove(), 300);
        }
    }

    makeAIMove() {
        if (this.game.gameOver) return;
        
        this.stockfish.findBestMove(this.game.getFEN(), (aiMove) => {
            this.showThinking(false);
            
            if (aiMove && !this.game.gameOver) {
                const result = this.game.move(aiMove.from, aiMove.to, aiMove.promotion || 'q');
                if (result) {
                    this.board.lastMove = { from: aiMove.from, to: aiMove.to };
                    this.board.render();
                    this.sounds.playMoveSound(result);
                    this.updateMovesList();
                    this.updateGameInfo();
                    
                    if (this.game.gameOver) {
                        this.handleGameOver();
                    } else {
                        this.board.setInteractive(true);
                    }
                }
            }
        });
    }

    showThinking(show) {
        const statusEl = document.querySelector('.status-text');
        if (show) {
            statusEl.innerHTML = `AI thinking... <span class="thinking-dots"><span></span><span></span><span></span></span>`;
        } else {
            this.updateGameInfo();
        }
    }

    // Timer
    startTimer() {
        if (this.timeControl === 0) return;
        
        this.stopTimer();
        
        this.timerInterval = setInterval(() => {
            if (!this.gameInProgress || this.game.gameOver) {
                this.stopTimer();
                return;
            }
            
            const currentColor = this.game.turn;
            this.timers[currentColor]--;
            
            this.updateTimerDisplay();
            
            // Check for time out
            if (this.timers[currentColor] <= 0) {
                this.timers[currentColor] = 0;
                const winner = currentColor === 'w' ? 'b' : 'w';
                this.endGame(winner, 'time out');
            }
            
            // Low time warning
            if (this.timers[currentColor] <= 10 && this.timers[currentColor] > 0) {
                this.sounds.lowTime();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        const formatTime = (seconds) => {
            if (seconds === undefined || seconds === null) return '--:--';
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };
        
        const playerTimer = document.getElementById('player-timer');
        const opponentTimer = document.getElementById('opponent-timer');
        
        const playerTime = this.timers[this.playerColor];
        const opponentTime = this.timers[this.playerColor === 'w' ? 'b' : 'w'];
        
        playerTimer.textContent = this.timeControl > 0 ? formatTime(playerTime) : '∞';
        opponentTimer.textContent = this.timeControl > 0 ? formatTime(opponentTime) : '∞';
        
        // Highlight active timer
        playerTimer.classList.toggle('active', this.game.turn === this.playerColor);
        opponentTimer.classList.toggle('active', this.game.turn !== this.playerColor);
        
        // Low time warning
        playerTimer.classList.toggle('low-time', playerTime <= 30 && playerTime > 0);
        opponentTimer.classList.toggle('low-time', opponentTime <= 30 && opponentTime > 0);
    }

    // UI updates
    updateGameInfo() {
        // Update turn indicator
        const statusText = document.querySelector('.status-text');
        if (this.game.gameOver) {
            statusText.textContent = this.getResultText();
        } else {
            const turnColor = this.game.turn === 'w' ? 'White' : 'Black';
            statusText.textContent = `${turnColor} to move`;
            if (this.game.isInCheck()) {
                statusText.textContent += ' — Check!';
            }
        }
        
        // Update captured pieces
        this.updateCapturedPieces();
        
        // Update timer display
        this.updateTimerDisplay();
        
        // Update player names based on mode
        this.updatePlayerNames();
    }

    updatePlayerNames() {
        const playerName = document.getElementById('player-name');
        const opponentName = document.getElementById('opponent-name');
        const playerAvatar = document.querySelector('.player-info-self .player-avatar');
        const opponentAvatar = document.querySelector('.opponent-info .player-avatar');
        
        playerAvatar.textContent = this.playerColor === 'w' ? '♔' : '♚';
        opponentAvatar.textContent = this.playerColor === 'w' ? '♚' : '♔';
        
        switch (this.mode) {
            case 'ai':
                playerName.textContent = 'You';
                const aiNames = ['Raskolnikov', 'Myshkin', 'Karamazov', 'Grand Inquisitor', 'Dostoevsky'];
                const aiIndex = Math.floor((this.aiDifficulty - 1) / 4);
                opponentName.textContent = aiNames[Math.min(aiIndex, aiNames.length - 1)];
                break;
            case 'online':
                playerName.textContent = 'You';
                opponentName.textContent = 'Opponent';
                break;
            case 'local':
                playerName.textContent = 'White';
                opponentName.textContent = 'Black';
                break;
            case 'analysis':
                playerName.textContent = 'Analysis';
                opponentName.textContent = 'Mode';
                break;
        }
    }

    updateCapturedPieces() {
        const whiteCaptured = [];
        const blackCaptured = [];
        
        for (const move of this.game.moveHistory) {
            if (move.captured) {
                const symbol = { 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟' };
                if (move.color === 'w') {
                    blackCaptured.push(symbol[move.captured]);
                } else {
                    whiteCaptured.push(symbol[move.captured]);
                }
            }
        }
        
        const playerCaptured = document.getElementById('player-captured');
        const opponentCaptured = document.getElementById('opponent-captured');
        
        if (this.playerColor === 'w') {
            playerCaptured.textContent = blackCaptured.join('');
            opponentCaptured.textContent = whiteCaptured.join('');
        } else {
            playerCaptured.textContent = whiteCaptured.join('');
            opponentCaptured.textContent = blackCaptured.join('');
        }
    }

    updateMovesList() {
        const movesList = document.getElementById('moves-list');
        movesList.innerHTML = '';
        
        for (let i = 0; i < this.game.moveHistory.length; i += 2) {
            const moveNum = Math.floor(i / 2) + 1;
            const whiteMove = this.game.moveHistory[i];
            const blackMove = this.game.moveHistory[i + 1];
            
            const row = document.createElement('div');
            row.className = 'move-row';
            row.innerHTML = `
                <span class="move-number">${moveNum}.</span>
                <span class="move" data-index="${i}">${whiteMove.san}</span>
                <span class="move" data-index="${i + 1}">${blackMove ? blackMove.san : ''}</span>
            `;
            movesList.appendChild(row);
        }
        
        // Scroll to bottom
        movesList.scrollTop = movesList.scrollHeight;
    }

    setRandomGameQuote() {
        const quoteEl = document.getElementById('game-quote');
        const quote = DOSTOEVSKY_QUOTES[Math.floor(Math.random() * DOSTOEVSKY_QUOTES.length)];
        quoteEl.textContent = `"${quote}"`;
    }

    // Game end
    handleGameOver() {
        this.gameInProgress = false;
        this.stopTimer();
        
        const result = this.game.gameResult;
        this.showGameOverModal(result.winner, result.reason);
    }

    endGame(winner, reason) {
        this.game.gameOver = true;
        this.game.gameResult = { winner, reason };
        this.gameInProgress = false;
        this.stopTimer();
        
        this.board.setInteractive(false);
        this.showGameOverModal(winner, reason);
    }

    showGameOverModal(winner, reason) {
        const icon = document.getElementById('result-icon');
        const title = document.getElementById('result-title');
        const reasonEl = document.getElementById('result-reason');
        const quoteEl = document.getElementById('result-quote');
        
        if (winner === null) {
            icon.textContent = '½';
            title.textContent = 'Draw';
            reasonEl.textContent = this.formatReason(reason);
            this.sounds.draw();
        } else if ((winner === this.playerColor) || (this.mode === 'local')) {
            icon.textContent = '♔';
            if (this.mode === 'local') {
                title.textContent = `${winner === 'w' ? 'White' : 'Black'} Wins!`;
            } else {
                title.textContent = 'Victory!';
            }
            reasonEl.textContent = this.formatReason(reason);
            this.sounds.checkmate();
        } else {
            icon.textContent = '♚';
            title.textContent = 'Defeat';
            reasonEl.textContent = this.formatReason(reason);
            this.sounds.gameEnd();
        }
        
        quoteEl.textContent = `"${DOSTOEVSKY_QUOTES[Math.floor(Math.random() * DOSTOEVSKY_QUOTES.length)]}"`;
        
        this.showModal('gameover');
    }

    formatReason(reason) {
        const reasons = {
            'checkmate': 'Checkmate',
            'resignation': 'Resignation',
            'time out': 'Time Out',
            'stalemate': 'Stalemate',
            'insufficient material': 'Insufficient Material',
            'threefold repetition': 'Threefold Repetition',
            'fifty-move rule': 'Fifty-Move Rule',
            'agreement': 'By Agreement',
            'opponent disconnected': 'Opponent Disconnected'
        };
        return reasons[reason] || reason;
    }

    getResultText() {
        if (!this.game.gameResult) return 'Game Over';
        
        const { winner, reason } = this.game.gameResult;
        if (winner === null) {
            return `Draw — ${this.formatReason(reason)}`;
        }
        return `${winner === 'w' ? 'White' : 'Black'} wins by ${this.formatReason(reason)}`;
    }

    // Controls
    flipBoard() {
        this.board.flip();
    }

    undoMove() {
        if (this.mode === 'online') {
            this.showToast('Cannot undo in online games');
            return;
        }
        
        if (this.mode === 'ai' && this.game.moveHistory.length >= 2) {
            // Undo both player and AI move
            this.game.undo();
            this.game.undo();
        } else {
            this.game.undo();
        }
        
        this.board.lastMove = null;
        this.board.render();
        this.updateMovesList();
        this.updateGameInfo();
        this.board.setInteractive(true);
    }

    offerDraw() {
        if (this.mode === 'online') {
            this.multiplayer.offerDraw();
            this.showToast('Draw offered');
        } else if (this.mode === 'ai') {
            // AI always declines draws (for now)
            this.showToast('The AI declines your draw offer');
        } else {
            if (confirm('Agree to a draw?')) {
                this.endGame(null, 'agreement');
            }
        }
    }

    resignGame() {
        if (!this.gameInProgress) return;
        
        if (confirm('Are you sure you want to resign?')) {
            if (this.mode === 'online') {
                this.multiplayer.sendResign();
            }
            const winner = this.playerColor === 'w' ? 'b' : 'w';
            this.endGame(winner, 'resignation');
        }
    }

    toggleSound() {
        const enabled = this.sounds.toggle();
        const btn = document.getElementById('toggle-sound');
        btn.textContent = enabled ? '🔊' : '🔇';
        btn.classList.toggle('active', !enabled);
    }

    exportPGN() {
        const headers = {};
        
        switch (this.mode) {
            case 'ai':
                headers.White = this.playerColor === 'w' ? 'Player' : 'Stockfish AI';
                headers.Black = this.playerColor === 'b' ? 'Player' : 'Stockfish AI';
                break;
            case 'online':
                headers.White = this.playerColor === 'w' ? 'You' : 'Opponent';
                headers.Black = this.playerColor === 'b' ? 'You' : 'Opponent';
                break;
        }
        
        const pgn = this.game.toPGN(headers);
        
        // Create download
        const blob = new Blob([pgn], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `brothers-gambit-${Date.now()}.pgn`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('PGN exported');
    }

    newGame() {
        if (this.gameInProgress && !confirm('Start a new game? Current progress will be lost.')) {
            return;
        }
        
        this.multiplayer.disconnect();
        this.returnToMenu();
    }

    playAgain() {
        this.hideModal('gameover');
        
        if (this.mode === 'online') {
            this.multiplayer.sendRematch();
            this.showToast('Rematch request sent');
        } else if (this.mode === 'ai') {
            this.startAIGame();
        } else if (this.mode === 'local') {
            this.startLocalGame();
        } else {
            this.startAnalysisMode();
        }
    }

    startRematch() {
        // Swap colors
        this.playerColor = this.playerColor === 'w' ? 'b' : 'w';
        
        this.game.reset();
        this.board.setOrientation(this.playerColor === 'w' ? 'white' : 'black');
        this.board.lastMove = null;
        this.board.render();
        
        this.timers = { w: this.timeControl, b: this.timeControl };
        
        this.board.setInteractive(this.game.turn === this.playerColor);
        this.updateGameInfo();
        this.updateMovesList();
        this.startTimer();
        this.sounds.gameStart();
        this.gameInProgress = true;
        
        this.setRandomGameQuote();
    }

    returnToMenu() {
        this.hideModal('gameover');
        this.gameInProgress = false;
        this.stopTimer();
        this.multiplayer.disconnect();
        this.showScreen('menu');
    }

    copyRoomCode() {
        const code = this.multiplayer.roomCode;
        if (code) {
            navigator.clipboard.writeText(code).then(() => {
                this.showToast('Room code copied!');
            }).catch(() => {
                this.showToast('Failed to copy');
            });
        }
    }

    shareLink() {
        const link = this.multiplayer.getShareableLink();
        
        if (navigator.share) {
            navigator.share({
                title: 'The Brothers Gambit',
                text: 'Join my chess game!',
                url: link
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(link).then(() => {
                this.showToast('Link copied to clipboard!');
            }).catch(() => {
                this.showToast('Failed to copy link');
            });
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BrothersGambit();
});
