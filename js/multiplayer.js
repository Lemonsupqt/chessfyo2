/**
 * Multiplayer System - The Brothers Chess
 * Handles peer-to-peer connections using PeerJS
 */

class MultiplayerManager {
    constructor() {
        this.peer = null;
        this.connection = null;
        this.gameId = null;
        this.isHost = false;
        this.playerColor = 'white';
        this.opponentConnected = false;
        this.timeControl = 0;
        
        // Callbacks
        this.onOpponentJoined = null;
        this.onOpponentMove = null;
        this.onOpponentDisconnected = null;
        this.onDrawOffer = null;
        this.onResign = null;
        this.onMessage = null;
        this.onConnectionError = null;
        
        // Game state sync
        this.syncedFen = null;
    }
    
    /**
     * Generate a unique game ID
     */
    generateGameId() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let id = '';
        for (let i = 0; i < 6; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }
    
    /**
     * Initialize peer connection
     */
    async initPeer() {
        return new Promise((resolve, reject) => {
            // Clean up existing peer
            if (this.peer) {
                this.peer.destroy();
            }
            
            // Generate a random peer ID
            const peerId = 'dostoevsky-chess-' + this.generateGameId() + '-' + Date.now();
            
            try {
                this.peer = new Peer(peerId, {
                    debug: 1,
                    config: {
                        iceServers: [
                            { urls: 'stun:stun.l.google.com:19302' },
                            { urls: 'stun:stun1.l.google.com:19302' },
                            { urls: 'stun:stun2.l.google.com:19302' },
                            { urls: 'stun:stun3.l.google.com:19302' },
                            { urls: 'stun:stun4.l.google.com:19302' }
                        ]
                    }
                });
                
                this.peer.on('open', (id) => {
                    console.log('Peer connected with ID:', id);
                    resolve(id);
                });
                
                this.peer.on('error', (err) => {
                    console.error('Peer error:', err);
                    if (this.onConnectionError) {
                        this.onConnectionError(err.type);
                    }
                    reject(err);
                });
                
                this.peer.on('connection', (conn) => {
                    this.handleIncomingConnection(conn);
                });
                
                this.peer.on('disconnected', () => {
                    console.log('Peer disconnected');
                    // Try to reconnect
                    if (this.peer && !this.peer.destroyed) {
                        this.peer.reconnect();
                    }
                });
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * Create a new game room (host)
     */
    async createGame(playerColor = 'white', timeControl = 0) {
        this.isHost = true;
        this.timeControl = timeControl;
        
        // Handle random color
        if (playerColor === 'random') {
            playerColor = Math.random() < 0.5 ? 'white' : 'black';
        }
        this.playerColor = playerColor;
        
        try {
            await this.initPeer();
            this.gameId = this.peer.id;
            
            return {
                gameId: this.gameId,
                playerColor: this.playerColor,
                link: this.generateShareLink()
            };
        } catch (error) {
            console.error('Failed to create game:', error);
            throw error;
        }
    }
    
    /**
     * Join an existing game
     */
    async joinGame(gameId) {
        this.isHost = false;
        this.gameId = gameId;
        
        try {
            await this.initPeer();
            
            return new Promise((resolve, reject) => {
                const conn = this.peer.connect(gameId, {
                    reliable: true,
                    serialization: 'json'
                });
                
                conn.on('open', () => {
                    this.connection = conn;
                    this.opponentConnected = true;
                    this.setupConnectionHandlers(conn);
                    
                    // Request game info from host
                    this.send({ type: 'join' });
                    
                    resolve(conn);
                });
                
                conn.on('error', (err) => {
                    console.error('Connection error:', err);
                    reject(err);
                });
                
                // Timeout after 10 seconds
                setTimeout(() => {
                    if (!this.opponentConnected) {
                        reject(new Error('Connection timeout'));
                    }
                }, 10000);
            });
        } catch (error) {
            console.error('Failed to join game:', error);
            throw error;
        }
    }
    
    /**
     * Handle incoming connection (for host)
     */
    handleIncomingConnection(conn) {
        if (this.opponentConnected) {
            // Already have an opponent
            conn.close();
            return;
        }
        
        conn.on('open', () => {
            this.connection = conn;
            this.opponentConnected = true;
            this.setupConnectionHandlers(conn);
            
            console.log('Opponent connected!');
        });
    }
    
    /**
     * Setup connection message handlers
     */
    setupConnectionHandlers(conn) {
        conn.on('data', (data) => {
            this.handleMessage(data);
        });
        
        conn.on('close', () => {
            console.log('Connection closed');
            this.opponentConnected = false;
            if (this.onOpponentDisconnected) {
                this.onOpponentDisconnected();
            }
        });
        
        conn.on('error', (err) => {
            console.error('Connection error:', err);
        });
    }
    
    /**
     * Handle incoming messages
     */
    handleMessage(data) {
        console.log('Received:', data);
        
        switch (data.type) {
            case 'join':
                // Send game info to joining player
                this.send({
                    type: 'gameInfo',
                    hostColor: this.playerColor,
                    timeControl: this.timeControl,
                    fen: this.syncedFen
                });
                
                if (this.onOpponentJoined) {
                    this.onOpponentJoined();
                }
                break;
                
            case 'gameInfo':
                // Received game info from host
                this.playerColor = data.hostColor === 'white' ? 'black' : 'white';
                this.timeControl = data.timeControl;
                this.syncedFen = data.fen;
                
                if (this.onOpponentJoined) {
                    this.onOpponentJoined({
                        playerColor: this.playerColor,
                        timeControl: this.timeControl,
                        fen: this.syncedFen
                    });
                }
                break;
                
            case 'move':
                if (this.onOpponentMove) {
                    this.onOpponentMove(data.from, data.to, data.promotion);
                }
                break;
                
            case 'drawOffer':
                if (this.onDrawOffer) {
                    this.onDrawOffer();
                }
                break;
                
            case 'drawAccept':
                if (this.onMessage) {
                    this.onMessage({ type: 'drawAccepted' });
                }
                break;
                
            case 'drawDecline':
                if (this.onMessage) {
                    this.onMessage({ type: 'drawDeclined' });
                }
                break;
                
            case 'resign':
                if (this.onResign) {
                    this.onResign();
                }
                break;
                
            case 'chat':
                if (this.onMessage) {
                    this.onMessage({ type: 'chat', message: data.message });
                }
                break;
                
            case 'sync':
                // Sync game state
                this.syncedFen = data.fen;
                if (this.onMessage) {
                    this.onMessage({ type: 'sync', fen: data.fen });
                }
                break;
                
            case 'rematch':
                if (this.onMessage) {
                    this.onMessage({ type: 'rematch' });
                }
                break;
                
            default:
                console.log('Unknown message type:', data.type);
        }
    }
    
    /**
     * Send data to opponent
     */
    send(data) {
        if (this.connection && this.connection.open) {
            this.connection.send(data);
        }
    }
    
    /**
     * Send a move to opponent
     */
    sendMove(from, to, promotion = null) {
        this.send({
            type: 'move',
            from,
            to,
            promotion
        });
    }
    
    /**
     * Offer a draw
     */
    offerDraw() {
        this.send({ type: 'drawOffer' });
    }
    
    /**
     * Accept draw
     */
    acceptDraw() {
        this.send({ type: 'drawAccept' });
    }
    
    /**
     * Decline draw
     */
    declineDraw() {
        this.send({ type: 'drawDecline' });
    }
    
    /**
     * Resign game
     */
    resign() {
        this.send({ type: 'resign' });
    }
    
    /**
     * Send chat message
     */
    sendChat(message) {
        this.send({ type: 'chat', message });
    }
    
    /**
     * Sync game state
     */
    syncGame(fen) {
        this.syncedFen = fen;
        this.send({ type: 'sync', fen });
    }
    
    /**
     * Request rematch
     */
    requestRematch() {
        this.send({ type: 'rematch' });
    }
    
    /**
     * Generate shareable link
     */
    generateShareLink() {
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?game=${encodeURIComponent(this.gameId)}`;
    }
    
    /**
     * Get game ID from URL
     */
    static getGameIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('game');
    }
    
    /**
     * Check if URL contains a game invitation
     */
    static hasGameInvitation() {
        return !!MultiplayerManager.getGameIdFromUrl();
    }
    
    /**
     * Disconnect and cleanup
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
        
        this.opponentConnected = false;
        this.gameId = null;
        this.isHost = false;
    }
    
    /**
     * Check if connected to opponent
     */
    isConnected() {
        return this.opponentConnected && this.connection && this.connection.open;
    }
}

// Export for use in other modules
window.MultiplayerManager = MultiplayerManager;
