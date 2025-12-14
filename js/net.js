class NetworkManager {
    constructor() {
        this.peer = null;
        this.conn = null;
        this.isHost = false;
        this.peerId = null;
    }

    init(isHost = true) {
        this.isHost = isHost;
        this.peer = new Peer(null, {
            debug: 2
        });

        this.peer.on('open', (id) => {
            this.peerId = id;
            if (this.isHost) {
                console.log('My peer ID is: ' + id);
                document.getElementById('my-peer-id').innerText = id;
                document.getElementById('host-id-display').classList.remove('hidden');
            }
        });

        this.peer.on('connection', (c) => {
            // Allow only one connection
            if (this.conn && this.conn.open) {
                c.on('open', () => {
                    c.send({type: 'error', message: 'Already connected to someone.'});
                    setTimeout(() => c.close(), 500);
                });
                return;
            }
            this.setupConnection(c);
        });

        this.peer.on('error', (err) => {
            console.error(err);
            alert('Network error: ' + err.type);
        });
    }

    connect(hostId) {
        if (!this.peer) this.init(false);
        const conn = this.peer.connect(hostId);
        this.setupConnection(conn);
    }

    setupConnection(conn) {
        this.conn = conn;

        this.conn.on('open', () => {
            console.log('Connected!');
            document.getElementById('online-setup').classList.add('hidden');
            document.getElementById('opponent-status').classList.add('online');
            
            // If I am host, I am White. Send start game.
            if (this.isHost) {
                window.gameManager.setPlayerColor('w');
                this.send({ type: 'start', color: 'b' }); // Tell opponent they are Black
            }
        });

        this.conn.on('data', (data) => {
            console.log('Received', data);
            this.handleData(data);
        });

        this.conn.on('close', () => {
            alert('Connection lost.');
            document.getElementById('opponent-status').classList.remove('online');
        });
    }

    send(data) {
        if (this.conn && this.conn.open) {
            this.conn.send(data);
        }
    }

    sendMove(move) {
        this.send({ type: 'move', move: move });
    }

    sendChat(msg) {
        this.send({ type: 'chat', message: msg });
    }

    handleData(data) {
        switch(data.type) {
            case 'start':
                window.gameManager.setPlayerColor(data.color);
                window.gameManager.reset();
                alert('Game Started! You are ' + (data.color === 'w' ? 'White' : 'Black'));
                break;
            case 'move':
                window.gameManager.makeMove(data.move);
                break;
            case 'chat':
                this.displayChat(data.message, false);
                break;
        }
    }

    displayChat(msg, isSelf) {
        const chatDiv = document.getElementById('chat-messages');
        const msgElem = document.createElement('div');
        msgElem.textContent = (isSelf ? 'You: ' : 'Friend: ') + msg;
        msgElem.style.color = isSelf ? '#d4a373' : '#e0e0e0';
        chatDiv.appendChild(msgElem);
        chatDiv.scrollTop = chatDiv.scrollHeight;
    }
}

window.netManager = new NetworkManager();
