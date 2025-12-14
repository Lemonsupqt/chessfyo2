// WebRTC peer-to-peer multiplayer functionality

class MultiplayerManager {
    constructor() {
        this.peerConnection = null;
        this.dataChannel = null;
        this.isHost = false;
        this.roomId = null;
        this.onMessageCallback = null;
        this.onConnectionCallback = null;
    }

    generateRoomId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    async createRoom() {
        this.isHost = true;
        this.roomId = this.generateRoomId();
        
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };

        this.peerConnection = new RTCPeerConnection(configuration);
        this.setupDataChannel();
        this.setupIceHandling();

        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        return {
            roomId: this.roomId,
            offer: this.peerConnection.localDescription
        };
    }

    async joinRoom(roomId, offer) {
        this.isHost = false;
        this.roomId = roomId;

        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };

        this.peerConnection = new RTCPeerConnection(configuration);
        this.setupDataChannel();
        this.setupIceHandling();

        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        return this.peerConnection.localDescription;
    }

    async handleAnswer(answer) {
        if (this.peerConnection && this.isHost) {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
    }

    setupDataChannel() {
        if (this.isHost) {
            this.dataChannel = this.peerConnection.createDataChannel('chess', {
                ordered: true
            });
        } else {
            this.peerConnection.ondatachannel = (event) => {
                this.dataChannel = event.channel;
                this.setupDataChannelHandlers();
            };
        }

        this.setupDataChannelHandlers();
    }

    setupDataChannelHandlers() {
        if (!this.dataChannel) return;

        this.dataChannel.onopen = () => {
            console.log('Data channel opened');
            if (this.onConnectionCallback) {
                this.onConnectionCallback(true);
            }
        };

        this.dataChannel.onclose = () => {
            console.log('Data channel closed');
            if (this.onConnectionCallback) {
                this.onConnectionCallback(false);
            }
        };

        this.dataChannel.onerror = (error) => {
            console.error('Data channel error:', error);
        };

        this.dataChannel.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (this.onMessageCallback) {
                    this.onMessageCallback(message);
                }
            } catch (e) {
                console.error('Error parsing message:', e);
            }
        };
    }

    setupIceHandling() {
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                // In a real implementation, you'd send this to the other peer
                // For simplicity, we'll handle it locally
            }
        };

        this.peerConnection.onconnectionstatechange = () => {
            console.log('Connection state:', this.peerConnection.connectionState);
            if (this.peerConnection.connectionState === 'failed') {
                if (this.onConnectionCallback) {
                    this.onConnectionCallback(false);
                }
            }
        };
    }

    sendMove(move) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify({
                type: 'move',
                move: move
            }));
        }
    }

    sendMessage(type, data) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify({
                type,
                ...data
            }));
        }
    }

    setOnMessage(callback) {
        this.onMessageCallback = callback;
    }

    setOnConnection(callback) {
        this.onConnectionCallback = callback;
    }

    disconnect() {
        if (this.dataChannel) {
            this.dataChannel.close();
        }
        if (this.peerConnection) {
            this.peerConnection.close();
        }
        this.peerConnection = null;
        this.dataChannel = null;
    }
}

// Simplified peer-to-peer using URL sharing and localStorage
class SimpleMultiplayer {
    constructor() {
        this.roomId = null;
        this.isHost = false;
        this.onMessageCallback = null;
        this.checkInterval = null;
    }

    generateRoomId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    createRoom() {
        this.isHost = true;
        this.roomId = this.generateRoomId();
        const roomKey = `chess_room_${this.roomId}`;
        localStorage.setItem(roomKey, JSON.stringify({
            host: true,
            moves: [],
            status: 'waiting'
        }));
        this.startPolling();
        return this.roomId;
    }

    joinRoom(roomId) {
        this.isHost = false;
        this.roomId = roomId;
        const roomKey = `chess_room_${this.roomId}`;
        const roomData = localStorage.getItem(roomKey);
        if (roomData) {
            const data = JSON.parse(roomData);
            data.guest = true;
            localStorage.setItem(roomKey, JSON.stringify(data));
            this.startPolling();
            return true;
        }
        return false;
    }

    startPolling() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }

        let lastMoveCount = 0;

        this.checkInterval = setInterval(() => {
            const roomKey = `chess_room_${this.roomId}`;
            const roomData = localStorage.getItem(roomKey);
            if (roomData) {
                try {
                    const data = JSON.parse(roomData);
                    if (this.isHost) {
                        // Host checks for guest moves
                        if (data.guestMoves && Array.isArray(data.guestMoves) && data.guestMoves.length > 0) {
                            const move = data.guestMoves.shift();
                            data.guestMoves = [];
                            localStorage.setItem(roomKey, JSON.stringify(data));
                            if (this.onMessageCallback) {
                                this.onMessageCallback({
                                    type: 'move',
                                    move: move
                                });
                            }
                        }
                    } else {
                        // Guest checks for host moves
                        if (data.hostMoves && Array.isArray(data.hostMoves) && data.hostMoves.length > 0) {
                            const move = data.hostMoves.shift();
                            data.hostMoves = [];
                            localStorage.setItem(roomKey, JSON.stringify(data));
                            if (this.onMessageCallback) {
                                this.onMessageCallback({
                                    type: 'move',
                                    move: move
                                });
                            }
                        }
                    }
                } catch (e) {
                    console.error('Error parsing room data:', e);
                }
            }
        }, 300);
    }

    sendMove(move) {
        const roomKey = `chess_room_${this.roomId}`;
        const roomData = localStorage.getItem(roomKey);
        if (roomData) {
            const data = JSON.parse(roomData);
            if (this.isHost) {
                if (!data.hostMoves) data.hostMoves = [];
                data.hostMoves.push(move);
            } else {
                if (!data.guestMoves) data.guestMoves = [];
                data.guestMoves.push(move);
            }
            localStorage.setItem(roomKey, JSON.stringify(data));
        }
    }

    setOnMessage(callback) {
        this.onMessageCallback = callback;
    }

    disconnect() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        if (this.roomId) {
            const roomKey = `chess_room_${this.roomId}`;
            localStorage.removeItem(roomKey);
        }
    }
}
