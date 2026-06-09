function getAudioContextClass(): typeof AudioContext | null {
  const w = window as Window & { webkitAudioContext?: typeof AudioContext };
  return window.AudioContext || w.webkitAudioContext || null;
}

export function playFearAlertSound() {
  try {
    const AudioCtx = getAudioContextClass();
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(110, now);
    osc1.frequency.exponentialRampToValueAtTime(55, now + 0.8);
    gain1.gain.setValueAtTime(0.0001, now);
    gain1.gain.exponentialRampToValueAtTime(0.18, now + 0.08);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 1.2);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(880, now + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(220, now + 0.5);
    gain2.gain.setValueAtTime(0.0001, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.08, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.7);

    setTimeout(() => ctx.close(), 1500);
  } catch {
    /* ignore */
  }
}

export function playFearTokenSound() {
  try {
    const AudioCtx = getAudioContextClass();
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.value = 440;
    gain.gain.value = 0.06;

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, 120);
  } catch {
    /* ignore */
  }
}
