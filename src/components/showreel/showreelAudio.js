import { HOLD, RUNTIME, SPEED } from "./renderShowreel";
import tudumUrl from "./netflix-tudum-sfx-n-c.mp3";

/* ============================================================================
   SHOWREEL SOUND — a beat that moves with the picture: a low hum underneath,
   kicks and snares on the animation's own beats, a steady pulse under the
   camera moves, a hard impact on every cut with a riser leading into it,
   pure-noise hats for the small UI steps, and the tudum landing the N.
   Nothing pitched up high, so nothing that chirps. Synthesized with Web Audio,
   except the tudum, which is the supplied recording.

   The whole soundtrack is rendered once, offline, into a buffer. Players
   derive the picture's clock from that buffer's playback position, so sound
   and picture share one clock and can't drift.
   ============================================================================ */

const SR = 48000;
const LEN = RUNTIME + HOLD;   // the reel, plus the tudum's ring-out over the end card

// Cue times below are on the 15s timeline the scenes are authored on; this is
// where they land in real seconds.
const real = (t) => t / SPEED;

const hash = (n) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/* --- the live context ----------------------------------------------------- */
let live = null;
let holders = 0;      // players with their sound on
let idleTimer = 0;

/** Call from inside a click handler: browsers only start audio on a gesture. */
export function unlockShowreelAudio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!live) {
    try { live = new AC({ latencyHint: "playback" }); } catch { live = new AC(); }
  }
  clearTimeout(idleTimer);
  if (live.state !== "running") live.resume().catch(() => {});
  return live;
}
export const showreelAudioContext = () => live;

/** A player turning its sound on or off. The context sleeps once nobody's listening. */
export function holdShowreelAudio() {
  holders++;
  clearTimeout(idleTimer);
}
export function releaseShowreelAudio() {
  holders = Math.max(0, holders - 1);
  if (holders) return;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (!holders && live?.state === "running") live.suspend().catch(() => {});
  }, 400);
}

/** Context time of the sample reaching the speakers right now. */
export const audioNow = (ac) => {
  const ts = ac.getOutputTimestamp?.();
  const age = ts && ts.performanceTime > 0 ? performance.now() - ts.performanceTime : Infinity;
  // a stamp older than this is from before a suspend; extrapolating it would leap ahead
  if (age < 150) return ts.contextTime + age / 1000;
  return ac.currentTime - (ac.outputLatency || ac.baseLatency || 0);
};

/* --- building blocks ------------------------------------------------------ */
const noiseBufs = new WeakMap();
const noise = (ac) => {
  let b = noiseBufs.get(ac);
  if (!b) {
    // seeded, so every render of the soundtrack is identical
    b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = b.getChannelData(0);
    let s = 22695477;
    for (let i = 0; i < d.length; i++) {
      s = (Math.imul(s, 1103515245) + 12345) >>> 0;
      d[i] = s / 2147483648 - 1;
    }
    noiseBufs.set(ac, b);
  }
  return b;
};
const noiseSrc = (ac, t, dur) => {
  const s = ac.createBufferSource();
  s.buffer = noise(ac);
  s.loop = true;
  s.start(t, hash(t * 7.13) * 1.9);
  s.stop(t + dur);
  return s;
};
/** attack to peak, then an exponential fall that's ~gone after `decay` */
const env = (g, t, attack, peak, decay) => {
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.setTargetAtTime(0, t + attack, decay / 4);
};
const panTo = (ac, out, p) => {
  if (!p || !ac.createStereoPanner) return out;
  const n = ac.createStereoPanner();
  n.pan.value = p;
  n.connect(out);
  return n;
};
const osc = (ac, type, f) => {
  const o = ac.createOscillator();
  o.type = type;
  o.frequency.value = f;
  return o;
};
const filter = (ac, type, f, q = 0.7) => {
  const n = ac.createBiquadFilter();
  n.type = type;
  n.frequency.value = f;
  n.Q.value = q;
  return n;
};

/* --- the kit ---------------------------------------------------------------- */

