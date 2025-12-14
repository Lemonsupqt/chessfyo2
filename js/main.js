$(document).ready(function() {
    // Hide loader
    $('#loading-overlay').fadeOut();

    const game = window.gameManager;
    const ai = window.aiPlayer;
    const net = window.netManager;

    // Init Game Board (hidden initially)
    game.init('board');

    // Menu Navigation
    function showGame(mode) {
        $('#main-menu').addClass('hidden');
        $('#game-screen').removeClass('hidden');
        
        game.setMode(mode);
        game.reset();

        if (mode === 'ai') {
            ai.init();
            $('#opponent-name').text('The Grand Inquisitor (AI)');
        } else if (mode === 'local') {
            $('#opponent-name').text('Player 2');
            $('#player-name').text('Player 1');
            $('#chat-container').addClass('hidden');
        } else if (mode === 'online') {
            $('#opponent-name').text('Online Opponent');
            $('#chat-container').removeClass('hidden');
            $('#online-setup').removeClass('hidden');
        }
        
        // Force resize after showing
        setTimeout(() => game.board.resize(), 200);
    }

    $('#btn-ai').click(() => showGame('ai'));
    $('#btn-local').click(() => showGame('local'));
    
    $('#btn-online-host').click(() => {
        showGame('online');
        net.init(true); // Host
        $('#join-input-display').addClass('hidden');
        $('#host-id-display').removeClass('hidden');
    });

    $('#btn-online-join').click(() => {
        showGame('online');
        // We initialize peer when we click connect, or now?
        // Better to init peer now so we are ready.
        // But we are not host.
        // Wait, for PeerJS connect we need a Peer ID too usually? Yes.
        net.init(false); 
        $('#host-id-display').addClass('hidden');
        $('#join-input-display').removeClass('hidden');
    });

    // In-Game Controls
    $('#btn-menu').click(() => {
        if (confirm('Return to menu? Game progress will be lost.')) {
            location.reload(); // Easiest way to reset everything
        }
    });

    $('#btn-flip').click(() => game.flipBoard());

    $('#btn-resign').click(() => {
        if (confirm('Are you sure you want to resign?')) {
            alert('You resigned.');
            game.isGameOver = true;
            $('#status-text').text('Game Over - Resignation');
        }
    });

    // Network Connect
    $('#btn-connect').click(() => {
        const hostId = $('#join-peer-id').val();
        if (hostId) {
            net.connect(hostId);
        }
    });

    $('#btn-copy-id').click(() => {
        const idText = $('#my-peer-id').text();
        navigator.clipboard.writeText(idText).then(() => {
            alert('ID Copied to clipboard!');
        });
    });

    // Chat
    $('#chat-input').keypress((e) => {
        if (e.which == 13) {
            const msg = $('#chat-input').val();
            if (msg) {
                net.sendChat(msg);
                net.displayChat(msg, true);
                $('#chat-input').val('');
            }
        }
    });

    // Game Callbacks
    game.onMoveCallback = (move) => {
        if (game.mode === 'ai') {
            // If user moved, ask AI to move
            // Check if game over first
            if (!game.isGameOver && game.game.turn() !== game.playerColor) {
                 // Wait a bit for realism
                 $('#opponent-status').addClass('thinking');
                 setTimeout(() => {
                     ai.makeMove(game.game.fen());
                     $('#opponent-status').removeClass('thinking');
                 }, 500);
            }
        } else if (game.mode === 'online') {
            net.sendMove(move);
        } else if (game.mode === 'local') {
            // Maybe flip board automatically?
            // game.flipBoard(); 
        }
    };

});
