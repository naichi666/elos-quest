// Web Audio API Romantic Fantasy Synthesizer & Sound Effects
class RomanticAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isPlayingBGM = false;
    this.bgmTimer = null;
    this.stepIndex = 0;

    // Romantic Fantasy Harp / Music Box progression in F Major / D Minor
    this.melodyNotes = [
      349.23, 440.00, 523.25, 659.25, // Fmaj7
      587.33, 523.25, 440.00, 523.25,
      293.66, 349.23, 440.00, 587.33, // Dm7
      523.25, 440.00, 392.00, 349.23,
      233.08, 293.66, 349.23, 440.00, // Bbmaj7
      523.25, 587.33, 659.25, 587.33,
      261.63, 329.63, 392.00, 523.25, // C7sus4 -> C
      587.33, 523.25, 440.00, 392.00
    ];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.init();
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  playTone(freq, duration = 0.5, type = 'sine', volume = 0.08, delay = 0) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  startBGM() {
    this.init();
    if (this.isPlayingBGM) return;
    this.isPlayingBGM = true;

    const tick = () => {
      if (!this.isPlayingBGM) return;
      if (!this.isMuted && this.ctx) {
        const note = this.melodyNotes[this.stepIndex % this.melodyNotes.length];
        // Main celesta/music-box note
        this.playTone(note, 0.9, 'sine', 0.055, 0);
        // Subtle harmonic shimmer an octave up every 4 steps
        if (this.stepIndex % 4 === 0) {
          this.playTone(note * 0.5, 1.5, 'triangle', 0.035, 0);
          this.playTone(note * 2, 0.65, 'sine', 0.02, 0.08);
        }
        this.stepIndex++;
      }
      this.bgmTimer = setTimeout(tick, 340);
    };

    tick();
  }

  playHeartCollect(isGolden = false) {
    if (this.isMuted) return;
    this.init();
    if (isGolden) {
      this.playTone(587.33, 0.25, 'triangle', 0.11, 0);
      this.playTone(783.99, 0.25, 'triangle', 0.11, 0.07);
      this.playTone(1046.50, 0.45, 'sine', 0.14, 0.14);
      this.playTone(1318.51, 0.6, 'sine', 0.12, 0.21);
    } else {
      this.playTone(523.25, 0.22, 'sine', 0.1, 0);
      this.playTone(659.25, 0.28, 'sine', 0.11, 0.06);
      this.playTone(783.99, 0.42, 'triangle', 0.1, 0.12);
    }
  }

  playQuestComplete() {
    if (this.isMuted) return;
    this.init();
    const fanfare = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    fanfare.forEach((f, idx) => {
      this.playTone(f, 0.75, 'triangle', 0.11, idx * 0.11);
      this.playTone(f * 0.5, 0.85, 'sine', 0.06, idx * 0.11);
    });
  }

  playDodge() {
    if (this.isMuted) return;
    this.init();
    this.playTone(320, 0.12, 'sine', 0.08, 0);
    this.playTone(480, 0.15, 'triangle', 0.07, 0.05);
  }

  playFireworkBurst() {
    if (this.isMuted) return;
    this.init();
    const chord = [523.25, 659.25, 783.99, 987.77, 1174.66];
    chord.forEach((freq, i) => {
      this.playTone(freq, 0.65, 'sine', 0.06, i * 0.04);
    });
  }
}

window.audioEngine = new RomanticAudioEngine();
