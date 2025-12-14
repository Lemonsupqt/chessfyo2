/**
 * Sound Effects Module - The Brothers Gambit
 * Generates sounds using Web Audio API
 */

class SoundManager {
    constructor() {
        this.enabled = true;
        this.volume = 0.5;
        this.audioContext = null;
        
        this.init();
    }

    init() {
        // Create audio context on first user interaction
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        }, { once: true });
        
        document.addEventListener('touchstart', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        }, { once: true });
    }

    ensureContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    playTone(frequency, duration, type = 'sine', attack = 0.01, decay = 0.1) {
        if (!this.enabled) return;
        
        this.ensureContext();
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(this.volume, now + attack);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    playChord(frequencies, duration, type = 'sine') {
        if (!this.enabled) return;
        
        frequencies.forEach(freq => {
            this.playTone(freq, duration, type, 0.01, duration * 0.8);
        });
    }

    // Sound effects
    move() {
        // Short click sound
        this.playTone(800, 0.05, 'square', 0.001, 0.02);
    }

    capture() {
        // Slightly aggressive sound
        this.playTone(400, 0.08, 'sawtooth', 0.001, 0.04);
        setTimeout(() => this.playTone(300, 0.06, 'sawtooth', 0.001, 0.03), 30);
    }

    check() {
        // Warning tone
        this.playTone(600, 0.15, 'triangle', 0.01, 0.1);
        setTimeout(() => this.playTone(500, 0.15, 'triangle', 0.01, 0.1), 100);
    }

    checkmate() {
        // Dramatic ending
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 - C major chord
        this.playChord(notes, 0.5, 'triangle');
        setTimeout(() => {
            this.playChord([392, 493.88, 587.33], 0.8, 'triangle'); // G4, B4, D5
        }, 400);
    }

    castle() {
        // Double click for castling
        this.playTone(700, 0.04, 'square', 0.001, 0.02);
        setTimeout(() => this.playTone(900, 0.04, 'square', 0.001, 0.02), 80);
    }

    promote() {
        // Rising tone
        this.playTone(400, 0.1, 'sine', 0.01, 0.08);
        setTimeout(() => this.playTone(600, 0.1, 'sine', 0.01, 0.08), 50);
        setTimeout(() => this.playTone(800, 0.15, 'sine', 0.01, 0.12), 100);
    }

    illegal() {
        // Error buzz
        this.playTone(200, 0.15, 'sawtooth', 0.01, 0.1);
    }

    gameStart() {
        // Pleasant startup
        const notes = [261.63, 329.63, 392]; // C4, E4, G4
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.02, 0.15), i * 100);
        });
    }

    gameEnd() {
        // Conclusive sound
        this.playChord([392, 493.88, 587.33], 0.6, 'triangle');
    }

    draw() {
        // Neutral ending
        this.playTone(440, 0.3, 'sine', 0.02, 0.25);
        setTimeout(() => this.playTone(440, 0.3, 'sine', 0.02, 0.25), 200);
    }

    lowTime() {
        // Urgent tick
        this.playTone(1000, 0.03, 'square', 0.001, 0.01);
    }

    notification() {
        // Gentle notification
        this.playTone(880, 0.1, 'sine', 0.01, 0.08);
        setTimeout(() => this.playTone(1100, 0.15, 'sine', 0.01, 0.12), 100);
    }

    // Play appropriate sound for a move
    playMoveSound(moveData) {
        if (moveData.checkmate) {
            this.checkmate();
        } else if (moveData.check) {
            this.check();
        } else if (moveData.castling) {
            this.castle();
        } else if (moveData.promotion) {
            this.promote();
        } else if (moveData.captured) {
            this.capture();
        } else {
            this.move();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }
}

// Export
window.SoundManager = SoundManager;