/** Kick: a fast pitch-drop sine with a few ms of beater on the front. */
function kick(ac, out, t, { gain = 0.2, f0 = 140, f1 = 46, decay = 0.38 } = {}) {
  const o = osc(ac, "sine", f0);
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + 0.07);
  const g = ac.createGain();
  env(g, t, 0.0015, gain, decay);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + decay * 1.6 + 0.05);
  const ng = ac.createGain();
  env(ng, t, 0.0005, gain * 0.35, 0.012);
  noiseSrc(ac, t, 0.03).connect(filter(ac, "lowpass", 3500)).connect(ng).connect(out);
}

/** Snare: a crack of band-passed noise over a short, low body. */
function snare(ac, out, t, { gain = 0.08, pan = 0 } = {}) {
  const dst = panTo(ac, out, pan);
  const ng = ac.createGain();
  env(ng, t, 0.001, gain, 0.16);
  noiseSrc(ac, t, 0.3).connect(filter(ac, "highpass", 900)).connect(filter(ac, "bandpass", 2200, 0.7)).connect(ng).connect(dst);
  const o = osc(ac, "triangle", 200);
  o.frequency.setValueAtTime(200, t);
  o.frequency.exponentialRampToValueAtTime(150, t + 0.06);
  const og = ac.createGain();
  env(og, t, 0.001, gain * 0.6, 0.08);
  o.connect(og).connect(dst);
  o.start(t);
  o.stop(t + 0.2);
}

/** Hat: a tick of pure high noise — rhythm with no pitch in it. */
function hat(ac, out, t, { gain = 0.02, decay = 0.035, pan = 0 } = {}) {
  const g = ac.createGain();
  env(g, t, 0.0005, gain, decay);
  noiseSrc(ac, t, decay * 2 + 0.02).connect(filter(ac, "highpass", 7000)).connect(g).connect(panTo(ac, out, pan));
}

/** Tom: a pitched-down knock, for accents and things landing. */
function tom(ac, out, t, { freq = 90, gain = 0.1, decay = 0.22, pan = 0 } = {}) {
  const dst = panTo(ac, out, pan);
  const o = osc(ac, "sine", freq);
  o.frequency.setValueAtTime(freq * 2.2, t);
  o.frequency.exponentialRampToValueAtTime(freq, t + 0.03);
  const g = ac.createGain();
  env(g, t, 0.002, gain, decay);
  o.connect(g).connect(dst);
  o.start(t);
  o.stop(t + decay * 1.5 + 0.05);
  const ng = ac.createGain();
  env(ng, t, 0.001, gain * 0.5, 0.03);
  noiseSrc(ac, t, 0.06).connect(filter(ac, "lowpass", 900)).connect(ng).connect(dst);
}

/** Impact: the hit on a cut — kick, body and a dark burst with a short room. */
function impact(ac, out, t, { gain = 0.26 } = {}) {
  kick(ac, out, t, { gain: gain * 0.9, f0: 120, f1: 40, decay: 0.6 });
  tom(ac, out, t, { freq: 75, gain: gain * 0.5, decay: 0.35 });
  const ng = ac.createGain();
  env(ng, t, 0.002, gain * 0.35, 0.3);
  noiseSrc(ac, t, 0.6).connect(filter(ac, "lowpass", 1400)).connect(ng).connect(out);
}

/** Sub pulse: felt more than heard, under the bigger moments. */
function pulse(ac, out, t, { gain = 0.1 } = {}) {
  [[52, 41, 1, 0.5], [104, 82, 0.35, 0.35]].forEach(([f0, f1, k, decay]) => {
    const o = osc(ac, "sine", f0);
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + 0.35);
    const g = ac.createGain();
    env(g, t, 0.018, gain * k, decay);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + decay * 1.6 + 0.1);
  });
}

// The next four follow a motion on screen, so their `dur` is timeline time and
// stretches with the playback speed the way the motion does.

/** Air moving: band-passed noise with a swept centre. */
function whoosh(ac, out, t, { dur = 0.4, gain = 0.03, from = 500, to = 3000, q = 1, pan = 0 } = {}) {
  const bp = filter(ac, "bandpass", from, q);
  bp.frequency.setValueAtTime(from, t);
  bp.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + dur * 0.6);
  g.gain.linearRampToValueAtTime(0, t + dur);
  noiseSrc(ac, t, dur + 0.02).connect(bp).connect(g).connect(panTo(ac, out, pan));
}
whoosh.follows = true;

