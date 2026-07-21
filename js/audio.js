// ==================== WEB AUDIO SYNTHESIZER ENGINE ====================
const SoundEngine = (() => {
    let audioCtx = null;
    let isMuted = false;
    let isBgmPlaying = false;
    let bgmTimer = null;

    function initCtx() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function toggleMute() {
        isMuted = !isMuted;
        if (isMuted) {
            stopBGM();
        } else if (isBgmPlaying) {
            startBGM();
        }
        return isMuted;
    }

    function playSFX(type) {
        if (isMuted) return;
        initCtx();
        if (!audioCtx) return;

        const now = audioCtx.currentTime;

        switch (type) {
            case 'click': {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.05);
                break;
            }
            case 'bounce': {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(320, now);
                osc.frequency.exponentialRampToValueAtTime(750, now + 0.08);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.08);
                break;
            }
            case 'throw': {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            }
            case 'correct': {
                const notes = [523.25, 659.25, 783.99, 1046.50];
                notes.forEach((freq, idx) => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.07);
                    gain.gain.setValueAtTime(0.18, now + idx * 0.07);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(now + idx * 0.07);
                    osc.stop(now + idx * 0.07 + 0.25);
                });
                break;
            }
            case 'wrong': {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(160, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.22);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.22);
                break;
            }
            case 'buy': {
                [987.77, 1318.51].forEach((freq, idx) => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.06);
                    gain.gain.setValueAtTime(0.2, now + idx * 0.06);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(now + idx * 0.06);
                    osc.stop(now + idx * 0.06 + 0.2);
                });
                break;
            }
            case 'victory': {
                const notes = [523.25, 523.25, 523.25, 659.25, 783.99, 1046.50];
                const times = [0, 0.1, 0.2, 0.3, 0.45, 0.65];
                const durations = [0.08, 0.08, 0.08, 0.12, 0.18, 0.5];
                notes.forEach((freq, idx) => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + times[idx]);
                    gain.gain.setValueAtTime(0.2, now + times[idx]);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + times[idx] + durations[idx]);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(now + times[idx]);
                    osc.stop(now + times[idx] + durations[idx]);
                });
                break;
            }
        }
    }

    function toggleBGM() {
        if (isBgmPlaying) {
            stopBGM();
        } else {
            startBGM();
        }
        return isBgmPlaying;
    }

    function startBGM() {
        if (isMuted) return;
        initCtx();
        if (!audioCtx) return;
        stopBGM();

        const pentatonicScale = [220, 261.63, 293.66, 329.63, 392.00, 440, 523.25];
        let noteIndex = 0;
        isBgmPlaying = true;

        bgmTimer = setInterval(() => {
            if (!isBgmPlaying || isMuted) return;
            const now = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'sine';
            const freq = pentatonicScale[noteIndex % pentatonicScale.length];
            noteIndex = (noteIndex + Math.floor(Math.random() * 3) + 1) % pentatonicScale.length;

            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.03, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.45);
        }, 380);
    }

    function stopBGM() {
        isBgmPlaying = false;
        if (bgmTimer) {
            clearInterval(bgmTimer);
            bgmTimer = null;
        }
    }

    return {
        playSFX,
        toggleBGM,
        toggleMute,
        isMuted: () => isMuted,
        isBgmPlaying: () => isBgmPlaying
    };
})();
