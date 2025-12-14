/**
 * Multiplayer Module - The Brothers Gambit
 * P2P multiplayer using PeerJS
 */

class MultiplayerManager {
    constructor() {
        this.peer = null;
        this.connection = null;
        this.roomCode = null;
        this.isHost = false;
        this.playerColor = null;
        this.connected = false;
        
        // Callbacks
        this.onConnected = null;
        this.onDisconnected = null;
        this.onMove = null;
        this.onGameStart = null;
        this.onMessage = null;
        this.onError = null;
    }

    generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous characters
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    async createRoom() {
        return new Promise((resolve, reject) => {
            this.roomCode = this.generateRoomCode();
            this.isHost = true;
            this.playerColor = 'w'; // Host plays white
            
            // Use room code as peer ID with prefix
            const peerId = `brothersgambit-${this.roomCode}`;
            
            try {
                this.peer = new Peer(peerId, {
                    debug: 0, // Minimal logging
                    config: {
                        iceServers: [
                            { urls: 'stun:stun.l.google.com:19302' },
                            { urls: 'stun:stun1.l.google.com:19302' }
                        ]
                    }
                });
                
                this.peer.on('open', (id) => {
                    console.log('Room created with ID:', id);
                    resolve(this.roomCode);
                });
                
                this.peer.on('connection', (conn) => {
                    this.handleConnection(conn);
                });
                
                this.peer.on('error', (err) => {
                    console.error('Peer error:', err);
                    if (err.type === 'unavailable-id') {
                        // Room code already taken, generate new one
                        this.peer.destroy();
                        this.roomCode = this.generateRoomCode();
                        this.createRoom().then(resolve).catch(reject);
                    } else {
                        reject(err);
                    }
                });
                
                this.peer.on('disconnected', () => {
                    console.log('Peer disconnected from server');
                });
                
            } catch (error) {
                reject(error);
            }
        });
    }

    async joinRoom(roomCode) {
        return new Promise((resolve, reject) => {
            this.roomCode = roomCode.toUpperCase();
            this.isHost = false;
            this.playerColor = 'b'; // Joiner plays black
            
            const peerId = `brothersgambit-player-${Date.now()}`;
            const hostId = `brothersgambit-${this.roomCode}`;
            
            try {
                this.peer = new Peer(peerId, {
                    debug: 0,
                    config: {
                        iceServers: [
                            { urls: 'stun:stun.l.google.com:19302' },
                            { urls: 'stun:stun1.l.google.com:19302' }
                        ]
                    }
                });
                
                this.peer.on('open', () => {
                    console.log('Attempting to connect to:', hostId);
                    const conn = this.peer.connect(hostId, {
                        reliable: true,
                        serialization: 'json'
                    });
                    
                    conn.on('open', () => {
                        this.handleConnection(conn);
                        resolve();
                    });
                    
                    conn.on('error', (err) => {
                        console.error('Connection error:', err);
                        reject(new Error('Failed to connect to room'));
                    });
                    
                    // Timeout after 10 seconds
                    setTimeout(() => {
                        if (!this.connected) {
                            reject(new Error('Connection timeout - room may not exist'));
                        }
                    }, 10000);
                });
                
                this.peer.on('error', (err) => {
                    console.error('Peer error:', err);
                    if (err.type === 'peer-unavailable') {
                        reject(new Error('Room not found'));
                    } else {
                        reject(err);
                    }
                });
                
            } catch (error) {
                reject(error);
            }
        });
    }

    handleConnection(conn) {
        this.connection = conn;
        this.connected = true;
        
        conn.on('open', () => {
            console.log('Connection established');
            
            if (this.isHost) {
                // Send initial game state to joiner
                this.send({
                    type: 'gameStart',
                    hostColor: 'w'
                });
            }
            
            if (this.onConnected) {
                this.onConnected(this.playerColor);
            }
        });
        
        conn.on('data', (data) => {
            this.handleMessage(data);
        });
        
        conn.on('close', () => {
            console.log('Connection closed');
            this.connected = false;
            if (this.onDisconnected) {
                this.onDisconnected();
            }
        });
        
        conn.on('error', (err) => {
            console.error('Connection error:', err);
            if (this.onError) {
                this.onError(err);
            }
        });
    }

    handleMessage(data) {
        switch (data.type) {
            case 'gameStart':
                if (this.onGameStart) {
                    this.onGameStart(data);
                }
                break;
                
            case 'move':
                if (this.onMove) {
                    this.onMove(data.move);
                }
                break;
                
            case 'resign':
                if (this.onMessage) {
                    this.onMessage({ type: 'resign', color: data.color });
                }
                break;
                
            case 'drawOffer':
                if (this.onMessage) {
                    this.onMessage({ type: 'drawOffer' });
                }
                break;
                
            case 'drawAccept':
                if (this.onMessage) {
                    this.onMessage({ type: 'drawAccept' });
                }
                break;
                
            case 'drawDecline':
                if (this.onMessage) {
                    this.onMessage({ type: 'drawDecline' });
                }
                break;
                
            case 'chat':
                if (this.onMessage) {
                    this.onMessage({ type: 'chat', message: data.message });
                }
                break;
                
            case 'rematch':
                if (this.onMessage) {
                    this.onMessage({ type: 'rematch' });
                }
                break;
                
            case 'rematchAccept':
                if (this.onMessage) {
                    this.onMessage({ type: 'rematchAccept' });
                }
                break;

            case 'timeSync':
                if (this.onMessage) {
                    this.onMessage({ type: 'timeSync', times: data.times });
                }
                break;
                
            default:
                console.log('Unknown message type:', data.type);
        }
    }

    send(data) {
        if (this.connection && this.connected) {
            try {
                this.connection.send(data);
            } catch (error) {
                console.error('Failed to send message:', error);
            }
        }
    }

    sendMove(move) {
        this.send({
            type: 'move',
            move: {
                from: move.from,
                to: move.to,
                promotion: move.promotion
            }
        });
    }

    sendResign() {
        this.send({
            type: 'resign',
            color: this.playerColor
        });
    }

    offerDraw() {
        this.send({ type: 'drawOffer' });
    }

    acceptDraw() {
        this.send({ type: 'drawAccept' });
    }

    declineDraw() {
        this.send({ type: 'drawDecline' });
    }

    sendRematch() {
        this.send({ type: 'rematch' });
    }

    acceptRematch() {
        this.send({ type: 'rematchAccept' });
    }

    sendTimeSync(times) {
        this.send({ type: 'timeSync', times });
    }

    getShareableLink() {
        const baseUrl = window.location.href.split('?')[0].split('#')[0];
        return `${baseUrl}?join=${this.roomCode}`;
    }

    disconnect() {
        if (this.connection) {
            this.connection.close();
        }
        if (this.peer) {
            this.peer.destroy();
        }
        this.connected = false;
        this.connection = null;
        this.peer = null;
        this.roomCode = null;
    }
}

// Export
window.MultiplayerManager = MultiplayerManager;