/** A riser that stops dead on the cut. */
function riser(ac, out, t, { dur = 0.4, gain = 0.045 } = {}) {
  const bp = filter(ac, "bandpass", 250, 0.9);
  bp.frequency.setValueAtTime(250, t);
  bp.frequency.exponentialRampToValueAtTime(4200, t + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + dur);
  g.gain.linearRampToValueAtTime(0, t + dur + 0.03);
  noiseSrc(ac, t, dur + 0.05).connect(bp).connect(g).connect(out);
}
riser.follows = true;

/** Light gathering or scattering: bright air, no tones in it. */
function air(ac, out, t, { dur = 0.7, gain = 0.02 } = {}) {
  const bp = filter(ac, "bandpass", 3000, 0.7);
  bp.frequency.setValueAtTime(3000, t);
  bp.frequency.exponentialRampToValueAtTime(7000, t + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + dur * 0.45);
  g.gain.linearRampToValueAtTime(0, t + dur);
  noiseSrc(ac, t, dur + 0.02).connect(filter(ac, "highpass", 2500)).connect(bp).connect(g).connect(out);
}
air.follows = true;

/** The cricket ball rolling in from the right, its seam slowing as it does. */
function rumble(ac, out, t, { dur = 0.75, gain = 0.06 } = {}) {
  const g = ac.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.05);
  g.gain.setTargetAtTime(0, t + dur * 0.25, dur / 3);
  const trem = ac.createGain();
  trem.gain.value = 0.5;
  const lfo = osc(ac, "sine", 14);
  lfo.frequency.setValueAtTime(14, t);
  lfo.frequency.exponentialRampToValueAtTime(3, t + dur);
  const depth = ac.createGain();
  depth.gain.value = 0.5;
  lfo.connect(depth).connect(trem.gain);
  let dst = out;
  if (ac.createStereoPanner) {
    dst = ac.createStereoPanner();
    dst.pan.setValueAtTime(0.8, t);
    dst.pan.linearRampToValueAtTime(0.3, t + dur);
    dst.connect(out);
  }
  noiseSrc(ac, t, dur + 0.4).connect(filter(ac, "lowpass", 380, 0.8)).connect(trem).connect(g).connect(dst);
  lfo.start(t);
  lfo.stop(t + dur + 0.4);
}
rumble.follows = true;

/** Fallback for the N if the tudum can't load: a restrained sub-drop hit. */
function hit(ac, out, t, { gain = 0.36 } = {}) {
  const sub = osc(ac, "sine", 62);
  sub.frequency.setValueAtTime(62, t);
  sub.frequency.exponentialRampToValueAtTime(38, t + 0.45);
  const sg = ac.createGain();
  env(sg, t, 0.006, gain, 1.5);
  sub.connect(sg).connect(out);
  sub.start(t);
  sub.stop(t + 2.2);
  const ng = ac.createGain();
  env(ng, t, 0.002, gain * 0.45, 0.12);
  noiseSrc(ac, t, 0.25).connect(filter(ac, "lowpass", 1800)).connect(ng).connect(out);
}

/* --- the hum ---------------------------------------------------------------- */
/** Hum level along the timeline: it opens the reel, drops away for the human beat, swells for the N, then goes. */
const humLevel = (t) => {
  if (t < 0.6) return t / 0.6;
  if (t < 10.4) return 1;
  if (t < 10.9) return 1 - 0.65 * ((t - 10.4) / 0.5);
  if (t < 11.9) return 0.35;
  if (t < 12.4) return 0.35 + 0.65 * ((t - 11.9) / 0.5);
  if (t < 13.0) return 1;
  if (t < 13.15) return 1 - 0.55 * ((t - 13.0) / 0.15);   // ducks under the tudum…
  if (t < 13.9) return 0.45;
  if (t < 14.4) return 0.45 + 0.4 * ((t - 13.9) / 0.5);   // …and comes back for the dive
  if (t < 15.6) return 0.85 * (1 - (t - 14.4) / 1.2);     // then fades out under the end card
  return 0;
};

