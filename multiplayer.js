// ========================================
// MULTIPLAYER - PEER-TO-PEER FUNCTIONALITY
// ========================================

class MultiplayerManager {
    constructor(chessEngine) {
        this.engine = chessEngine;
        this.peer = null;
        this.connection = null;
        this.roomCode = null;
        this.playerName = null;
        this.playerColor = null;
        this.isHost = false;
        this.opponentName = null;
        this.connected = false;
    }
    
    initialize() {
        const gameMode = localStorage.getItem('gameMode');
        
        if (gameMode !== 'online') {
            return;
        }
        
        this.roomCode = localStorage.getItem('roomCode');
        this.playerName = localStorage.getItem('playerName');
        this.isHost = localStorage.getItem('isHost') === 'true';
        this.playerColor = localStorage.getItem('playerColor');
        
        // Show multiplayer UI
        document.getElementById('multiplayerInfo').style.display = 'block';
        document.getElementById('chatBox').style.display = 'block';
        document.getElementById('displayRoomCode').textContent = this.roomCode;
        document.getElementById('yourColor').textContent = this.playerColor.charAt(0).toUpperCase() + this.playerColor.slice(1);
        
        // Update player names
        if (this.playerColor === 'white') {
            document.getElementById('blackPlayerName').textContent = 'Waiting for opponent...';
        }
        
        // Initialize PeerJS
        this.setupPeer();
        
        // Set up chat
        this.setupChat();
        
        // Listen for moves
        this.engine.setOnMoveCallback((move) => this.sendMove(move));
    }
    
    setupPeer() {
        // Create peer with room code as ID (for host) or random ID (for joiner)
        const peerId = this.isHost ? `chess-${this.roomCode}` : `chess-player-${Math.random().toString(36).substring(7)}`;
        
        this.peer = new Peer(peerId, {
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        });
        
        this.peer.on('open', (id) => {
            console.log('Peer connection opened:', id);
            
            if (this.isHost) {
                // Host: wait for connection
                this.peer.on('connection', (conn) => {
                    this.handleConnection(conn);
                });
            } else {
                // Joiner: connect to host
                const hostId = `chess-${this.roomCode}`;
                this.connection = this.peer.connect(hostId);
                this.handleConnection(this.connection);
            }
        });
        
        this.peer.on('error', (err) => {
            console.error('Peer error:', err);
            this.updateConnectionStatus('Connection error');
            
            if (err.type === 'peer-unavailable') {
                alert('Room not found. Please check the room code and try again.');
            }
        });
    }
    
    handleConnection(conn) {
        this.connection = conn;
        
        conn.on('open', () => {
            console.log('Connection established');
            this.connected = true;
            this.updateConnectionStatus('Connected');
            
            // Send initial handshake
            this.send({
                type: 'handshake',
                playerName: this.playerName,
                color: this.playerColor
            });
            
            // If host, sync the current board state
            if (this.isHost) {
                this.syncGameState();
            }
        });
        
        conn.on('data', (data) => {
            this.handleMessage(data);
        });
        
        conn.on('close', () => {
            console.log('Connection closed');
            this.connected = false;
            this.updateConnectionStatus('Disconnected');
            alert('Opponent disconnected');
        });
        
        conn.on('error', (err) => {
            console.error('Connection error:', err);
            this.updateConnectionStatus('Connection error');
        });
    }
    
    handleMessage(data) {
        switch (data.type) {
            case 'handshake':
                this.opponentName = data.playerName;
                const opponentColor = data.color === 'white' ? 'Black' : 'White';
                document.getElementById('blackPlayerName').textContent = data.playerName;
                this.addChatMessage('System', `${data.playerName} joined as ${opponentColor}`);
                break;
                
            case 'move':
                // Opponent made a move
                const game = this.engine.getGame();
                const move = game.move(data.move);
                if (move) {
                    this.engine.initializeBoard();
                    this.engine.updateDisplay();
                    this.engine.updateMoveHistory();
                    this.engine.checkGameState();
                }
                break;
                
            case 'chat':
                this.addChatMessage(data.sender, data.message);
                break;
                
            case 'reset':
                this.engine.reset();
                this.addChatMessage('System', 'Game reset by opponent');
                break;
                
            case 'sync':
                // Sync game state (for joiners)
                if (data.fen) {
                    this.engine.loadPosition(data.fen);
                }
                break;
        }
    }
    
    send(data) {
        if (this.connection && this.connected) {
            try {
                this.connection.send(data);
            } catch (err) {
                console.error('Error sending data:', err);
            }
        }
    }
    
    sendMove(move) {
        // Only send move if it's our turn
        const game = this.engine.getGame();
        const currentTurn = game.turn();
        const ourTurn = (this.playerColor === 'white' && currentTurn === 'b') || 
                        (this.playerColor === 'black' && currentTurn === 'w');
        
        if (!ourTurn) {
            this.send({
                type: 'move',
                move: {
                    from: move.from,
                    to: move.to,
                    promotion: move.promotion
                }
            });
        }
    }
    
    syncGameState() {
        const game = this.engine.getGame();
        this.send({
            type: 'sync',
            fen: game.fen()
        });
    }
    
    sendReset() {
        this.send({
            type: 'reset'
        });
    }
    
    setupChat() {
        const chatInput = document.getElementById('chatInput');
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
    }
    
    sendChatMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (!message) return;
        
        this.send({
            type: 'chat',
            sender: this.playerName,
            message: message
        });
        
        this.addChatMessage(this.playerName + ' (You)', message);
        chatInput.value = '';
    }
    
    addChatMessage(sender, message) {
        const chatMessages = document.getElementById('chatMessages');
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        messageElement.innerHTML = `
            <div class="message-sender">${sender}</div>
            <div class="message-text">${message}</div>
        `;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            statusElement.textContent = status;
            
            if (status === 'Connected') {
                statusElement.style.color = 'var(--accent-gold)';
            } else {
                statusElement.style.color = 'var(--accent-red)';
            }
        }
    }
    
    canMove() {
        // Check if it's this player's turn
        const game = this.engine.getGame();
        const currentTurn = game.turn();
        return (this.playerColor === 'white' && currentTurn === 'w') || 
               (this.playerColor === 'black' && currentTurn === 'b');
    }
    
    destroy() {
        if (this.connection) {
            this.connection.close();
        }
        if (this.peer) {
            this.peer.destroy();
        }
    }
}

// Make sendMessage available globally
function sendMessage() {
    if (window.multiplayerManager) {
        window.multiplayerManager.sendChatMessage();
    }
}
