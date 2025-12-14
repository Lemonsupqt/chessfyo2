// ========================================
// LANDING PAGE APP.JS
// ========================================

// Store game state globally
let gameMode = null;

function startGame(mode) {
    gameMode = mode;
    localStorage.setItem('gameMode', mode);
    localStorage.setItem('playerColor', 'white'); // Default for local and AI
    window.location.href = 'game.html';
}

function showMultiplayerOptions() {
    document.getElementById('multiplayerModal').style.display = 'flex';
}

function closeMultiplayerModal() {
    document.getElementById('multiplayerModal').style.display = 'none';
    document.getElementById('roomInfo').style.display = 'none';
}

function createRoom() {
    const playerName = document.getElementById('playerName').value.trim();
    if (!playerName) {
        alert('Please enter your name');
        return;
    }
    
    // Generate a random room code
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Store multiplayer info
    localStorage.setItem('gameMode', 'online');
    localStorage.setItem('playerName', playerName);
    localStorage.setItem('roomCode', roomCode);
    localStorage.setItem('isHost', 'true');
    localStorage.setItem('playerColor', 'white'); // Host is white
    
    // Show room code
    document.getElementById('roomCodeDisplay').textContent = roomCode;
    document.getElementById('roomInfo').style.display = 'block';
    document.querySelector('.multiplayer-options').style.display = 'none';
    
    // Wait a moment then redirect to game
    setTimeout(() => {
        window.location.href = 'game.html';
    }, 2000);
}

function joinRoom() {
    const playerName = document.getElementById('joinPlayerName').value.trim();
    const roomCode = document.getElementById('roomCode').value.trim().toUpperCase();
    
    if (!playerName || !roomCode) {
        alert('Please enter your name and room code');
        return;
    }
    
    // Store multiplayer info
    localStorage.setItem('gameMode', 'online');
    localStorage.setItem('playerName', playerName);
    localStorage.setItem('roomCode', roomCode);
    localStorage.setItem('isHost', 'false');
    localStorage.setItem('playerColor', 'black'); // Joiner is black
    
    // Redirect to game
    window.location.href = 'game.html';
}

// Add starfield animation
function createStarfield() {
    const stars = document.querySelector('.stars');
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        stars.appendChild(star);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Clear any previous game state
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        localStorage.removeItem('gameMode');
        localStorage.removeItem('roomCode');
        localStorage.removeItem('isHost');
        localStorage.removeItem('playerName');
    }
});