function hum(ac, out) {
  const lp = filter(ac, "lowpass", 240, 0.6);
  const lfo = osc(ac, "sine", 0.1);
  const depth = ac.createGain();
  depth.gain.value = 70;
  lfo.connect(depth).connect(lp.frequency);
  const level = ac.createGain();
  const pts = Math.ceil(LEN * 50);
  const curve = new Float32Array(pts);
  for (let i = 0; i < pts; i++) curve[i] = 0.055 * humLevel(((i * LEN) / (pts - 1)) * SPEED);
  level.gain.setValueCurveAtTime(curve, 0, LEN);
  lp.connect(level).connect(out);
  [[55, 0.5], [55.07, 0.35], [27.5, 0.28, "triangle"], [110, 0.16], [165, 0.05]].forEach(([f, a, type = "sine"]) => {
    const o = osc(ac, type, f);
    const g = ac.createGain();
    g.gain.value = a;
    o.connect(g).connect(lp);
    o.start(0);
    o.stop(LEN);
  });
  lfo.start(0);
  lfo.stop(LEN);
}

/* --- the score: every cue sits on a visual event in renderShowreel.js ------ */
const CUES = [];
const at = (t, fn, o) => CUES.push([t, fn, o]);

// scene 1 — ignition
at(0.26, whoosh, { dur: 0.36, gain: 0.03, from: 900, to: 4200, q: 3 });          // the seed stretches into a line
for (let i = 0; i < 9; i++) at(0.58 + i * 0.066, hat, { gain: 0.016 + hash(i + 9) * 0.012, pan: 0.6 - i * 0.14 });  // fragments lit by the scan
at(0.8, kick, { gain: 0.2 });                                                    // the name lands
at(0.8, pulse, { gain: 0.1 });
at(1.2, riser, { dur: 0.3, gain: 0.04 });

// scene 2 — the system: a steady pulse under the camera push, 120bpm
at(1.5, impact);
for (let k = 1; k <= 8; k++) at(1.5 + k * 0.25, kick, { gain: k % 2 ? 0.1 : 0.14 });
for (let k = 0; k < 8; k++) at(1.625 + k * 0.25, hat, { gain: 0.015, pan: k % 2 ? 0.3 : -0.3 });
for (let i = 0; i < 7; i++) at(1.52 + i * 0.052, hat, { gain: 0.016, pan: -0.2 + i * 0.1 });   // nodes coming up
at(3.62, riser, { dur: 0.38, gain: 0.045 });                                    // everything rushes into a point

// scene 3 — six engineering beats: a kick on each, snare on the backbeat, hats between
at(4.0, impact);
for (let i = 0; i < 6; i++) {
  const t = 4.0 + i * (2.5 / 6);
  if (i) at(t, kick, { gain: 0.16 });
  if (i % 2) at(t, snare, { gain: 0.075 });
  at(t + 2.5 / 12, hat, { gain: 0.018 });
}
at(5.44, tom, { freq: 140, gain: 0.06, decay: 0.14 });                          // the ledger balances
at(5.78, tom, { freq: 165, gain: 0.06, decay: 0.14 });                          // the scan passes
at(6.2, riser, { dur: 0.3, gain: 0.04 });

// scene 4 — the product surface
at(6.5, impact);
at(6.5, whoosh, { dur: 0.3, gain: 0.02, from: 300, to: 1500 });
for (let k = 0; k < 3; k++) {                                                  // BUILD · SHIP · ITERATE
  at(6.8 + k * 0.24, kick, { gain: 0.17 });
  at(6.8 + k * 0.24, snare, { gain: 0.06 + k * 0.015 });
}
for (let k = 0; k < 7; k++) at(7.08 + k * 0.045, hat, { gain: 0.011, pan: 0.5 });  // table rows streaming in
at(7.5, riser, { dur: 0.24, gain: 0.035 });
at(7.74, impact, { gain: 0.3 });                                                // PRODUCTION, NOT JUST PROTOTYPES.
at(8.2, riser, { dur: 0.3, gain: 0.035 });

// scene 5 — interfaces: a lighter groove while the UI assembles
at(8.5, impact, { gain: 0.2 });
for (let k = 1; k <= 6; k++) at(8.5 + k * 0.25, kick, { gain: 0.09 });
for (let k = 0; k < 6; k++) at(8.625 + k * 0.25, hat, { gain: 0.013 });
for (let k = 0; k < 5; k++) at(8.5 + k * 0.11, whoosh, { dur: 0.22, gain: 0.012, from: 700, to: 2600, pan: k % 2 ? 0.4 : -0.2 });  // panels slide in
for (let k = 0; k < 7; k++) at(9.03 + k * 0.066, hat, { gain: 0.009, decay: 0.02 });   // the caret typing
at(9.36, snare, { gain: 0.06 });                                                // the submit button arrives
for (let k = 0; k < 3; k++) at(9.12 + k * 0.14, tom, { freq: 130 + k * 20, gain: 0.045, decay: 0.12, pan: 0.6 });  // toasts
at(10.2, riser, { dur: 0.3, gain: 0.03 });

