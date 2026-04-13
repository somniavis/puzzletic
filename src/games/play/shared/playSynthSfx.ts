type WebkitWindow = Window & typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
};

let synthAudioCtx: AudioContext | null = null;
const synthGateTimestamps = new Map<string, number>();

const isPlaySfxEnabled = (): boolean => {
    if (typeof localStorage === 'undefined') return true;
    const settings = localStorage.getItem('puzzleletic_sound_settings');
    if (!settings) return true;

    try {
        const parsed = JSON.parse(settings);
        return parsed.sfxEnabled !== false;
    } catch {
        return true;
    }
};

const shouldAllowSynthSfx = (gateKey: string, minIntervalMs: number): boolean => {
    if (minIntervalMs <= 0) return true;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const lastPlayedAt = synthGateTimestamps.get(gateKey) ?? -Infinity;

    if (now - lastPlayedAt < minIntervalMs) {
        return false;
    }

    synthGateTimestamps.set(gateKey, now);
    return true;
};

const getSynthAudioContext = (): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (synthAudioCtx) return synthAudioCtx;

    const AudioContextCtor = window.AudioContext || (window as WebkitWindow).webkitAudioContext;
    if (!AudioContextCtor) return null;

    synthAudioCtx = new AudioContextCtor();
    return synthAudioCtx;
};

export const primePlaySynthSfx = (): void => {
    const ctx = getSynthAudioContext();
    if (!ctx || ctx.state !== 'suspended') return;
    void ctx.resume().catch(() => undefined);
};

export const playQuietOrbHitSynth = (volume = 0.45, minIntervalMs = 100): void => {
    if (!isPlaySfxEnabled()) return;
    if (!shouldAllowSynthSfx(`quiet-orb-hit-${minIntervalMs}`, minIntervalMs)) return;

    const audioCtx = getSynthAudioContext();
    if (!audioCtx) return;

    try {
        if (audioCtx.state === 'suspended') {
            void audioCtx.resume().catch(() => undefined);
        }

        const now = audioCtx.currentTime;
        const normalizedVolume = Math.max(0, Math.min(1, volume));

        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        const filter1 = audioCtx.createBiquadFilter();

        osc1.type = 'triangle';
        filter1.type = 'lowpass';
        filter1.frequency.setValueAtTime(600, now);
        osc1.connect(filter1);
        filter1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.frequency.setValueAtTime(500, now);
        osc1.frequency.exponentialRampToValueAtTime(150, now + 0.2);
        gain1.gain.setValueAtTime(0.2 * normalizedVolume, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        const filter2 = audioCtx.createBiquadFilter();

        osc2.type = 'sine';
        filter2.type = 'lowpass';
        filter2.frequency.setValueAtTime(300, now);
        osc2.connect(filter2);
        filter2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.frequency.setValueAtTime(120, now);
        osc2.frequency.exponentialRampToValueAtTime(30, now + 0.3);
        gain2.gain.setValueAtTime(0.25 * normalizedVolume, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc1.start(now);
        osc1.stop(now + 0.2);
        osc2.start(now);
        osc2.stop(now + 0.3);
    } catch (error) {
        console.warn('Quiet orb synth playback failed:', error);
    }
};

export const playBombExplodeSynth = (volume = 0.7, minIntervalMs = 120): void => {
    if (!isPlaySfxEnabled()) return;
    if (!shouldAllowSynthSfx(`bomb-explode-${minIntervalMs}`, minIntervalMs)) return;

    const audioCtx = getSynthAudioContext();
    if (!audioCtx) return;

    try {
        if (audioCtx.state === 'suspended') {
            void audioCtx.resume().catch(() => undefined);
        }

        const now = audioCtx.currentTime;
        const normalizedVolume = Math.max(0, Math.min(1, volume));

        const osc = audioCtx.createOscillator();
        const oscTail = audioCtx.createOscillator();
        const filter = audioCtx.createBiquadFilter();
        const tailFilter = audioCtx.createBiquadFilter();
        const gainNode = audioCtx.createGain();
        const tailGain = audioCtx.createGain();
        const delayNode = audioCtx.createDelay(0.4);
        const feedbackGain = audioCtx.createGain();
        const delayTone = audioCtx.createBiquadFilter();

        osc.type = 'sawtooth';
        oscTail.type = 'triangle';

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, now);
        filter.frequency.exponentialRampToValueAtTime(360, now + 0.38);

        tailFilter.type = 'lowpass';
        tailFilter.frequency.setValueAtTime(640, now);

        delayTone.type = 'lowpass';
        delayTone.frequency.setValueAtTime(520, now);
        delayNode.delayTime.setValueAtTime(0.12, now);
        feedbackGain.gain.setValueAtTime(0.22, now);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        gainNode.connect(delayNode);
        delayNode.connect(delayTone);
        delayTone.connect(audioCtx.destination);
        delayTone.connect(feedbackGain);
        feedbackGain.connect(delayNode);

        oscTail.connect(tailFilter);
        tailFilter.connect(tailGain);
        tailGain.connect(audioCtx.destination);

        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(48, now + 0.34);
        oscTail.frequency.setValueAtTime(95, now + 0.02);
        oscTail.frequency.exponentialRampToValueAtTime(42, now + 0.42);

        gainNode.gain.setValueAtTime(0.9 * normalizedVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.34);

        tailGain.gain.setValueAtTime(0.22 * normalizedVolume, now + 0.02);
        tailGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

        osc.start(now);
        osc.stop(now + 0.36);
        oscTail.start(now);
        oscTail.stop(now + 0.5);
    } catch (error) {
        console.warn('Bomb explode synth playback failed:', error);
    }
};
