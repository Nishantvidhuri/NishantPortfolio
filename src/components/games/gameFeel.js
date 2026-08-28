/**
 * Shared "game feel" toolkit: synthesized sound, haptics and screen shake.
 * No audio assets — every sound is generated with the Web Audio API, so this
 * adds zero bytes of media to the bundle.
 */

let audioCtx = null;
let muted = typeof localStorage !== "undefined" && localStorage.getItem("gamesMuted") === "1";

export const isMuted = () => muted;
export const setMuted = (m) => {
  muted = m;
  try { localStorage.setItem("gamesMuted", m ? "1" : "0"); } catch {}
};

/** Lazily create the context — browsers require a user gesture first. */
const ac = () => {
  if (muted) return null;
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
};

/** A pitched blip with an exponential decay. */
const tone = ({ freq = 440, to = null, type = "sine", dur = 0.12, vol = 0.18, delay = 0 }) => {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
};

/** Filtered noise burst — impacts, explosions, bat cracks. */
const noise = ({ dur = 0.2, vol = 0.2, freq = 1200, q = 1, type = "lowpass", delay = 0 }) => {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const frames = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, frames, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = type;
  filter.frequency.setValueAtTime(freq, t0);
  filter.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(g).connect(c.destination);
  src.start(t0);
};

export const sfx = {
  // movement
  jump:   () => tone({ freq: 380, to: 760, type: "square", dur: 0.13, vol: 0.10 }),
  flap:   () => tone({ freq: 520, to: 300, type: "triangle", dur: 0.10, vol: 0.10 }),
  bounce: () => tone({ freq: 300, to: 640, type: "sine", dur: 0.14, vol: 0.12 }),
  swipe:  () => tone({ freq: 700, to: 420, type: "sine", dur: 0.07, vol: 0.06 }),

  // impacts
  blip:   () => tone({ freq: 640, type: "square", dur: 0.06, vol: 0.08 }),
  thud:   () => { noise({ dur: 0.16, vol: 0.18, freq: 420 }); tone({ freq: 150, to: 70, type: "sine", dur: 0.16, vol: 0.12 }); },
  brick:  () => tone({ freq: 900, to: 1400, type: "square", dur: 0.06, vol: 0.09 }),
  bat:    () => { noise({ dur: 0.09, vol: 0.32, freq: 2600, q: 2, type: "bandpass" }); tone({ freq: 260, to: 120, type: "triangle", dur: 0.12, vol: 0.14 }); },
  laser:  () => tone({ freq: 1100, to: 420, type: "sawtooth", dur: 0.07, vol: 0.05 }),
  explode:() => { noise({ dur: 0.4, vol: 0.3, freq: 900 }); tone({ freq: 120, to: 45, type: "sawtooth", dur: 0.4, vol: 0.14 }); },

  // rewards
  coin:   () => { tone({ freq: 880, type: "square", dur: 0.07, vol: 0.09 }); tone({ freq: 1320, type: "square", dur: 0.09, vol: 0.08, delay: 0.06 }); },
  score:  () => { tone({ freq: 660, type: "triangle", dur: 0.09, vol: 0.10 }); tone({ freq: 990, type: "triangle", dur: 0.12, vol: 0.09, delay: 0.07 }); },
  cheer:  () => [0, 0.09, 0.18, 0.30].forEach((d, i) =>
            tone({ freq: [523, 659, 784, 1047][i], type: "triangle", dur: 0.24, vol: 0.11, delay: d })),

  // failure
  fail:   () => { tone({ freq: 320, to: 90, type: "sawtooth", dur: 0.45, vol: 0.16 }); noise({ dur: 0.3, vol: 0.12, freq: 500 }); },

  /** Ascending pentatonic step — Tap Tiles uses the streak index. */
  note: (i = 0) => {
    const scale = [523.25, 587.33, 659.25, 783.99, 880.0];
    const f = scale[i % scale.length] * (1 + Math.floor(i / scale.length) * 0.06);
    tone({ freq: f, type: "triangle", dur: 0.16, vol: 0.12 });
  },
};

/** Short vibration on phones. Silent no-op on desktop / when muted. */
export const haptic = (pattern = 12) => {
  if (muted) return;
  try { navigator.vibrate?.(pattern); } catch {}
};

/**
 * Screen shake by nudging the element's transform. Non-invasive: it never
 * touches the game's own render loop, and always restores the transform.
 */
export const shake = (el, strength = 8, ms = 240) => {
  if (!el) return;
  const start = performance.now();
  const base = el.dataset.baseTransform || "";
  const step = (now) => {
    const p = (now - start) / ms;
    if (p >= 1) {
      el.style.transform = base;
      return;
    }
    const decay = (1 - p) * strength;
    const x = (Math.random() * 2 - 1) * decay;
    const y = (Math.random() * 2 - 1) * decay;
    el.style.transform = `${base} translate(${x}px, ${y}px)`;
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