// scene 6 — the human beat: the pulse drops out and the hum ducks under it
at(10.5, rumble, { dur: 0.75, gain: 0.06 });                                    // the ball rolls in and slows
at(10.8, tom, { freq: 90, gain: 0.07 });                                        // CODE.
at(11.02, tom, { freq: 100, gain: 0.07 });                                      // CREATE.
at(11.24, kick, { gain: 0.12 });                                                // PLAY.
at(11.42, whoosh, { dur: 0.26, gain: 0.028, from: 400, to: 5000, pan: 0.6 });   // the ball becomes a packet, and it's gone
at(11.7, riser, { dur: 0.3, gain: 0.04 });

// scene 7 — the N: a heartbeat quickening into the fold, then the tudum
at(12.0, impact);
at(12.0, whoosh, { dur: 0.6, gain: 0.03, from: 3000, to: 400 });               // the camera rushes back
at(12.4, air, { dur: 0.8, gain: 0.018 });                                       // light gathering
[12.3, 12.5, 12.64, 12.74].forEach((t, i) => at(t, kick, { gain: 0.08 + i * 0.02 }));
at(12.82, tom, { freq: 95, gain: 0.06, decay: 0.12 });                          // left upright
at(12.94, whoosh, { dur: 0.2, gain: 0.02, from: 1500, to: 500 });               // the ribbon folds over

// scene 8 — the dive into light, and back into the letter
at(14.0, riser, { dur: 0.14, gain: 0.04 });                                     // diving into the stroke
at(14.14, impact, { gain: 0.13 });                                              // it bursts into light
at(14.14, air, { dur: 0.36, gain: 0.026 });
at(14.52, whoosh, { dur: 0.3, gain: 0.022, from: 3500, to: 300 });             // gathering back
at(14.78, kick, { gain: 0.12, decay: 0.6 });                                    // the N re-forms
at(14.78, pulse, { gain: 0.06 });

// The tudum lands the N. Its "DUM" is 0.45s into the file (the "tu" at 0.30s),
// and that DUM sits on the frame the letter lands: 13.22 on the timeline.
const TUDUM = { at: 13.22, dum: 0.45, gain: 1 };

/* --- rendering ------------------------------------------------------------- */
function masterBus(ac) {
  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.knee.value = 10;
  comp.ratio.value = 3;
  comp.attack.value = 0.004;
  comp.release.value = 0.2;
  const g = ac.createGain();
  g.gain.value = 0.85;
  g.connect(comp).connect(ac.destination);
  return g;
}

const decode = (ac, bytes) =>
  new Promise((resolve, reject) => {
    const p = ac.decodeAudioData(bytes, resolve, reject);   // callback form, for older Safari
    if (p && p.then) p.then(resolve, reject);
  });

async function renderScore() {
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const oac = new OAC(2, Math.ceil(LEN * SR), SR);
  const out = masterBus(oac);
  hum(oac, out);
  for (const [t, fn, o = {}] of CUES) {
    fn(oac, out, real(t), fn.follows && o.dur ? { ...o, dur: o.dur / SPEED } : o);
  }
  // the tudum goes in after the compressor, so it keeps its own punch
  try {
    const tudum = await decode(oac, await (await fetch(tudumUrl)).arrayBuffer());
    const src = oac.createBufferSource();
    src.buffer = tudum;
    const g = oac.createGain();
    g.gain.value = TUDUM.gain;
    src.connect(g).connect(oac.destination);
    src.start(real(TUDUM.at) - TUDUM.dum);
  } catch {
    hit(oac, out, real(TUDUM.at));
  }
  return oac.startRendering();
}

let scorePromise = null;
/** The rendered soundtrack, shared by every player. Safe to call early to warm it. */
export function getScore() {
  if (!scorePromise) scorePromise = renderScore().catch((e) => { scorePromise = null; throw e; });
  return scorePromise;
}
