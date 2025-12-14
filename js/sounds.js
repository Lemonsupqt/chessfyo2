/**
 * DOSTOEVSKY CHESS - Sound Manager
 * Audio feedback for game events
 */

class SoundManager {
    constructor() {
        this.enabled = true;
        this.volume = 0.7;
        this.sounds = {};
        this.audioContext = null;
        
        this.init();
    }

    init() {
        // Create audio context on first user interaction
        const initAudioContext = () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            document.removeEventListener('click', initAudioContext);
            document.removeEventListener('touchstart', initAudioContext);
        };
        
        document.addEventListener('click', initAudioContext);
        document.addEventListener('touchstart', initAudioContext);
        
        // Load settings
        this.loadSettings();
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('dostoevsky-sound-settings');
            if (saved) {
                const data = JSON.parse(saved);
                this.enabled = data.enabled !== false;
                this.volume = data.volume || 0.7;
            }
        } catch (e) {
            console.warn('Could not load sound settings');
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('dostoevsky-sound-settings', JSON.stringify({
                enabled: this.enabled,
                volume: this.volume
            }));
        } catch (e) {
            console.warn('Could not save sound settings');
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        this.saveSettings();
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }

    // Generate sounds using Web Audio API (no external files needed)
    play(soundType) {
        if (!this.enabled || !this.audioContext) return;
        
        try {
            switch (soundType) {
                case 'move':
                    this.playMoveSound();
                    break;
                case 'capture':
                    this.playCaptureSound();
                    break;
                case 'check':
                    this.playCheckSound();
                    break;
                case 'checkmate':
                    this.playCheckmateSound();
                    break;
                case 'castle':
                    this.playCastleSound();
                    break;
                case 'promote':
                    this.playPromoteSound();
                    break;
                case 'select':
                    this.playSelectSound();
                    break;
                case 'gameStart':
                    this.playGameStartSound();
                    break;
                case 'gameEnd':
                    this.playGameEndSound();
                    break;
                case 'error':
                    this.playErrorSound();
                    break;
                case 'notification':
                    this.playNotificationSound();
                    break;
            }
        } catch (e) {
            console.warn('Sound playback error:', e);
        }
    }

    // Individual sound generators
    playMoveSound() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.value = 300;
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
        gain.gain.exponentialDecayTo = 0.01;
        gain.gain.setTargetAtTime(0.01, this.audioContext.currentTime, 0.05);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    playCaptureSound() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.value = 200;
        osc.type = 'sawtooth';
        
        gain.gain.setValueAtTime(this.volume * 0.4, this.audioContext.currentTime);
        gain.gain.setTargetAtTime(0.01, this.audioContext.currentTime, 0.08);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.15);
    }

    playCheckSound() {
        // Two-tone alert
        const playTone = (freq, startTime, duration) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.frequency.value = freq;
            osc.type = 'sine';
            
            gain.gain.setValueAtTime(this.volume * 0.4, startTime);
            gain.gain.setTargetAtTime(0.01, startTime + duration * 0.7, 0.05);
            
            osc.start(startTime);
            osc.stop(startTime + duration);
        };
        
        const now = this.audioContext.currentTime;
        playTone(523, now, 0.1);        // C5
        playTone(659, now + 0.1, 0.1);  // E5
    }

    playCheckmateSound() {
        // Dramatic chord
        const frequencies = [261, 329, 392, 523]; // C major chord
        
        frequencies.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.frequency.value = freq;
            osc.type = 'sine';
            
            const now = this.audioContext.currentTime;
            gain.gain.setValueAtTime(this.volume * 0.3, now);
            gain.gain.setTargetAtTime(0.01, now + 0.5, 0.3);
            
            osc.start(now + i * 0.05);
            osc.stop(now + 1);
        });
    }

    playCastleSound() {
        // Two quick sounds
        const playTone = (freq, startTime) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.frequency.value = freq;
            osc.type = 'sine';
            
            gain.gain.setValueAtTime(this.volume * 0.3, startTime);
            gain.gain.setTargetAtTime(0.01, startTime, 0.05);
            
            osc.start(startTime);
            osc.stop(startTime + 0.1);
        };
        
        const now = this.audioContext.currentTime;
        playTone(300, now);
        playTone(350, now + 0.08);
    }

    playPromoteSound() {
        // Rising tone
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.setValueAtTime(300, this.audioContext.currentTime);
        osc.frequency.linearRampToValueAtTime(600, this.audioContext.currentTime + 0.2);
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
        gain.gain.setTargetAtTime(0.01, this.audioContext.currentTime + 0.15, 0.05);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.25);
    }

    playSelectSound() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.value = 400;
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(this.volume * 0.15, this.audioContext.currentTime);
        gain.gain.setTargetAtTime(0.01, this.audioContext.currentTime, 0.03);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.05);
    }

    playGameStartSound() {
        // Fanfare
        const notes = [
            { freq: 392, time: 0, duration: 0.15 },     // G4
            { freq: 523, time: 0.15, duration: 0.15 },  // C5
            { freq: 659, time: 0.3, duration: 0.3 }     // E5
        ];
        
        const now = this.audioContext.currentTime;
        
        notes.forEach(note => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.frequency.value = note.freq;
            osc.type = 'sine';
            
            gain.gain.setValueAtTime(this.volume * 0.3, now + note.time);
            gain.gain.setTargetAtTime(0.01, now + note.time + note.duration * 0.7, 0.1);
            
            osc.start(now + note.time);
            osc.stop(now + note.time + note.duration);
        });
    }

    playGameEndSound() {
        // Descending tones
        const notes = [
            { freq: 523, time: 0, duration: 0.2 },
            { freq: 392, time: 0.2, duration: 0.2 },
            { freq: 330, time: 0.4, duration: 0.4 }
        ];
        
        const now = this.audioContext.currentTime;
        
        notes.forEach(note => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.frequency.value = note.freq;
            osc.type = 'sine';
            
            gain.gain.setValueAtTime(this.volume * 0.25, now + note.time);
            gain.gain.setTargetAtTime(0.01, now + note.time + note.duration * 0.6, 0.15);
            
            osc.start(now + note.time);
            osc.stop(now + note.time + note.duration);
        });
    }

    playErrorSound() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.value = 150;
        osc.type = 'square';
        
        gain.gain.setValueAtTime(this.volume * 0.2, this.audioContext.currentTime);
        gain.gain.setTargetAtTime(0.01, this.audioContext.currentTime, 0.1);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.15);
    }

    playNotificationSound() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
        osc.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.1);
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(this.volume * 0.25, this.audioContext.currentTime);
        gain.gain.setTargetAtTime(0.01, this.audioContext.currentTime + 0.15, 0.05);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.2);
    }
}

// Create global instance
window.sounds = new SoundManager();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundManager;
}
