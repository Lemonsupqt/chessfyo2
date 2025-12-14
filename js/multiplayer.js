/**
 * DOSTOEVSKY CHESS - Multiplayer Manager
 * Handles peer-to-peer connections using PeerJS
 */

class MultiplayerManager {
    constructor() {
        this.peer = null;
        this.connection = null;
        this.roomId = null;
        this.isHost = false;
        this.playerColor = null;
        this.opponentName = 'Opponent';
        
        this.onConnected = null;
        this.onDisconnected = null;
        this.onMove = null;
        this.onGameStart = null;
        this.onMessage = null;
        this.onError = null;
        this.onDrawOffer = null;
        this.onResign = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            try {
                // Generate unique peer ID
                const peerId = this.generatePeerId();
                
                this.peer = new Peer(peerId, {
                    debug: 1,
                    config: {
                        iceServers: [
                            { urls: 'stun:stun.l.google.com:19302' },
                            { urls: 'stun:stun1.l.google.com:19302' },
                            { urls: 'stun:stun2.l.google.com:19302' }
                        ]
                    }
                });

                this.peer.on('open', (id) => {
                    console.log('Peer connected with ID:', id);
                    resolve(id);
                });

                this.peer.on('error', (error) => {
                    console.error('PeerJS error:', error);
                    if (this.onError) {
                        this.onError(error);
                    }
                    if (error.type === 'unavailable-id') {
                        // Try again with new ID
                        this.peer.destroy();
                        this.init().then(resolve).catch(reject);
                    } else {
                        reject(error);
                    }
                });

                this.peer.on('connection', (conn) => {
                    this.handleIncomingConnection(conn);
                });

                this.peer.on('disconnected', () => {
                    console.log('Peer disconnected');
                    // Try to reconnect
                    setTimeout(() => {
                        if (this.peer && !this.peer.destroyed) {
                            this.peer.reconnect();
                        }
                    }, 3000);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    generatePeerId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let id = 'dostoevsky-';
        for (let i = 0; i < 8; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    createRoom() {
        this.isHost = true;
        this.roomId = this.peer.id;
        this.playerColor = 'white';
        
        return {
            roomId: this.roomId,
            roomCode: this.getRoomCode(),
            url: this.getRoomUrl()
        };
    }

    getRoomCode() {
        // Extract the unique part of the peer ID
        return this.roomId.replace('dostoevsky-', '');
    }

    getRoomUrl() {
        const baseUrl = window.location.href.split('?')[0].split('#')[0];
        return `${baseUrl}?room=${this.getRoomCode()}`;
    }

    async joinRoom(roomCode) {
        return new Promise((resolve, reject) => {
            const peerId = `dostoevsky-${roomCode.toUpperCase()}`;
            
            console.log('Attempting to connect to:', peerId);
            
            this.connection = this.peer.connect(peerId, {
                reliable: true,
                serialization: 'json'
            });

            const timeout = setTimeout(() => {
                reject(new Error('Connection timeout - room may not exist'));
            }, 10000);

            this.connection.on('open', () => {
                clearTimeout(timeout);
                console.log('Connected to room');
                
                this.isHost = false;
                this.roomId = peerId;
                this.playerColor = 'black';
                
                this.setupConnectionHandlers();
                
                // Send join message
                this.send({
                    type: 'join',
                    name: window.game?.playerName || 'Guest'
                });
                
                resolve({
                    roomId: peerId,
                    playerColor: this.playerColor
                });
            });

            this.connection.on('error', (error) => {
                clearTimeout(timeout);
                console.error('Connection error:', error);
                reject(error);
            });
        });
    }

    handleIncomingConnection(conn) {
        console.log('Incoming connection from:', conn.peer);
        
        if (this.connection) {
            // Already have a connection, reject
            conn.close();
            return;
        }
        
        this.connection = conn;
        this.setupConnectionHandlers();
    }

    setupConnectionHandlers() {
        if (!this.connection) return;

        this.connection.on('data', (data) => {
            this.handleMessage(data);
        });

        this.connection.on('close', () => {
            console.log('Connection closed');
            this.connection = null;
            if (this.onDisconnected) {
                this.onDisconnected();
            }
        });

        this.connection.on('error', (error) => {
            console.error('Connection error:', error);
            if (this.onError) {
                this.onError(error);
            }
        });
    }

    handleMessage(data) {
        console.log('Received message:', data.type);

        switch (data.type) {
            case 'join':
                this.opponentName = data.name || 'Opponent';
                // Send welcome with game state
                this.send({
                    type: 'welcome',
                    name: window.game?.playerName || 'Host',
                    color: 'black',
                    fen: window.game?.chess.getFEN()
                });
                if (this.onConnected) {
                    this.onConnected({
                        opponentName: this.opponentName,
                        playerColor: this.playerColor
                    });
                }
                break;

            case 'welcome':
                this.opponentName = data.name || 'Host';
                this.playerColor = data.color;
                if (this.onConnected) {
                    this.onConnected({
                        opponentName: this.opponentName,
                        playerColor: this.playerColor,
                        fen: data.fen
                    });
                }
                if (this.onGameStart) {
                    this.onGameStart({
                        playerColor: this.playerColor,
                        fen: data.fen
                    });
                }
                break;

            case 'move':
                if (this.onMove) {
                    this.onMove(data.move);
                }
                break;

            case 'chat':
                if (this.onMessage) {
                    this.onMessage({
                        sender: this.opponentName,
                        text: data.text
                    });
                }
                break;

            case 'draw-offer':
                if (this.onDrawOffer) {
                    this.onDrawOffer();
                }
                break;

            case 'draw-accept':
                if (window.game) {
                    window.game.endGame('Draw by agreement');
                }
                break;

            case 'draw-decline':
                if (this.onMessage) {
                    this.onMessage({
                        sender: 'System',
                        text: 'Draw offer declined'
                    });
                }
                break;

            case 'resign':
                if (this.onResign) {
                    this.onResign();
                }
                break;

            case 'rematch-offer':
                if (this.onMessage) {
                    this.onMessage({
                        sender: 'System',
                        text: `${this.opponentName} wants a rematch!`,
                        action: 'rematch'
                    });
                }
                break;

            case 'rematch-accept':
                if (window.game) {
                    window.game.startNewGame({
                        mode: 'online',
                        playerColor: this.playerColor === 'white' ? 'black' : 'white'
                    });
                }
                break;

            case 'sync':
                // Sync game state
                if (data.fen && window.game) {
                    window.game.chess.loadFEN(data.fen);
                    window.game.updateBoard();
                }
                break;
        }
    }

    send(data) {
        if (this.connection && this.connection.open) {
            this.connection.send(data);
            return true;
        }
        return false;
    }

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

    sendChat(text) {
        return this.send({
            type: 'chat',
            text: text
        });
    }

    offerDraw() {
        return this.send({
            type: 'draw-offer'
        });
    }

    acceptDraw() {
        return this.send({
            type: 'draw-accept'
        });
    }

    declineDraw() {
        return this.send({
            type: 'draw-decline'
        });
    }

    resign() {
        return this.send({
            type: 'resign'
        });
    }

    offerRematch() {
        return this.send({
            type: 'rematch-offer'
        });
    }

    acceptRematch() {
        return this.send({
            type: 'rematch-accept'
        });
    }

    syncGameState(fen) {
        return this.send({
            type: 'sync',
            fen: fen
        });
    }

    isConnected() {
        return this.connection && this.connection.open;
    }

    disconnect() {
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
    }

    destroy() {
        this.disconnect();
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
    }

    getShareableLink() {
        if (!this.roomId) return null;
        return this.getRoomUrl();
    }
}

// Create global instance
window.multiplayer = new MultiplayerManager();

// Check for room code in URL
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('room');
    
    if (roomCode) {
        // Store room code for later joining
        window.pendingRoomCode = roomCode;
    }
});

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultiplayerManager;
}
