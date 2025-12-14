/**
 * THE GRAND INQUISITOR'S CHESS
 * P2P Multiplayer Module using PeerJS
 */

class MultiplayerManager {
    constructor() {
        this.peer = null;
        this.connection = null;
        this.isHost = false;
        this.peerId = null;
        this.opponentId = null;
        this.isConnected = false;
        
        // Callbacks
        this.onConnected = null;
        this.onDisconnected = null;
        this.onGameStart = null;
        this.onMove = null;
        this.onDrawOffer = null;
        this.onResign = null;
        this.onChat = null;
        this.onError = null;
        
        // Game state
        this.gameSettings = null;
        this.playerColor = null;
    }

    /**
     * Generate a unique game code
     */
    generateGameCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    /**
     * Initialize PeerJS and create a new game
     */
    async createGame(settings = {}) {
        return new Promise((resolve, reject) => {
            try {
                const gameCode = this.generateGameCode();
                const peerId = `dostoevsky-chess-${gameCode}`;
                
                this.peer = new Peer(peerId, {
                    debug: 1
                });
                
                this.peer.on('open', (id) => {
                    console.log('Peer created with ID:', id);
                    this.peerId = id;
                    this.isHost = true;
                    this.playerColor = Math.random() < 0.5 ? 'white' : 'black';
                    this.gameSettings = {
                        ...settings,
                        hostColor: this.playerColor
                    };
                    
                    resolve({
                        gameCode,
                        peerId: id,
                        playerColor: this.playerColor
                    });
                });
                
                this.peer.on('connection', (conn) => {
                    this.handleConnection(conn);
                });
                
                this.peer.on('error', (err) => {
                    console.error('Peer error:', err);
                    if (err.type === 'unavailable-id') {
                        // Try again with a new code
                        this.peer.destroy();
                        this.createGame(settings).then(resolve).catch(reject);
                    } else {
                        if (this.onError) this.onError(err);
                        reject(err);
                    }
                });
                
                this.peer.on('disconnected', () => {
                    console.log('Peer disconnected');
                    if (this.onDisconnected) this.onDisconnected();
                });
                
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Join an existing game
     */
    async joinGame(gameCode) {
        return new Promise((resolve, reject) => {
            try {
                const targetPeerId = `dostoevsky-chess-${gameCode.toUpperCase()}`;
                
                this.peer = new Peer({
                    debug: 1
                });
                
                this.peer.on('open', (id) => {
                    console.log('Peer created with ID:', id);
                    this.peerId = id;
                    this.isHost = false;
                    
                    // Connect to the host
                    const conn = this.peer.connect(targetPeerId, {
                        reliable: true,
                        metadata: { type: 'chess-game' }
                    });
                    
                    conn.on('open', () => {
                        this.handleConnection(conn);
                        
                        // Request game info
                        this.send({ type: 'join-request' });
                    });
                    
                    conn.on('error', (err) => {
                        console.error('Connection error:', err);
                        reject(new Error('Failed to connect to game'));
                    });
                    
                    // Timeout for connection
                    setTimeout(() => {
                        if (!this.isConnected) {
                            reject(new Error('Connection timeout - game may not exist'));
                        }
                    }, 10000);
                });
                
                this.peer.on('error', (err) => {
                    console.error('Peer error:', err);
                    if (err.type === 'peer-unavailable') {
                        reject(new Error('Game not found. Please check the code.'));
                    } else {
                        reject(err);
                    }
                });
                
                // Store resolve for later use when game info is received
                this._joinResolve = resolve;
                this._joinReject = reject;
                
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Handle incoming connection
     */
    handleConnection(conn) {
        this.connection = conn;
        this.opponentId = conn.peer;
        this.isConnected = true;
        
        conn.on('data', (data) => {
            this.handleMessage(data);
        });
        
        conn.on('close', () => {
            console.log('Connection closed');
            this.isConnected = false;
            if (this.onDisconnected) this.onDisconnected();
        });
        
        conn.on('error', (err) => {
            console.error('Connection error:', err);
            if (this.onError) this.onError(err);
        });
        
        if (this.isHost && this.onConnected) {
            // Send game settings to the joining player
            this.send({
                type: 'game-info',
                settings: this.gameSettings,
                opponentColor: this.playerColor === 'white' ? 'black' : 'white'
            });
            
            this.onConnected();
        }
    }

    /**
     * Handle incoming messages
     */
    handleMessage(data) {
        console.log('Received:', data);
        
        switch (data.type) {
            case 'join-request':
                // Host sends game info
                if (this.isHost) {
                    this.send({
                        type: 'game-info',
                        settings: this.gameSettings,
                        opponentColor: this.playerColor === 'white' ? 'black' : 'white'
                    });
                }
                break;
                
            case 'game-info':
                // Joiner receives game settings
                this.playerColor = data.opponentColor;
                this.gameSettings = data.settings;
                
                if (this._joinResolve) {
                    this._joinResolve({
                        playerColor: this.playerColor,
                        settings: data.settings
                    });
                    this._joinResolve = null;
                }
                
                if (this.onConnected) this.onConnected();
                if (this.onGameStart) this.onGameStart(this.playerColor, data.settings);
                break;
                
            case 'game-start':
                if (this.onGameStart) this.onGameStart(this.playerColor, data.settings);
                break;
                
            case 'move':
                if (this.onMove) this.onMove(data.move);
                break;
                
            case 'draw-offer':
                if (this.onDrawOffer) this.onDrawOffer();
                break;
                
            case 'draw-accept':
                if (this.onDrawAccept) this.onDrawAccept();
                break;
                
            case 'draw-decline':
                if (this.onDrawDecline) this.onDrawDecline();
                break;
                
            case 'resign':
                if (this.onResign) this.onResign();
                break;
                
            case 'chat':
                if (this.onChat) this.onChat(data.message);
                break;
                
            case 'rematch-offer':
                if (this.onRematchOffer) this.onRematchOffer();
                break;
                
            case 'rematch-accept':
                if (this.onRematchAccept) this.onRematchAccept();
                break;
        }
    }

    /**
     * Send data to the opponent
     */
    send(data) {
        if (this.connection && this.isConnected) {
            this.connection.send(data);
            return true;
        }
        return false;
    }

    /**
     * Send a move to the opponent
     */
    sendMove(move) {
        return this.send({
            type: 'move',
            move: {
                from: move.from,
                to: move.to,
                promotion: move.promotion
            }
        });
    }

    /**
     * Start the game (host only)
     */
    startGame() {
        if (this.isHost) {
            this.send({
                type: 'game-start',
                settings: this.gameSettings
            });
            if (this.onGameStart) {
                this.onGameStart(this.playerColor, this.gameSettings);
            }
        }
    }

    /**
     * Offer a draw
     */
    offerDraw() {
        return this.send({ type: 'draw-offer' });
    }

    /**
     * Accept a draw
     */
    acceptDraw() {
        return this.send({ type: 'draw-accept' });
    }

    /**
     * Decline a draw
     */
    declineDraw() {
        return this.send({ type: 'draw-decline' });
    }

    /**
     * Resign the game
     */
    resign() {
        return this.send({ type: 'resign' });
    }

    /**
     * Send a chat message
     */
    sendChat(message) {
        return this.send({ type: 'chat', message });
    }

    /**
     * Offer a rematch
     */
    offerRematch() {
        return this.send({ type: 'rematch-offer' });
    }

    /**
     * Accept a rematch
     */
    acceptRematch() {
        return this.send({ type: 'rematch-accept' });
    }

    /**
     * Disconnect and clean up
     */
    disconnect() {
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
        
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
        
        this.isConnected = false;
        this.isHost = false;
        this.peerId = null;
        this.opponentId = null;
    }

    /**
     * Get connection status
     */
    getStatus() {
        return {
            isConnected: this.isConnected,
            isHost: this.isHost,
            playerColor: this.playerColor,
            peerId: this.peerId
        };
    }

    /**
     * Extract game code from peer ID
     */
    static extractGameCode(peerId) {
        if (peerId && peerId.startsWith('dostoevsky-chess-')) {
            return peerId.replace('dostoevsky-chess-', '');
        }
        return null;
    }

    /**
     * Get shareable game link
     */
    getShareLink() {
        const code = MultiplayerManager.extractGameCode(this.peerId);
        if (code) {
            const baseUrl = window.location.href.split('?')[0].split('#')[0];
            return `${baseUrl}?join=${code}`;
        }
        return null;
    }
}

// Export for use in other modules
window.MultiplayerManager = MultiplayerManager;
