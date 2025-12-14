// ========================================
// STOCKFISH INTEGRATION
// ========================================

class StockfishEngine {
    constructor(chessEngine) {
        this.engine = chessEngine;
        this.stockfish = null;
        this.isThinking = false;
        this.difficulty = 5; // Default depth
        this.isActive = false;
    }
    
    initialize() {
        const gameMode = localStorage.getItem('gameMode');
        
        if (gameMode !== 'ai') {
            return;
        }
        
        this.isActive = true;
        
        // Show AI controls
        document.getElementById('aiControls').style.display = 'block';
        document.getElementById('blackPlayerName').textContent = 'Stockfish AI';
        
        // Initialize Stockfish using web worker
        this.initializeStockfish();
        
        // Listen for player moves
        this.engine.setOnMoveCallback((move) => this.onPlayerMove(move));
    }
    
    initializeStockfish() {
        // Use Stockfish.js from CDN via web worker
        try {
            // Create stockfish using the WASM version
            this.stockfish = new Worker('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js');
            
            this.stockfish.onmessage = (event) => {
                this.handleEngineMessage(event.data);
            };
            
            // Initialize engine
            this.stockfish.postMessage('uci');
            this.stockfish.postMessage('isready');
            
            this.updateAiStatus('Stockfish ready');
        } catch (error) {
            console.error('Failed to load Stockfish:', error);
            this.updateAiStatus('AI unavailable - using random moves');
            // Fallback to simple random AI
            this.useSimpleAI = true;
        }
    }
    
    handleEngineMessage(message) {
        console.log('Stockfish:', message);
        
        if (message.startsWith('bestmove')) {
            const match = message.match(/bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?/);
            if (match) {
                const from = match[1];
                const to = match[2];
                const promotion = match[3];
                
                this.makeAiMove(from, to, promotion);
            }
        }
    }
    
    onPlayerMove(move) {
        if (!this.isActive) return;
        
        // After player moves (white), it's AI's turn (black)
        const game = this.engine.getGame();
        if (game.turn() === 'b' && !game.game_over()) {
            setTimeout(() => {
                this.makeMove();
            }, 500); // Small delay to make it feel more natural
        }
    }
    
    makeMove() {
        if (this.isThinking) return;
        
        this.isThinking = true;
        this.showThinking(true);
        this.updateAiStatus('Thinking...');
        
        const game = this.engine.getGame();
        
        if (this.useSimpleAI || !this.stockfish) {
            // Fallback: use random legal moves
            setTimeout(() => {
                this.makeRandomMove();
            }, 1000);
        } else {
            // Use Stockfish
            const fen = game.fen();
            this.stockfish.postMessage(`position fen ${fen}`);
            this.stockfish.postMessage(`go depth ${this.difficulty}`);
        }
    }
    
    makeRandomMove() {
        const game = this.engine.getGame();
        const moves = game.moves({ verbose: true });
        
        if (moves.length === 0) return;
        
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        this.makeAiMove(randomMove.from, randomMove.to, randomMove.promotion);
    }
    
    makeAiMove(from, to, promotion) {
        const game = this.engine.getGame();
        
        const move = game.move({
            from: from,
            to: to,
            promotion: promotion || 'q'
        });
        
        if (move) {
            this.engine.initializeBoard();
            this.engine.updateDisplay();
            this.engine.updateMoveHistory();
            this.engine.checkGameState();
            
            this.updateAiStatus(`Last move: ${move.san}`);
        }
        
        this.isThinking = false;
        this.showThinking(false);
    }
    
    showThinking(show) {
        const indicator = document.getElementById('thinkingIndicator');
        indicator.style.display = show ? 'flex' : 'none';
    }
    
    updateAiStatus(status) {
        const statusElement = document.getElementById('aiStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }
    
    changeDifficulty(depth) {
        this.difficulty = depth;
        this.updateAiStatus(`Difficulty changed to depth ${depth}`);
    }
    
    destroy() {
        if (this.stockfish) {
            this.stockfish.postMessage('quit');
            this.stockfish.terminate();
        }
    }
}

function changeDifficulty() {
    const difficulty = parseInt(document.getElementById('aiDifficulty').value);
    if (window.stockfishEngine) {
        window.stockfishEngine.changeDifficulty(difficulty);
    }
}
