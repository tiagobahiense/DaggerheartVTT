function getAudioContextClass(): typeof AudioContext | null {
  const w = window as Window & { webkitAudioContext?: typeof AudioContext };
  return window.AudioContext || w.webkitAudioContext || null;
}

function createMasterBus(ctx: AudioContext, volume = 0.9) {
  const master = ctx.createGain();
  master.gain.value = volume;
  master.connect(ctx.destination);
  return master;
}

function scheduleFade(
  param: AudioParam,
  start: number,
  peak: number,
  attack: number,
  release: number,
  duration: number
) {
  param.setValueAtTime(0.0001, start);
  param.exponentialRampToValueAtTime(Math.max(peak, 0.0002), start + attack);
  param.exponentialRampToValueAtTime(0.0001, start + duration - release);
}

/** Alerta dramático: impacto grave + drone dissonante + sopro sombrio */
export function playFearAlertSound() {
  try {
    const AudioCtx = getAudioContextClass();
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const master = createMasterBus(ctx, 0.85);

    // Impacto sub-grave (como um golpe no peito)
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(52, now);
    sub.frequency.exponentialRampToValueAtTime(26, now + 2.2);
    scheduleFade(subGain.gain, now, 0.7, 0.035, 0.6, 2.4);
    sub.connect(subGain);
    subGain.connect(master);
    sub.start(now);
    sub.stop(now + 2.4);

    // Dissonância baixa (segunda menor — desconforto)
    [65.41, 69.3].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      scheduleFade(gain.gain, now + 0.12, 0.14, 0.5, 0.9, 3.4);
      osc.connect(gain);
      gain.connect(master);
      osc.start(now + 0.12);
      osc.stop(now + 3.4);
    });

    // Sopro / vento opressivo
    const bufferSize = Math.floor(ctx.sampleRate * 2.8);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.2;
    filter.frequency.setValueAtTime(180, now);
    filter.frequency.exponentialRampToValueAtTime(620, now + 0.45);
    filter.frequency.exponentialRampToValueAtTime(90, now + 2.4);
    const noiseGain = ctx.createGain();
    scheduleFade(noiseGain.gain, now, 0.22, 0.4, 0.5, 2.6);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start(now);

    // Sino/gong distante (parciais inarmônicos)
    [146.83, 185, 233.08].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const start = now + 0.08 + i * 0.04;
      scheduleFade(gain.gain, start, 0.1 / (i + 1), 0.02, 0.4, 2.0);
      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + 2.0);
    });

    setTimeout(() => ctx.close(), 3600);
  } catch {
    /* ignore */
  }
}

/** Token adicionado: brasa/pulso sutil, não um bipe */
export function playFearTokenSound() {
  try {
    const AudioCtx = getAudioContextClass();
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const master = createMasterBus(ctx, 0.5);

    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(72, now);
    thud.frequency.exponentialRampToValueAtTime(48, now + 0.18);
    scheduleFade(thudGain.gain, now, 0.35, 0.015, 0.08, 0.22);
    thud.connect(thudGain);
    thudGain.connect(master);
    thud.start(now);
    thud.stop(now + 0.22);

    const crackleLen = Math.floor(ctx.sampleRate * 0.12);
    const buffer = ctx.createBuffer(1, crackleLen, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < crackleLen; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / crackleLen);
    }
    const crackle = ctx.createBufferSource();
    crackle.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    const crackleGain = ctx.createGain();
    scheduleFade(crackleGain.gain, now + 0.02, 0.08, 0.01, 0.04, 0.14);
    crackle.connect(filter);
    filter.connect(crackleGain);
    crackleGain.connect(master);
    crackle.start(now + 0.02);

    setTimeout(() => ctx.close(), 400);
  } catch {
    /* ignore */
  }
}
