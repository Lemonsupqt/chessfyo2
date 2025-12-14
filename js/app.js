/**
 * DOSTOEVSKY CHESS - Main Application
 * Initializes and connects all game components
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎭 Dostoevsky Chess - Initializing...');

    // Initialize game
    window.game.init('chess-board');

    // Setup UI event listeners
    setupModalHandlers();
    setupGameControls();
    setupSettingsHandlers();
    setupMultiplayerHandlers();
    setupKeyboardShortcuts();

    // Initialize Stockfish
    initializeStockfish();

    // Check for room code in URL
    checkPendingRoom();

    // Initial quote
    window.game.updateQuote();

    console.log('✅ Dostoevsky Chess - Ready');
});

// ============================================
// Modal Handlers
// ============================================

function setupModalHandlers() {
    // New Game button
    document.getElementById('btn-new-game').addEventListener('click', () => {
        showModal('modal-new-game');
    });

    // Settings button
    document.getElementById('btn-settings').addEventListener('click', () => {
        showModal('modal-settings');
        loadSettingsToUI();
    });

    // About button
    document.getElementById('btn-about').addEventListener('click', () => {
        showModal('modal-about');
    });

    // Close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            hideModal(modal.id);
        });
    });

    // Click outside to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });

    // Game mode selection
    document.querySelectorAll('.mode-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            
            const mode = card.dataset.mode;
            handleModeSelection(mode);
        });
    });

    // Color selection
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Difficulty selection
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Time selection
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Start game button
    document.getElementById('btn-start-game').addEventListener('click', startGameFromModal);

    // Promotion piece selection
    document.getElementById('promotion-pieces').addEventListener('click', (e) => {
        const pieceBtn = e.target.closest('.promo-piece');
        if (pieceBtn) {
            window.game.handlePromotionChoice(pieceBtn.dataset.piece);
        }
    });

    // Game over buttons
    document.getElementById('btn-rematch')?.addEventListener('click', () => {
        hideModal('modal-gameover');
        // Start new game with same settings
        window.game.startNewGame({
            mode: window.game.mode,
            playerColor: window.game.playerColor === 'white' ? 'black' : 'white',
            timeControl: window.game.timeControl,
            aiLevel: window.game.aiLevel
        });
    });

    document.getElementById('btn-new-game-end')?.addEventListener('click', () => {
        hideModal('modal-gameover');
        showModal('modal-new-game');
    });

    document.getElementById('btn-analyze')?.addEventListener('click', () => {
        hideModal('modal-gameover');
        // Export PGN for analysis
        const pgn = window.game.exportPGN();
        console.log('Game PGN:', pgn);
        alert('PGN copied to console. You can paste it into any chess analysis tool.');
    });

    // Share handlers
    document.getElementById('link-share')?.addEventListener('click', (e) => {
        e.preventDefault();
        showShareModal();
    });

    document.getElementById('link-export')?.addEventListener('click', (e) => {
        e.preventDefault();
        exportPGN();
    });
}

function handleModeSelection(mode) {
    const gameOptions = document.getElementById('game-options');
    const aiDifficulty = document.getElementById('ai-difficulty');
    
    gameOptions.style.display = 'block';
    aiDifficulty.style.display = mode === 'ai' ? 'block' : 'none';
    
    if (mode === 'online') {
        hideModal('modal-new-game');
        showModal('modal-online');
    } else if (mode === 'puzzles') {
        hideModal('modal-new-game');
        startPuzzleMode();
    }
}

function startGameFromModal() {
    const selectedMode = document.querySelector('.mode-card.selected')?.dataset.mode || 'local';
    const selectedColor = document.querySelector('.color-btn.active')?.dataset.color || 'white';
    const selectedTime = parseInt(document.querySelector('.time-btn.active')?.dataset.time || '0');
    const selectedDifficulty = parseInt(document.querySelector('.diff-btn.active')?.dataset.level || '10');

    let playerColor = selectedColor;
    if (selectedColor === 'random') {
        playerColor = Math.random() > 0.5 ? 'white' : 'black';
    }

    hideModal('modal-new-game');

    window.game.startNewGame({
        mode: selectedMode,
        playerColor: playerColor,
        timeControl: selectedTime,
        aiLevel: selectedDifficulty
    });
}

function startPuzzleMode() {
    const puzzle = window.puzzles.getRandomPuzzle();
    const puzzleData = window.puzzles.startPuzzle(puzzle);
    
    window.game.chess.loadFEN(puzzleData.fen);
    window.game.mode = 'puzzles';
    window.game.updateBoard();
    window.game.board.clearSelection();
    
    // Determine player color from FEN
    const turn = puzzleData.fen.split(' ')[1];
    window.game.playerColor = turn === 'w' ? 'white' : 'black';
    window.game.isPlayerTurn = true;
    
    // Update UI
    document.getElementById('status-text').textContent = puzzleData.description;
    
    // Update quote
    const quoteEl = document.getElementById('game-quote');
    if (quoteEl && puzzleData.quote) {
        quoteEl.textContent = `"${puzzleData.quote.text}"`;
        const citeEl = quoteEl.parentElement.querySelector('cite');
        if (citeEl) {
            citeEl.textContent = `— ${puzzleData.quote.source}`;
        }
    }
    
    // Override move handler for puzzles
    window.game.board.onMove = (move) => {
        handlePuzzleMove(move);
    };
}

function handlePuzzleMove(move) {
    const result = window.puzzles.checkMove(move);
    
    if (result.correct) {
        // Make the move on the board
        window.game.chess.makeMove(move);
        window.game.updateBoard();
        window.game.board.highlightLastMove(move.from, move.to);
        
        if (window.sounds) {
            window.sounds.play('move');
        }
        
        if (result.solved) {
            // Puzzle solved!
            setTimeout(() => {
                alert(result.message);
                // Load next puzzle
                startPuzzleMode();
            }, 500);
        } else {
            // Make opponent's response
            if (result.nextMove) {
                setTimeout(() => {
                    window.game.chess.makeMove(result.nextMove);
                    window.game.updateBoard();
                    window.game.board.highlightLastMove(result.nextMove.from, result.nextMove.to);
                }, 500);
            }
        }
    } else {
        // Wrong move
        if (window.sounds) {
            window.sounds.play('error');
        }
        
        document.getElementById('status-text').textContent = result.message;
        
        // Show hint after wrong attempt
        if (result.hint) {
            window.game.board.showHint(result.hint.from, result.hint.to);
        }
    }
    
    window.game.board.clearSelection();
}

// ============================================
// Game Controls
// ============================================

function setupGameControls() {
    document.getElementById('btn-flip')?.addEventListener('click', () => {
        window.game.flipBoard();
    });

    document.getElementById('btn-undo')?.addEventListener('click', () => {
        window.game.undoMove();
    });

    document.getElementById('btn-redo')?.addEventListener('click', () => {
        window.game.redoMove();
    });

    document.getElementById('btn-hint')?.addEventListener('click', () => {
        window.game.getHint();
    });

    document.getElementById('btn-resign')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to resign?')) {
            window.game.resign();
        }
    });

    document.getElementById('btn-draw')?.addEventListener('click', () => {
        window.game.offerDraw();
    });
}

// ============================================
// Settings
// ============================================

function setupSettingsHandlers() {
    // Board theme
    document.getElementById('board-theme')?.addEventListener('change', (e) => {
        window.game.board.setTheme(e.target.value);
    });

    // Piece style
    document.getElementById('piece-style')?.addEventListener('change', (e) => {
        window.game.board.setPieceStyle(e.target.value);
    });

    // Show coordinates
    document.getElementById('show-coords')?.addEventListener('change', (e) => {
        window.game.updateSetting('showCoordinates', e.target.checked);
    });

    // Highlight moves
    document.getElementById('highlight-moves')?.addEventListener('change', (e) => {
        window.game.updateSetting('highlightMoves', e.target.checked);
    });

    // Atmosphere effects
    document.getElementById('atmosphere-effects')?.addEventListener('change', (e) => {
        window.game.updateSetting('atmosphereEffects', e.target.checked);
    });

    // Sound effects
    document.getElementById('sound-effects')?.addEventListener('change', (e) => {
        window.game.updateSetting('soundEnabled', e.target.checked);
    });

    // Volume
    document.getElementById('volume')?.addEventListener('input', (e) => {
        window.game.updateSetting('volume', parseInt(e.target.value));
    });

    // Auto-queen
    document.getElementById('auto-queen')?.addEventListener('change', (e) => {
        window.game.updateSetting('autoQueen', e.target.checked);
    });

    // Move confirmation
    document.getElementById('move-confirm')?.addEventListener('change', (e) => {
        window.game.updateSetting('moveConfirm', e.target.checked);
    });
}

function loadSettingsToUI() {
    const settings = window.game.settings;
    
    const showCoords = document.getElementById('show-coords');
    if (showCoords) showCoords.checked = settings.showCoordinates;
    
    const highlightMoves = document.getElementById('highlight-moves');
    if (highlightMoves) highlightMoves.checked = settings.highlightMoves;
    
    const atmosphere = document.getElementById('atmosphere-effects');
    if (atmosphere) atmosphere.checked = settings.atmosphereEffects;
    
    const sound = document.getElementById('sound-effects');
    if (sound) sound.checked = settings.soundEnabled;
    
    const volume = document.getElementById('volume');
    if (volume) volume.value = settings.volume * 100;
    
    const autoQueen = document.getElementById('auto-queen');
    if (autoQueen) autoQueen.checked = settings.autoQueen;
    
    const moveConfirm = document.getElementById('move-confirm');
    if (moveConfirm) moveConfirm.checked = settings.moveConfirm;
}

// ============================================
// Multiplayer
// ============================================

function setupMultiplayerHandlers() {
    // Create room
    document.getElementById('btn-create-room')?.addEventListener('click', async () => {
        try {
            await window.multiplayer.init();
            const room = window.multiplayer.createRoom();
            
            document.getElementById('room-link').style.display = 'flex';
            document.getElementById('room-url').value = room.url;
            
            updateConnectionStatus('waiting', 'Waiting for opponent...');
            
            // Setup connection callback
            window.multiplayer.onConnected = (data) => {
                updateConnectionStatus('connected', `Connected to ${data.opponentName}`);
                hideModal('modal-online');
                
                window.game.startNewGame({
                    mode: 'online',
                    playerColor: 'white',
                    opponentName: data.opponentName
                });
            };
        } catch (error) {
            console.error('Failed to create room:', error);
            updateConnectionStatus('error', 'Failed to create room');
        }
    });

    // Copy link
    document.getElementById('btn-copy-link')?.addEventListener('click', () => {
        const urlInput = document.getElementById('room-url');
        urlInput.select();
        document.execCommand('copy');
        
        const btn = document.getElementById('btn-copy-link');
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 2000);
    });

    // Join room
    document.getElementById('btn-join-room')?.addEventListener('click', async () => {
        const code = document.getElementById('room-code-input').value.trim().toUpperCase();
        if (!code) {
            alert('Please enter a room code');
            return;
        }
        
        await joinRoom(code);
    });

    // Setup multiplayer callbacks
    window.multiplayer.onMove = (move) => {
        window.game.handleOpponentMove(move);
    };

    window.multiplayer.onDisconnected = () => {
        updateConnectionStatus('error', 'Opponent disconnected');
        alert('Your opponent has disconnected.');
    };

    window.multiplayer.onDrawOffer = () => {
        if (confirm('Your opponent offers a draw. Accept?')) {
            window.multiplayer.acceptDraw();
            window.game.endGame('Draw by agreement');
        } else {
            window.multiplayer.declineDraw();
        }
    };

    window.multiplayer.onResign = () => {
        const winner = window.game.playerColor === 'white' ? 'White' : 'Black';
        window.game.endGame(`${winner} wins by resignation`);
    };
}

async function joinRoom(code) {
    try {
        updateConnectionStatus('waiting', 'Connecting...');
        
        await window.multiplayer.init();
        const result = await window.multiplayer.joinRoom(code);
        
        updateConnectionStatus('connected', 'Connected!');
        
        window.multiplayer.onConnected = (data) => {
            hideModal('modal-online');
            
            window.game.startNewGame({
                mode: 'online',
                playerColor: 'black',
                opponentName: data.opponentName
            });
            
            if (data.fen) {
                window.game.chess.loadFEN(data.fen);
                window.game.updateBoard();
            }
        };
    } catch (error) {
        console.error('Failed to join room:', error);
        updateConnectionStatus('error', 'Failed to connect. Room may not exist.');
    }
}

function updateConnectionStatus(status, message) {
    const statusEl = document.getElementById('connection-status');
    if (!statusEl) return;
    
    const indicator = statusEl.querySelector('.status-indicator');
    const text = statusEl.querySelector('span');
    
    indicator.classList.remove('connected', 'error');
    if (status === 'connected') {
        indicator.classList.add('connected');
    } else if (status === 'error') {
        indicator.classList.add('error');
    }
    
    text.textContent = message;
}

function checkPendingRoom() {
    if (window.pendingRoomCode) {
        showModal('modal-online');
        document.getElementById('room-code-input').value = window.pendingRoomCode;
        joinRoom(window.pendingRoomCode);
    }
}

// ============================================
// Keyboard Shortcuts
// ============================================

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Escape to close modals
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                hideModal(modal.id);
            });
        }
        
        // Ctrl+Z for undo
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            window.game.undoMove();
        }
        
        // Ctrl+Y for redo
        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            window.game.redoMove();
        }
        
        // F for flip
        if (e.key === 'f' && !e.ctrlKey && !isTyping()) {
            window.game.flipBoard();
        }
        
        // H for hint
        if (e.key === 'h' && !e.ctrlKey && !isTyping()) {
            window.game.getHint();
        }
        
        // N for new game
        if (e.key === 'n' && !e.ctrlKey && !isTyping()) {
            showModal('modal-new-game');
        }
    });
}

function isTyping() {
    const active = document.activeElement;
    return active.tagName === 'INPUT' || active.tagName === 'TEXTAREA';
}

// ============================================
// Utility Functions
// ============================================

function showModal(modalId) {
    document.getElementById(modalId)?.classList.add('active');
}

function hideModal(modalId) {
    document.getElementById(modalId)?.classList.remove('active');
}

function showShareModal() {
    const modal = document.getElementById('modal-share');
    const urlInput = document.getElementById('share-url');
    
    if (window.multiplayer.isConnected()) {
        urlInput.value = window.multiplayer.getShareableLink() || window.location.href;
    } else {
        // Create a shareable link with current game state
        const fen = encodeURIComponent(window.game.exportFEN());
        urlInput.value = `${window.location.href.split('?')[0]}?fen=${fen}`;
    }
    
    showModal('modal-share');
}

function exportPGN() {
    const pgn = window.game.exportPGN();
    
    // Create download
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dostoevsky-chess-${Date.now()}.pgn`;
    a.click();
    URL.revokeObjectURL(url);
}

async function initializeStockfish() {
    try {
        await window.stockfish.init();
        console.log('♟️ Stockfish engine ready');
    } catch (error) {
        console.warn('⚠️ Stockfish initialization failed, using fallback AI:', error);
    }
}

// ============================================
// Share buttons
// ============================================

document.getElementById('share-twitter')?.addEventListener('click', () => {
    const text = encodeURIComponent('Playing Dostoevsky Chess! "Beauty will save the world." ♟️');
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
});

document.getElementById('share-facebook')?.addEventListener('click', () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
});

document.getElementById('share-email')?.addEventListener('click', () => {
    const subject = encodeURIComponent('Play Chess with me - Dostoevsky Chess');
    const body = encodeURIComponent(`I challenge you to a game of chess!\n\n${window.location.href}\n\n"Beauty will save the world." - The Idiot`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
});

document.getElementById('btn-copy-share')?.addEventListener('click', () => {
    const urlInput = document.getElementById('share-url');
    urlInput.select();
    document.execCommand('copy');
    
    const btn = document.getElementById('btn-copy-share');
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 2000);
});
