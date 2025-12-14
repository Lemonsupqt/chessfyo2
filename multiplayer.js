// WebRTC peer-to-peer multiplayer functionality
class MultiplayerManager {
    constructor() {
        this.peerConnection = null;
        this.dataChannel = null;
        this.localPeerId = null;
        this.remotePeerId = null;
        this.isHost = false;
        this.onMoveCallback = null;
        this.onConnectionCallback = null;
        this.onDisconnectionCallback = null;
        this.configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
    }

    generatePeerId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    async createRoom() {
        this.isHost = true;
        this.localPeerId = this.generatePeerId();
        return this.localPeerId;
    }

    async joinRoom(roomId) {
        this.isHost = false;
        this.remotePeerId = roomId;
        await this.initiateConnection();
    }

    async initiateConnection() {
        try {
            this.peerConnection = new RTCPeerConnection(this.configuration);

            // Handle ICE candidates
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate && this.dataChannel && this.dataChannel.readyState === 'open') {
                    this.dataChannel.send(JSON.stringify({
                        type: 'ice-candidate',
                        candidate: event.candidate
                    }));
                }
            };

            // Handle connection state changes
            this.peerConnection.onconnectionstatechange = () => {
                const state = this.peerConnection.connectionState;
                if (state === 'connected') {
                    if (this.onConnectionCallback) {
                        this.onConnectionCallback();
                    }
                } else if (state === 'disconnected' || state === 'failed') {
                    if (this.onDisconnectionCallback) {
                        this.onDisconnectionCallback();
                    }
                }
            };

            if (this.isHost) {
                // Host creates data channel
                this.dataChannel = this.peerConnection.createDataChannel('chess', {
                    ordered: true
                });
                this.setupDataChannel();
                await this.createOffer();
            } else {
                // Client waits for data channel
                this.peerConnection.ondatachannel = (event) => {
                    this.dataChannel = event.channel;
                    this.setupDataChannel();
                };
            }
        } catch (error) {
            console.error('Connection error:', error);
            throw error;
        }
    }

    setupDataChannel() {
        this.dataChannel.onopen = () => {
            console.log('Data channel opened');
            if (this.onConnectionCallback) {
                this.onConnectionCallback();
            }
        };

        this.dataChannel.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.handleMessage(message);
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        this.dataChannel.onerror = (error) => {
            console.error('Data channel error:', error);
        };

        this.dataChannel.onclose = () => {
            console.log('Data channel closed');
            if (this.onDisconnectionCallback) {
                this.onDisconnectionCallback();
            }
        };
    }

    async createOffer() {
        try {
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            
            // In a real implementation, you'd send this through a signaling server
            // For GitHub Pages, we'll use a simple approach with URL sharing
            const offerData = {
                type: 'offer',
                sdp: offer.sdp,
                type: offer.type
            };
            
            // Store offer for sharing
            this.pendingOffer = offerData;
        } catch (error) {
            console.error('Error creating offer:', error);
        }
    }

    async handleOffer(offer) {
        try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            
            const answerData = {
                type: 'answer',
                sdp: answer.sdp,
                type: answer.type
            };
            
            // Send answer back
            if (this.dataChannel && this.dataChannel.readyState === 'open') {
                this.dataChannel.send(JSON.stringify({
                    type: 'answer',
                    answer: answerData
                }));
            }
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    }

    handleMessage(message) {
        switch (message.type) {
            case 'move':
                if (this.onMoveCallback) {
                    this.onMoveCallback(message.move);
                }
                break;
            case 'offer':
                this.handleOffer(message.offer);
                break;
            case 'answer':
                this.peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer));
                break;
            case 'ice-candidate':
                this.peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
                break;
            case 'game-state':
                if (this.onGameStateCallback) {
                    this.onGameStateCallback(message.state);
                }
                break;
        }
    }

    sendMove(move) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify({
                type: 'move',
                move: move
            }));
        }
    }

    sendGameState(state) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify({
                type: 'game-state',
                state: state
            }));
        }
    }

    disconnect() {
        if (this.dataChannel) {
            this.dataChannel.close();
        }
        if (this.peerConnection) {
            this.peerConnection.close();
        }
        this.dataChannel = null;
        this.peerConnection = null;
    }

    // Simplified connection using WebRTC with manual signaling
    // For GitHub Pages, we'll use a simpler approach
    async connectWithSignaling(signalData) {
        if (signalData.type === 'offer') {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signalData));
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            return answer;
        } else if (signalData.type === 'answer') {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signalData));
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultiplayerManager;
}
