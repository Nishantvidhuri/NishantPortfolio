/* ============================================================================
   HERO SHOWREEL RENDERER — a 15-second seamless cinematic loop.

   renderFrame(ctx, t) is a pure function of time: the same t always paints the
   same frame. The live hero (HeroShowreel.jsx) and the video exporter below
   both drive it.

   Everything is drawn into a virtual 1920x1080 stage and cover-fitted to the
   container, so all the coordinates below read like a motion-graphics timeline
   rather than like responsive CSS.

   Composition rule held throughout: the left 40% stays dark and quiet so hero
   copy sits on top of it cleanly. Action lives centre-right.
   ============================================================================ */

export const DUR = 15;
export const VW = 1920;
export const VH = 1080;
// Centre of gravity for the whole composition. The hero copy owns the left of
// the frame, so the action is anchored centre-right rather than dead centre.
export const AX = 1280;
// the seed pixel that opens scene 1 and closes scene 8 — the loop seam
const SEED_X = AX, SEED_Y = 540;

const RED = [229, 9, 20];
const GRN = [70, 211, 105];
const RED_T = [255, 74, 82];   // a lit red that survives small type on black
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

/* --- timeline maths ------------------------------------------------------- */
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const inv = (t, a, b) => clamp01((t - a) / (b - a));
const lerp = (a, b, p) => a + (b - a) * p;
const outCubic = (p) => 1 - Math.pow(1 - p, 3);
const inCubic = (p) => p * p * p;
const inOutCubic = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const outExpo = (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
const inExpo = (p) => (p <= 0 ? 0 : Math.pow(2, 10 * p - 10));
const outBack = (p) => {
  const c1 = 1.9, c3 = c1 + 1;
  return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
};
// rises to 1 and falls back to 0 across [a,b]
const arc = (t, a, b) => Math.sin(inv(t, a, b) * Math.PI);
// 1 inside [a,b] with short eased edges
const band = (t, a, b, fade = 0.12) =>
  Math.min(outCubic(inv(t, a, a + fade)), 1 - inCubic(inv(t, b - fade, b)));

/* --- deterministic noise so the loop is identical every cycle ------------- */
const hash = (n) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/* --- drawing primitives -------------------------------------------------- */
const glow = (ctx, color, blur, fn) => {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  fn();
  ctx.restore();
};

const seg = (ctx, x1, y1, x2, y2, color, w = 1) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};

const dot = (ctx, x, y, r, color) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
};

const rrect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

/** Bebas-style display type with manual letter tracking. */
const tracked = (ctx, str, x, y, tracking, align = "left") => {
  let total = -tracking;
  for (const ch of str) total += ctx.measureText(ch).width + tracking;
  let sx = align === "center" ? x - total / 2 : align === "right" ? x - total : x;
  for (const ch of str) {
    ctx.fillText(ch, sx, y);
    sx += ctx.measureText(ch).width + tracking;
  }
  return total;
};

const setFont = (ctx, size, { display = true, weight = 400 } = {}) => {
  ctx.font = display
    ? `${size}px "Bebas Neue", "Oswald", Impact, sans-serif`
    : `${weight} ${size}px "Inter", "Poppins", system-ui, sans-serif`;
};

/**
 * Chromatic fringe: paints the same callback three times, red and cyan offset
 * and additively blended. Cheap, and only used on transition frames.
 */
const fringe = (ctx, amount, fn) => {
  if (amount < 0.01) { fn("#fff"); return; }
  const d = amount * 9;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.translate(-d, 0); fn("rgba(255,40,50,0.55)");
  ctx.translate(2 * d, 0); fn("rgba(40,220,255,0.45)");
  ctx.restore();
  fn("#fff");
};

/* --- the architecture graph used in scenes 2 and 7 ----------------------- */
const NODES = [
  { id: "client",  x: -440, y: -150, z:  520, label: "CLIENT",        sub: "REACT · NEXT.JS" },
  { id: "api",     x: -200, y:  -60, z:  260, label: "API GATEWAY",   sub: "NODE · EXPRESS" },
  { id: "queue",   x:  270, y:  120, z:   40, label: "QUEUE",         sub: "BULLMQ · REDIS" },
  { id: "worker",  x:  640, y: -120, z: -180, label: "WORKERS",       sub: "ASYNC JOBS" },
  { id: "db",      x:  190, y:  270, z: -430, label: "DATABASE",      sub: "POSTGRESQL" },
  { id: "store",   x:  700, y:  250, z: -360, label: "OBJECT STORE",  sub: "AWS S3" },
  { id: "events",  x:   40, y: -290, z: -620, label: "EVENT STREAM",  sub: "SSE · WEBHOOKS" },
];
const EDGES = [
  ["client", "api"], ["api", "queue"], ["queue", "worker"],
  ["worker", "db"], ["worker", "store"], ["api", "db"], ["worker", "events"],
  ["events", "client"],
];

const FOCAL = 1150;
const project = (n, camZ, cx = AX - 90, cy = 540) => {
  const zz = n.z - camZ;
  const s = FOCAL / Math.max(140, FOCAL + zz);
  return { x: cx + n.x * s, y: cy + n.y * s, s, depth: zz };
};

/* ============================================================================
   SCENE 1 — 0.0 → 1.5s  IGNITION
   A single red pixel becomes a line, the line scans the frame and leaves
   architecture fragments in its wake, the name resolves, a wipe clears it.
   ============================================================================ */
function scene1(ctx, t) {
  const SX = SEED_X, SY = SEED_Y;

  // the seed
  const seedIn = outCubic(inv(t, 0.06, 0.30));
  const stretch = outExpo(inv(t, 0.26, 0.60));

  // seed → horizontal line. Frame 0 must be exactly scene 8's last frame (a
  // 1.6px dot on a 3px stub, 12px glow), so the seed is already lit here and
  // grows from there rather than from nothing — otherwise it blinks at the loop.
  const halfW = lerp(1.5, 1180, stretch);
  const lineA = 1 - inCubic(inv(t, 1.34, 1.44));
  if (lineA > 0.01) {
    const g = ctx.createLinearGradient(SX - halfW, 0, SX + halfW, 0);
    g.addColorStop(0, rgba(RED, 0));
    g.addColorStop(0.5, rgba(RED, 0.95 * lineA));
    g.addColorStop(1, rgba(RED, 0));
    glow(ctx, rgba(RED, 0.85 * lineA), lerp(12, 26, stretch) * lineA, () => {
      ctx.fillStyle = g;
      const th = lerp(2.8, 2.2, stretch);
      ctx.fillRect(SX - halfW, SY - th / 2, halfW * 2, th);
      if (seedIn < 1) dot(ctx, SX, SY, lerp(1.6, 4, seedIn), rgba(RED, 1));
    });
  }

  // scan head travelling right → left, revealing wireframe fragments
  const scanP = inOutCubic(inv(t, 0.52, 1.18));
  const scanX = lerp(VW + 120, 240, scanP);
  const scanLive = band(t, 0.52, 1.20, 0.08);

  // fragments of the architecture, only lit near the scan head
  if (scanLive > 0.01) {
    ctx.save();
    for (let i = 0; i < 16; i++) {
      const fx = 300 + hash(i * 3.1) * 1480;
      const fy = 180 + hash(i * 7.7) * 740;
      const near = 1 - clamp01(Math.abs(fx - scanX) / 300);
      if (near <= 0.02) continue;
      const a = near * near * 0.5 * scanLive;
      const w = 70 + hash(i * 2.3) * 130;
      const h = 26 + hash(i * 5.1) * 22;
      ctx.strokeStyle = `rgba(255,255,255,${a})`;
      ctx.lineWidth = 1;
      rrect(ctx, fx, fy, w, h, 3);
      ctx.stroke();
      // a tick of a connection leaving the box
      seg(ctx, fx + w, fy + h / 2, fx + w + 40, fy + h / 2, `rgba(255,255,255,${a * 0.5})`, 1);
      dot(ctx, fx + w + 44, fy + h / 2, 2, rgba(RED, a));
      setFont(ctx, 13, { display: false, weight: 500 });
      ctx.fillStyle = `rgba(255,255,255,${a * 0.75})`;
      ctx.fillText(["GET /v1", "POST /jobs", "sse:open", "tenant_id", "202 ACCEPTED", "worker.ack"][i % 6], fx + 8, fy + 18);
    }
    ctx.restore();

    // the head itself
    const hg = ctx.createLinearGradient(scanX - 60, 0, scanX + 8, 0);
    hg.addColorStop(0, "rgba(255,255,255,0)");
    hg.addColorStop(1, `rgba(255,255,255,${0.5 * scanLive})`);
    ctx.fillStyle = hg;
    ctx.fillRect(scanX - 60, 0, 68, VH);
    glow(ctx, rgba(RED, 0.9), 30, () => {
      ctx.fillStyle = `rgba(255,255,255,${0.85 * scanLive})`;
      ctx.fillRect(scanX - 1, 0, 2, VH);
    });
  }

  // the name resolves out of the line
  const nameP = outExpo(inv(t, 0.80, 1.22));
  const nameOut = 1 - inCubic(inv(t, 1.34, 1.48));
  if (nameP > 0 && nameOut > 0) {
    ctx.save();
    ctx.globalAlpha = nameOut;
    setFont(ctx, 128);
    const trk = lerp(46, 12, nameP);
    ctx.textBaseline = "alphabetic";
    fringe(ctx, (1 - nameP) * 0.9, (col) => {
      ctx.fillStyle = col === "#fff" ? `rgba(255,255,255,${nameP})` : col;
      tracked(ctx, "NISHANT VIDHURI", AX, SY - 26, trk, "center");
    });
    setFont(ctx, 26, { display: false, weight: 500 });
    ctx.fillStyle = rgba(RED_T, nameP);
    tracked(ctx, "FULL-STACK SOFTWARE ENGINEER", AX, SY + 52, lerp(22, 9, nameP), "center");
    ctx.restore();
  }
}

/* ============================================================================
   SCENE 2 — 1.5 → 4.0s  THE SYSTEM COMES ALIVE
   A real service topology in depth. Camera pushes through it while request
   packets run the edges; labels resolve as the camera reaches each node.
   ============================================================================ */
function drawGraph(ctx, t, camZ, reveal, opts = {}) {
  const { cx = AX - 90, cy = 540, labels = true, packetT = t } = opts;
  const pts = {};
  for (const n of NODES) pts[n.id] = project(n, camZ, cx, cy);

  // edges, back to front
  const ordered = [...EDGES].sort(
    (a, b) => pts[b[0]].depth + pts[b[1]].depth - (pts[a[0]].depth + pts[a[1]].depth)
  );
  ordered.forEach(([a, b], i) => {
    const p = pts[a], q = pts[b];
    const on = clamp01((reveal - i * 0.055) * 4);
    if (on <= 0.01) return;
    const ex = lerp(p.x, q.x, outCubic(on));
    const ey = lerp(p.y, q.y, outCubic(on));
    const ew = Math.min(4.5, Math.max(0.8, 1.9 * p.s));
    const ea = Math.min(0.5, 0.24 + 0.14 * p.s);
    seg(ctx, p.x, p.y, ex, ey, `rgba(255,255,255,${ea})`, ew);

    // packets
    if (on > 0.9) {
      for (let k = 0; k < 2; k++) {
        const ph = (packetT * (0.55 + hash(i * 4.4 + k) * 0.5) + hash(i * 9.1 + k * 3)) % 1;
        const px = lerp(p.x, q.x, ph);
        const py = lerp(p.y, q.y, ph);
        const s = lerp(p.s, q.s, ph);
        const col = i % 3 === 2 ? GRN : RED;
        glow(ctx, rgba(col, 0.95), 16 * s, () => dot(ctx, px, py, Math.max(1.4, 4.2 * s), rgba(col, 0.95)));
        // trail
        const tg = ctx.createLinearGradient(lerp(p.x, q.x, Math.max(0, ph - 0.12)), lerp(p.y, q.y, Math.max(0, ph - 0.12)), px, py);
        tg.addColorStop(0, rgba(col, 0));
        tg.addColorStop(1, rgba(col, 0.55));
        seg(ctx, lerp(p.x, q.x, Math.max(0, ph - 0.12)), lerp(p.y, q.y, Math.max(0, ph - 0.12)), px, py, tg, Math.max(0.8, 2.4 * s));
      }
    }
  });

  // nodes, back to front
  [...NODES].sort((a, b) => pts[b.id].depth - pts[a.id].depth).forEach((n, i) => {
    const p = pts[n.id];
    if (p.depth < -FOCAL + 200) return;
    const on = clamp01((reveal - i * 0.05) * 5);
    if (on <= 0.01) return;
    const near = clamp01(1 - Math.abs(p.depth) / 900);
    const r = 9 * p.s * outBack(on);
    const a = (0.35 + 0.65 * near) * on;

    // node ring + core
    ctx.strokeStyle = `rgba(255,255,255,${a * 0.8})`;
    ctx.lineWidth = Math.max(1, 2 * p.s);
    ctx.beginPath();
    ctx.arc(p.x, p.y, r + 10 * p.s, 0, Math.PI * 2);
    ctx.stroke();
    glow(ctx, rgba(RED, a), 22 * p.s, () => dot(ctx, p.x, p.y, r, rgba(RED, a)));

    if (!labels || near < 0.24) return;
    const la = clamp01((near - 0.24) / 0.3) * on;
    setFont(ctx, Math.max(13, 36 * p.s), { display: true });
    ctx.fillStyle = `rgba(255,255,255,${la})`;
    tracked(ctx, n.label, p.x + Math.min(46, 26 * p.s), p.y - 10 * p.s, 2.5 * p.s);
    setFont(ctx, Math.max(10, 17 * p.s), { display: false, weight: 600 });
    ctx.fillStyle = rgba(RED_T, la * 0.9);
    tracked(ctx, n.sub, p.x + Math.min(46, 26 * p.s), p.y + 14 * p.s, 1.6 * p.s);
  });
  return pts;
}

function scene2(ctx, t) {
  const lt = t - 1.5;                       // 0 → 2.5
  const camZ = lerp(-980, 430, inOutCubic(clamp01(lt / 2.5)));
  const reveal = outCubic(inv(lt, 0.0, 0.85));
  const collapse = inExpo(inv(lt, 2.12, 2.5));

  ctx.save();
  // everything rushes into a point for the cut
  if (collapse > 0) {
    ctx.translate(AX - 90, 540);
    ctx.scale(1 - collapse * 0.97, 1 - collapse * 0.97);
    ctx.translate(-(AX - 90), -540);
    ctx.globalAlpha = 1 - collapse * 0.55;
  }
  drawGraph(ctx, t, camZ, reveal, { packetT: t });
  ctx.restore();

  // running telemetry, bottom-right, stays clear of hero copy
  const telA = band(lt, 0.7, 2.15, 0.25);
  if (telA > 0.01) {
    setFont(ctx, 17, { display: false, weight: 600 });
    const rows = [
      ["p95 latency", "82 ms"],
      ["jobs / min", String(1240 + Math.floor((lt * 37) % 90))],
      ["queue depth", String(3 + Math.floor(arc(lt, 0.7, 2.2) * 9))],
      ["uptime", "99.97 %"],
    ];
    rows.forEach(([k, v], i) => {
      const a = telA * clamp01((lt - 0.7 - i * 0.09) * 6);
      ctx.fillStyle = `rgba(255,255,255,${a * 0.62})`;
      ctx.fillText(k.toUpperCase(), 1520, 840 + i * 30);
      ctx.fillStyle = i === 3 ? rgba(GRN, a) : `rgba(255,255,255,${a})`;
      ctx.textAlign = "right";
      ctx.fillText(v, 1830, 840 + i * 30);
      ctx.textAlign = "left";
    });
    seg(ctx, 1520, 812, 1830, 812, `rgba(255,255,255,${telA * 0.32})`, 1);
  }
}

/* ============================================================================
   SCENE 3 — 4.0 → 6.5s  ENGINEERING CREDENTIALS
   Six 0.4s beats. Each one is a small diagram that states a capability.
   ============================================================================ */
const BEATS = [
  { label: "MULTI-TENANT ARCHITECTURE", sub: "ISOLATED BY DESIGN" },
  { label: "ASYNC WORKFLOWS", sub: "QUEUES · WORKERS · RETRIES" },
  { label: "REAL-TIME EVENTS", sub: "SERVER-SENT STREAMS" },
  { label: "BILLING SYSTEMS", sub: "LEDGERS THAT BALANCE" },
  { label: "SECURE PIPELINES", sub: "SIGNED · SCANNED · STORED" },
  { label: "AUTHENTICATION", sub: "ROTATING TOKENS" },
];

function beatArt(ctx, i, p, cx, cy) {
  const A = 0.9;
  ctx.lineWidth = 2;

  if (i === 0) {
    // one container splitting into four isolated tenants
    const split = outCubic(clamp01(p * 1.6));
    const g = 110 * split;
    for (let k = 0; k < 4; k++) {
      const ox = (k % 2 ? 1 : -1) * g;
      const oy = (k < 2 ? -1 : 1) * g * 0.7;
      const a = A * clamp01(p * 3 - k * 0.15);
      ctx.strokeStyle = `rgba(255,255,255,${a * 0.85})`;
      rrect(ctx, cx + ox - 92, cy + oy - 58, 184, 116, 8);
      ctx.stroke();
      ctx.fillStyle = rgba(RED, a * 0.12);
      ctx.fill();
      dot(ctx, cx + ox - 74, cy + oy - 40, 4, rgba(RED, a));
      setFont(ctx, 14, { display: false, weight: 600 });
      ctx.fillStyle = `rgba(255,255,255,${a * 0.7})`;
      ctx.fillText(`ORG_${k + 1}`, cx + ox - 62, cy + oy - 35);
      for (let r = 0; r < 3; r++) {
        ctx.fillStyle = `rgba(255,255,255,${a * 0.18})`;
        ctx.fillRect(cx + ox - 74, cy + oy - 12 + r * 16, 120 - r * 26, 5);
      }
    }
  } else if (i === 1) {
    // messages entering a queue, a worker draining it
    ctx.strokeStyle = `rgba(255,255,255,${A * 0.8})`;
    rrect(ctx, cx - 190, cy - 44, 250, 88, 6);
    ctx.stroke();
    for (let k = 0; k < 6; k++) {
      const ph = (p * 2.2 + k / 6) % 1;
      const a = A * Math.sin(ph * Math.PI);
      ctx.fillStyle = rgba(RED, a);
      ctx.fillRect(lerp(cx - 178, cx + 34, ph), cy - 14, 26, 28);
    }
    // worker
    const spin = p * 9;
    ctx.save();
    ctx.translate(cx + 190, cy);
    ctx.rotate(spin);
    ctx.strokeStyle = rgba(GRN, A);
    ctx.lineWidth = 3;
    for (let k = 0; k < 6; k++) {
      ctx.beginPath();
      ctx.arc(0, 0, 44, (k / 6) * Math.PI * 2, (k / 6) * Math.PI * 2 + 0.6);
      ctx.stroke();
    }
    ctx.restore();
    dot(ctx, cx + 190, cy, 9, rgba(GRN, A));
    seg(ctx, cx + 60, cy, cx + 142, cy, `rgba(255,255,255,${A * 0.4})`, 2);
    setFont(ctx, 14, { display: false, weight: 600 });
    ctx.fillStyle = `rgba(255,255,255,${A * 0.55})`;
    ctx.fillText("ENQUEUE", cx - 188, cy - 56);
    ctx.fillText("ACK", cx + 168, cy + 72);
  } else if (i === 2) {
    // an SSE pulse leaving the server and repainting the client
    seg(ctx, cx - 210, cy, cx + 210, cy, `rgba(255,255,255,${A * 0.22})`, 2);
    dot(ctx, cx - 210, cy, 11, rgba(RED, A));
    ctx.strokeStyle = `rgba(255,255,255,${A * 0.8})`;
    rrect(ctx, cx + 150, cy - 74, 150, 148, 8);
    ctx.stroke();
    for (let k = 0; k < 4; k++) {
      const ph = (p * 2.6 + k * 0.25) % 1;
      const x = lerp(cx - 204, cx + 148, ph);
      glow(ctx, rgba(RED, 0.9), 18, () => dot(ctx, x, cy, 6, rgba(RED, A)));
      // expanding ring at the origin
      const rr = ph * 54;
      ctx.strokeStyle = rgba(RED, A * (1 - ph) * 0.5);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx - 210, cy, rr, 0, Math.PI * 2);
      ctx.stroke();
    }
    // client rows updating in place
    for (let r = 0; r < 4; r++) {
      const hot = ((p * 2.6 * 4) % 4 | 0) === r;
      ctx.fillStyle = hot ? rgba(GRN, A) : `rgba(255,255,255,${A * 0.2})`;
      ctx.fillRect(cx + 168, cy - 52 + r * 28, hot ? 114 : 88, 8);
    }
  } else if (i === 3) {
    // a ledger balancing to zero
    ctx.strokeStyle = `rgba(255,255,255,${A * 0.75})`;
    seg(ctx, cx, cy - 92, cx, cy + 92, `rgba(255,255,255,${A * 0.3})`, 2);
    for (let r = 0; r < 4; r++) {
      const a = A * clamp01(p * 3 - r * 0.18);
      setFont(ctx, 20, { display: false, weight: 500 });
      ctx.textAlign = "right";
      ctx.fillStyle = `rgba(255,255,255,${a * 0.85})`;
      ctx.fillText(["1,200.00", "340.00", "89.50", "12.00"][r], cx - 24, cy - 56 + r * 38);
      ctx.textAlign = "left";
      ctx.fillStyle = rgba(GRN, a * 0.9);
      ctx.fillText(["1,200.00", "340.00", "89.50", "12.00"][r], cx + 24, cy - 56 + r * 38);
    }
    const bal = clamp01(p * 2.4 - 1.1);
    if (bal > 0) {
      seg(ctx, cx - 190, cy + 108, cx + 190, cy + 108, `rgba(255,255,255,${bal * 0.4})`, 2);
      setFont(ctx, 30);
      ctx.fillStyle = rgba(GRN, bal);
      tracked(ctx, "BALANCED  ·  0.00", cx, cy + 148, 4, "center");
    }
  } else if (i === 4) {
    // document → signed URL → object store → scan passes
    const stages = ["UPLOAD", "SIGN", "STORE", "SCAN"];
    for (let k = 0; k < 4; k++) {
      const a = A * clamp01(p * 3.4 - k * 0.22);
      const x = cx - 240 + k * 160;
      ctx.strokeStyle = `rgba(255,255,255,${a * 0.8})`;
      rrect(ctx, x - 52, cy - 48, 104, 96, 6);
      ctx.stroke();
      setFont(ctx, 14, { display: false, weight: 600 });
      ctx.fillStyle = `rgba(255,255,255,${a * 0.75})`;
      ctx.textAlign = "center";
      ctx.fillText(stages[k], x, cy + 70);
      ctx.textAlign = "left";
      if (k < 3) seg(ctx, x + 54, cy, x + 106, cy, rgba(RED, a * 0.7), 2);
      // glyph
      ctx.strokeStyle = rgba(k === 3 ? GRN : RED, a);
      ctx.lineWidth = 3;
      if (k === 3) {
        ctx.beginPath();
        ctx.moveTo(x - 20, cy);
        ctx.lineTo(x - 4, cy + 16);
        ctx.lineTo(x + 22, cy - 18);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(x, cy, 20, 0, Math.PI * 2 * clamp01(p * 3.4 - k * 0.22));
        ctx.stroke();
      }
    }
  } else {
    // a token rotating inside a shield
    const rot = p * Math.PI * 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = `rgba(255,255,255,${A * 0.7})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -104);
    ctx.lineTo(84, -64);
    ctx.lineTo(84, 34);
    ctx.quadraticCurveTo(84, 92, 0, 116);
    ctx.quadraticCurveTo(-84, 92, -84, 34);
    ctx.lineTo(-84, -64);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = rgba(RED, A * 0.1);
    ctx.fill();
    ctx.rotate(rot);
    for (let k = 0; k < 3; k++) {
      ctx.strokeStyle = rgba(RED, A * (1 - k * 0.22));
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 26 + k * 16, k * 1.4, k * 1.4 + 2.1);
      ctx.stroke();
    }
    ctx.restore();
    setFont(ctx, 16, { display: false, weight: 500 });
    ctx.fillStyle = `rgba(255,255,255,${A * 0.5})`;
    ctx.textAlign = "center";
    ctx.fillText("jwt · refresh · revoke", cx, cy + 162);
    ctx.textAlign = "left";
  }
}

function scene3(ctx, t) {
  const lt = t - 4.0;                       // 0 → 2.5
  const STEP = 2.5 / BEATS.length;
  const i = Math.min(BEATS.length - 1, Math.floor(lt / STEP));
  const p = (lt - i * STEP) / STEP;

  // hard-cut feel: brief black flash + fringe at each boundary
  const cut = 1 - clamp01(p / 0.1);

  ctx.save();
  ctx.globalAlpha = Math.min(1, clamp01(p / 0.08) * (1 - inCubic(clamp01((p - 0.86) / 0.14)) * 0.9));
  // slight push per beat keeps it alive
  const push = 1.22 + p * 0.05;
  ctx.translate(AX, 470);
  ctx.scale(push, push);
  ctx.translate(-AX, -470);
  beatArt(ctx, i, p, AX, 470);
  ctx.restore();

  // the claim
  const b = BEATS[i];
  ctx.save();
  ctx.globalAlpha = clamp01(p / 0.12) * (1 - inCubic(clamp01((p - 0.82) / 0.18)));
  setFont(ctx, 58);
  fringe(ctx, cut * 0.8, (col) => {
    ctx.fillStyle = col;
    tracked(ctx, b.label, AX, 830, lerp(18, 7, outExpo(clamp01(p * 3))), "center");
  });
  setFont(ctx, 20, { display: false, weight: 600 });
  ctx.fillStyle = rgba(RED_T, 1);
  tracked(ctx, b.sub, AX, 868, 7, "center");
  ctx.restore();

  // beat counter
  setFont(ctx, 15, { display: false, weight: 600 });
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillText(`0${i + 1} / 0${BEATS.length}`, 1770, 176);
}

/* ============================================================================
   SCENE 4 — 6.5 → 8.5s  REAL-WORLD IMPACT
   A dark product surface assembles itself: metrics, a chart, a table, then a
   node-editor workflow. Pulls back to a statement.
   ============================================================================ */
function scene4(ctx, t) {
  const lt = t - 6.5;                       // 0 → 2.0
  // the product surface is the widest thing in the reel; it sits a notch right
  // of the anchor so its left edge stays off the hero copy
  const DX = AX + 80;
  const pull = inOutCubic(inv(lt, 1.18, 2.0));
  const s = lerp(0.96, 0.74, pull);

  ctx.save();
  ctx.translate(DX, 470);
  ctx.scale(s, s);
  ctx.globalAlpha = 1 - inCubic(inv(lt, 1.82, 2.0)) * 0.35;
  ctx.translate(-DX, -470);

  // app shell
  const shell = outCubic(inv(lt, 0.0, 0.30));
  if (shell > 0) {
    ctx.globalAlpha *= shell;
    ctx.fillStyle = "rgba(14,14,17,0.92)";
    rrect(ctx, DX - 560 * shell, 470 - 330 * shell, 1120 * shell, 660 * shell, 12);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  if (shell > 0.85) {
    const X = DX - 560, Y = 140, H = 660;
    // sidebar
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.fillRect(X, Y, 168, H);
    seg(ctx, X + 168, Y, X + 168, Y + H, "rgba(255,255,255,0.08)", 1);
    dot(ctx, X + 34, Y + 36, 8, rgba(RED, 0.95));
    for (let r = 0; r < 6; r++) {
      const a = clamp01((lt - 0.26 - r * 0.03) * 8);
      ctx.fillStyle = r === 1 ? rgba(RED, 0.75 * a) : `rgba(255,255,255,${0.16 * a})`;
      ctx.fillRect(X + 22, Y + 78 + r * 34, r === 1 ? 118 : 96, 7);
    }

    // metric cards
    const cards = [["ACTIVE ORGS", "128", GRN], ["JOBS TODAY", "41.2K", RED], ["ERROR RATE", "0.02%", GRN]];
    cards.forEach(([k, v, c], r) => {
      const a = outCubic(clamp01((lt - 0.30 - r * 0.07) * 6));
      if (a <= 0) return;
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.fillStyle = "rgba(255,255,255,0.045)";
      rrect(ctx, X + 196 + r * 300, Y + 34 + (1 - a) * 18, 276, 112, 8);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();
      setFont(ctx, 14, { display: false, weight: 600 });
      ctx.fillStyle = "rgba(255,255,255,0.42)";
      ctx.fillText(k, X + 216 + r * 300, Y + 66);
      setFont(ctx, 44);
      ctx.fillStyle = "#fff";
      ctx.fillText(v, X + 214 + r * 300, Y + 124);
      dot(ctx, X + 446 + r * 300, Y + 60, 5, rgba(c, 0.95));
      ctx.restore();
    });

    // chart with bars growing
    const ch = outCubic(clamp01((lt - 0.44) * 3.4));
    if (ch > 0) {
      ctx.save();
      ctx.globalAlpha *= ch;
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      rrect(ctx, X + 196, Y + 174, 576, 288, 8);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.stroke();
      for (let g = 1; g < 4; g++) seg(ctx, X + 216, Y + 174 + g * 66, X + 752, Y + 174 + g * 66, "rgba(255,255,255,0.05)", 1);
      for (let b = 0; b < 14; b++) {
        const hh = (0.25 + hash(b * 1.7) * 0.75) * 216 * clamp01(ch * 1.5 - b * 0.045);
        const bx = X + 222 + b * 38;
        const g2 = ctx.createLinearGradient(0, Y + 438 - hh, 0, Y + 438);
        g2.addColorStop(0, rgba(RED, 0.95));
        g2.addColorStop(1, rgba(RED, 0.25));
        ctx.fillStyle = g2;
        ctx.fillRect(bx, Y + 438 - hh, 24, hh);
      }
      ctx.restore();
    }

    // table rows streaming in
    const tb = clamp01((lt - 0.56) * 3);
    if (tb > 0) {
      ctx.save();
      ctx.globalAlpha *= tb;
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      rrect(ctx, X + 796, Y + 174, 296, 288, 8);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.stroke();
      for (let r = 0; r < 7; r++) {
        const a = clamp01((lt - 0.58 - r * 0.045) * 9);
        if (a <= 0) break;
        ctx.fillStyle = `rgba(255,255,255,${0.14 * a})`;
        ctx.fillRect(X + 816, Y + 200 + r * 36, 150, 7);
        ctx.fillStyle = rgba(r % 3 === 0 ? RED : GRN, 0.8 * a);
        rrect(ctx, X + 992, Y + 194 + r * 36, 74, 18, 9);
        ctx.fill();
      }
      ctx.restore();
    }

    // workflow nodes connecting across the bottom
    const wf = clamp01((lt - 0.74) * 2.6);
    if (wf > 0) {
      ctx.save();
      ctx.globalAlpha *= wf;
      const ny = Y + 556;
      for (let k = 0; k < 4; k++) {
        const a = clamp01(wf * 2 - k * 0.22);
        const nx = X + 240 + k * 216;
        ctx.strokeStyle = `rgba(255,255,255,${0.3 * a})`;
        ctx.lineWidth = 1.5;
        rrect(ctx, nx - 72, ny - 34, 144, 68, 7);
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.04)";
        ctx.fill();
        dot(ctx, nx - 72, ny, 5, rgba(RED, a));
        dot(ctx, nx + 72, ny, 5, rgba(GRN, a));
        setFont(ctx, 13, { display: false, weight: 600 });
        ctx.fillStyle = `rgba(255,255,255,${0.6 * a})`;
        ctx.textAlign = "center";
        ctx.fillText(["TRIGGER", "VALIDATE", "PROCESS", "NOTIFY"][k], nx, ny + 5);
        ctx.textAlign = "left";
        if (k < 3) {
          const ea = clamp01(wf * 2 - k * 0.22 - 0.2);
          ctx.strokeStyle = rgba(RED, 0.65 * ea);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(nx + 72, ny);
          ctx.bezierCurveTo(nx + 120, ny, nx + 96, ny, nx + 72 + 72 * ea, ny);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }
  ctx.restore();

  // BUILD · SHIP · ITERATE, then the claim
  const words = ["BUILD", "SHIP", "ITERATE"];
  words.forEach((w, k) => {
    const a = band(lt, 0.30 + k * 0.24, 0.62 + k * 0.24, 0.07);
    if (a <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = a;
    setFont(ctx, 96);
    ctx.fillStyle = "#fff";
    tracked(ctx, w, DX, 500, lerp(34, 10, outExpo(inv(lt, 0.30 + k * 0.24, 0.62 + k * 0.24))), "center");
    ctx.restore();
  });

  const claim = band(lt, 1.24, 2.0, 0.16);
  if (claim > 0.01) {
    ctx.save();
    ctx.globalAlpha = claim;
    setFont(ctx, 54);
    ctx.fillStyle = "#fff";
    tracked(ctx, "PRODUCTION, NOT JUST PROTOTYPES.", DX, 880, lerp(14, 6, outExpo(inv(lt, 1.24, 1.66))), "center");
    ctx.restore();
  }
}

/* ============================================================================
   SCENE 5 — 8.5 → 10.5s  FRONTEND CRAFT
   UI parts fly into place on parallax planes; the camera drifts through them.
   ============================================================================ */
function scene5(ctx, t) {
  const lt = t - 8.5;                       // 0 → 2.0
  const drift = inOutCubic(clamp01(lt / 2.0));

  const PLANES = [
    { z: 0.35, x: AX + 360, y: 260 },
    { z: 0.62, x: AX - 300, y: 700 },
    { z: 0.62, x: AX + 440, y: 720 },
    { z: 1.0,  x: AX + 10,  y: 420 },
    { z: 1.5,  x: AX + 480, y: 470 },
  ];

  PLANES.forEach((pl, k) => {
    const a = outCubic(clamp01((lt - k * 0.11) * 3.2)) * (1 - inCubic(inv(lt, 1.74, 2.0)));
    if (a <= 0.01) return;
    const camX = lerp(90, -150, drift) * pl.z;
    const camY = lerp(40, -40, drift) * pl.z;
    const sc = lerp(0.9, 1.12, drift) * (0.7 + pl.z * 0.36);
    const slide = (1 - outBack(clamp01((lt - k * 0.11) * 2.4))) * 160 * (k % 2 ? 1 : -1);

    ctx.save();
    ctx.globalAlpha = a * (0.42 + pl.z * 0.42);
    ctx.translate(pl.x + camX + slide, pl.y + camY);
    ctx.scale(sc, sc);

    ctx.fillStyle = "rgba(18,18,22,0.9)";
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1.4;

    if (k === 0) {
      // nav bar
      rrect(ctx, -270, -32, 540, 64, 10); ctx.fill(); ctx.stroke();
      dot(ctx, -232, 0, 8, rgba(RED, 1));
      for (let i = 0; i < 4; i++) { ctx.fillStyle = "rgba(255,255,255,0.28)"; ctx.fillRect(-190 + i * 92, -4, 62, 7); }
      ctx.fillStyle = rgba(RED, 0.9); rrect(ctx, 182, -18, 78, 36, 18); ctx.fill();
    } else if (k === 1 || k === 2) {
      // content card with a shimmer sweep
      rrect(ctx, -160, -110, 320, 220, 10); ctx.fill(); ctx.stroke();
      const ig = ctx.createLinearGradient(-160, -110, 160, 10);
      ig.addColorStop(0, rgba(RED, 0.5)); ig.addColorStop(1, "rgba(60,60,80,0.5)");
      ctx.fillStyle = ig; rrect(ctx, -144, -94, 288, 112, 7); ctx.fill();
      for (let r = 0; r < 3; r++) { ctx.fillStyle = `rgba(255,255,255,${0.3 - r * 0.09})`; ctx.fillRect(-144, 40 + r * 22, 240 - r * 70, 8); }
      const sh = ((lt * 0.8 + k * 0.3) % 1);
      const sg = ctx.createLinearGradient(-160 + sh * 380 - 90, 0, -160 + sh * 380, 0);
      sg.addColorStop(0, "rgba(255,255,255,0)"); sg.addColorStop(1, "rgba(255,255,255,0.10)");
      ctx.fillStyle = sg; rrect(ctx, -160, -110, 320, 220, 10); ctx.fill();
    } else if (k === 3) {
      // a form generating its own fields
      rrect(ctx, -230, -170, 460, 340, 12); ctx.fill(); ctx.stroke();
      setFont(ctx, 34); ctx.fillStyle = "#fff"; tracked(ctx, "CREATE ORGANISATION", 0, -122, 3, "center");
      for (let r = 0; r < 4; r++) {
        const fa = clamp01((lt - 0.42 - r * 0.1) * 6);
        if (fa <= 0) break;
        ctx.strokeStyle = `rgba(255,255,255,${0.16 * fa})`;
        rrect(ctx, -190, -88 + r * 58, 380 * fa, 40, 6); ctx.stroke();
        ctx.fillStyle = `rgba(255,255,255,${0.3 * fa})`;
        ctx.fillRect(-174, -74 + r * 58, 90, 7);
        if (r === 1) { // a caret typing
          ctx.fillStyle = rgba(RED, fa * (Math.sin(lt * 22) > 0 ? 1 : 0.15));
          ctx.fillRect(-70 + Math.min(150, (lt - 0.52) * 260), -78 + r * 58, 2, 22);
        }
      }
      const ba = clamp01((lt - 0.86) * 5);
      if (ba > 0) { ctx.fillStyle = rgba(RED, 0.95 * ba); rrect(ctx, -190, 106, 172, 46, 6); ctx.fill(); }
    } else {
      // toast stack
      for (let r = 0; r < 3; r++) {
        const ta = clamp01((lt - 0.6 - r * 0.14) * 5);
        if (ta <= 0) break;
        ctx.globalAlpha = a * ta * 0.85;
        ctx.fillStyle = "rgba(20,20,24,0.94)";
        rrect(ctx, -150, -80 + r * 70, 300, 56, 8); ctx.fill();
        ctx.strokeStyle = rgba(GRN, 0.5); ctx.stroke();
        dot(ctx, -122, -52 + r * 70, 7, rgba(GRN, 1));
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.fillRect(-102, -56 + r * 70, 170 - r * 34, 7);
      }
    }
    ctx.restore();
  });

  const cap = band(lt, 0.9, 2.0, 0.2);
  if (cap > 0.01) {
    ctx.save();
    ctx.globalAlpha = cap;
    setFont(ctx, 54);
    ctx.fillStyle = "#fff";
    tracked(ctx, "INTERFACES THAT FEEL INEVITABLE", AX, 950, lerp(16, 6, outExpo(inv(lt, 0.9, 1.4))), "center");
    ctx.restore();
  }
}

/* ============================================================================
   SCENE 6 — 10.5 → 12.0s  THE HUMAN BEAT
   Everything stops. A cricket ball rolls in, becomes a request, and leaves.
   ============================================================================ */
function scene6(ctx, t) {
  const lt = t - 10.5;                      // 0 → 1.5

  // a floor line so the ball has something to roll on
  const floor = band(lt, 0.0, 1.5, 0.2);
  const FY = 620;
  if (floor > 0.01) {
    const fg = ctx.createLinearGradient(AX - 480, 0, 1900, 0);
    fg.addColorStop(0, "rgba(255,255,255,0)");
    fg.addColorStop(0.45, `rgba(255,255,255,${0.14 * floor})`);
    fg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = fg;
    ctx.fillRect(AX - 480, FY, 1900 - (AX - 480), 1.4);
  }

  const roll = outExpo(inv(lt, 0.0, 0.72));
  const bx = lerp(2050, AX + 190, roll);
  const R = 46;
  const morph = inv(lt, 0.92, 1.18);
  const gone = inv(lt, 1.14, 1.34);

  if (morph < 1) {
    ctx.save();
    ctx.globalAlpha = 1 - morph * 0.35;
    // contact shadow
    const sg = ctx.createRadialGradient(bx, FY + 6, 2, bx, FY + 6, R * 1.5);
    sg.addColorStop(0, "rgba(0,0,0,0.6)");
    sg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.ellipse(bx, FY + 8, R * 1.4, R * 0.26, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(bx, FY - R);
    ctx.rotate(-(2050 - bx) / R);
    const bg = ctx.createRadialGradient(-R * 0.35, -R * 0.4, R * 0.1, 0, 0, R);
    bg.addColorStop(0, "#ffffff");
    bg.addColorStop(0.7, "#d9d9de");
    bg.addColorStop(1, "#8d8d96");
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fill();
    // seam
    ctx.strokeStyle = "rgba(90,90,100,0.85)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, R * 0.34, R * 0.98, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([5, 7]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, R * 0.56, R * 0.98, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // a cursor light blinks beside it — the "still working" tell
  const curA = band(lt, 0.62, 1.0, 0.1) * (Math.sin(lt * 20) > -0.3 ? 1 : 0.1);
  if (curA > 0.01) {
    glow(ctx, rgba(RED, 0.9), 18, () => {
      ctx.fillStyle = rgba(RED, curA);
      ctx.fillRect(bx + 88, FY - 66, 4, 52);
    });
  }

  // ball → request packet, fired back into the system
  if (morph > 0 && gone < 1) {
    const px = lerp(bx, 1980, inExpo(morph));
    const py = lerp(FY - R, 300, inExpo(morph));
    const r = lerp(R, 7, outCubic(morph));
    glow(ctx, rgba(RED, 1), 34, () => dot(ctx, px, py, r, rgba(RED, 1 - gone)));
    const tg = ctx.createLinearGradient(bx, FY - R, px, py);
    tg.addColorStop(0, rgba(RED, 0));
    tg.addColorStop(1, rgba(RED, 0.7 * (1 - gone)));
    seg(ctx, bx, FY - R, px, py, tg, 3);
  }

  // CODE. CREATE. PLAY.
  ["CODE.", "CREATE.", "PLAY."].forEach((w, k) => {
    const a = band(lt, 0.30 + k * 0.22, 1.42, 0.09);
    if (a <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = a;
    setFont(ctx, 76);
    ctx.fillStyle = k === 2 ? rgba(RED_T, 1) : "#fff";
    tracked(ctx, w, AX, 810 + k * 84, lerp(26, 8, outExpo(inv(lt, 0.30 + k * 0.22, 0.62 + k * 0.22))), "center");
    ctx.restore();
  });

  // easter egg: two frames of a deploy toast
  const egg = band(lt, 1.22, 1.44, 0.03);
  if (egg > 0.01) {
    ctx.save();
    ctx.globalAlpha = egg;
    ctx.fillStyle = "rgba(20,20,24,0.95)";
    rrect(ctx, 1520, 170, 330, 62, 8);
    ctx.fill();
    ctx.strokeStyle = rgba(GRN, 0.7);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    dot(ctx, 1552, 201, 7, rgba(GRN, 1));
    setFont(ctx, 17, { display: false, weight: 600 });
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillText("PRODUCTION: STILL RUNNING", 1572, 207);
    ctx.restore();
  }
}

/* ============================================================================
   SCENE 7 — 12.0 → 14.0s  PEAK
   The whole system returns at speed, then resolves into a monogram N.
   ============================================================================ */
// three strokes of an N, as point-samplable segments
const N_STROKES = [
  [[-150, -180], [-150, 180]],
  [[-150, -180], [150, 180]],
  [[150, -180], [150, 180]],
];
const nPoint = (i, n) => {
  // spread i samples across the three strokes by length
  const lens = N_STROKES.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1]));
  const total = lens.reduce((s, v) => s + v, 0);
  let d = ((i + 0.5) / n) * total;
  for (let k = 0; k < N_STROKES.length; k++) {
    if (d <= lens[k]) {
      const [a, b] = N_STROKES[k];
      const p = d / lens[k];
      return [lerp(a[0], b[0], p), lerp(a[1], b[1], p)];
    }
    d -= lens[k];
  }
  return [0, 0];
};

function scene7(ctx, t) {
  const lt = t - 12.0;                      // 0 → 2.0
  const back = outExpo(clamp01(lt / 0.72));
  const camZ = lerp(560, -640, back);
  const form = inOutCubic(inv(lt, 0.60, 1.10));   // graph → N
  const hold = band(lt, 1.05, 2.0, 0.1);

  // the system, rushing backwards
  if (form < 1) {
    ctx.save();
    ctx.globalAlpha = 1 - form;
    drawGraph(ctx, t, camZ, 1, { packetT: t * 2.4 });
    ctx.restore();
  }

  // particles converging onto the N
  const COUNT = 96;
  const CXn = AX, CYn = 470;
  for (let i = 0; i < COUNT; i++) {
    const [nx, ny] = nPoint(i, COUNT);
    // where it came from: scattered around the frame
    const ax = AX - 760 + hash(i * 1.37) * 1380;
    const ay = 120 + hash(i * 4.91) * 840;
    const e = clamp01(form * 1.25 - hash(i * 8.3) * 0.25);
    const ee = outCubic(e);
    const x = lerp(ax, CXn + nx, ee);
    const y = lerp(ay, CYn + ny, ee);
    const a = clamp01(form * 2) * (0.45 + 0.55 * ee);
    const r = lerp(1.6, 3.4, ee);
    ctx.fillStyle = i % 7 === 0 ? rgba(GRN, a) : rgba(RED, a * 0.95);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // the N itself, drawn once the particles land
  if (hold > 0.01) {
    ctx.save();
    ctx.globalAlpha = hold;
    ctx.lineWidth = 19;
    ctx.lineCap = "square";
    glow(ctx, rgba(RED, 0.8), 40, () => {
      ctx.strokeStyle = "#fff";
      N_STROKES.forEach(([a, b]) => seg(ctx, CXn + a[0], CYn + a[1], CXn + b[0], CYn + b[1], "#fff", 19));
    });
    ctx.restore();
  }

  // titles
  const tA = band(lt, 1.12, 2.0, 0.14);
  if (tA > 0.01) {
    ctx.save();
    ctx.globalAlpha = tA;
    setFont(ctx, 104);
    ctx.fillStyle = "#fff";
    tracked(ctx, "NISHANT VIDHURI", AX, 790, lerp(24, 11, outExpo(inv(lt, 1.12, 1.52))), "center");
    setFont(ctx, 25, { display: false, weight: 600 });
    ctx.fillStyle = rgba(RED_T, 1);
    tracked(ctx, "FULL-STACK SOFTWARE ENGINEER", AX, 836, 9, "center");
    const sub = band(lt, 1.42, 2.0, 0.16);
    if (sub > 0.01) {
      ctx.globalAlpha = tA * sub;
      setFont(ctx, 21, { display: false, weight: 400 });
      ctx.fillStyle = "rgba(255,255,255,0.68)";
      tracked(ctx, "BUILDING SYSTEMS THAT ACTUALLY SHIP", AX, 882, 6, "center");
    }
    ctx.restore();
  }
}

/* ============================================================================
   SCENE 8 — 14.0 → 15.0s  LOOP CLOSE
   The N collapses into the thin red line, the line collapses into the seed
   pixel at exactly the position and size scene 1 starts from.
   ============================================================================ */
function scene8(ctx, t) {
  const lt = t - 14.0;                      // 0 → 1.0
  const CXn = AX, CYn = 470;
  const SX = SEED_X, SY = SEED_Y;

  const squash = inOutCubic(inv(lt, 0.0, 0.42));   // N → line
  const travel = inOutCubic(inv(lt, 0.34, 0.74));  // line slides to seed position
  const shrink = inCubic(inv(lt, 0.62, 0.96));     // line → pixel

  // titles falling away
  const outA = 1 - outCubic(inv(lt, 0.0, 0.26));
  if (outA > 0.01) {
    ctx.save();
    ctx.globalAlpha = outA;
    setFont(ctx, 104);
    ctx.fillStyle = "#fff";
    tracked(ctx, "NISHANT VIDHURI", AX, 790 + (1 - outA) * 26, 11, "center");
    setFont(ctx, 25, { display: false, weight: 600 });
    ctx.fillStyle = rgba(RED_T, 1);
    tracked(ctx, "FULL-STACK SOFTWARE ENGINEER", AX, 836 + (1 - outA) * 26, 9, "center");
    setFont(ctx, 21, { display: false, weight: 400 });
    ctx.fillStyle = "rgba(255,255,255,0.68)";
    tracked(ctx, "BUILDING SYSTEMS THAT ACTUALLY SHIP", AX, 882 + (1 - outA) * 26, 6, "center");
    ctx.restore();
  }

  // N squashing into a horizontal bar
  if (squash < 0.99) {
    // stroke width does not squash with the y-scale, so thin it by hand or the
    // verticals leave two grey nubs behind
    const lw = 19 * (1 - squash * 0.85);
    ctx.save();
    ctx.globalAlpha = (1 - squash) * (1 - squash);
    ctx.translate(CXn, CYn);
    ctx.scale(1, 1 - squash * 0.97);
    glow(ctx, rgba(RED, 0.8), 40 * (1 - squash), () => {
      N_STROKES.forEach(([a, b]) => seg(ctx, a[0], a[1], b[0], b[1], "#fff", lw));
    });
    ctx.restore();
  }

  // the line: collapses, drifts to the seed anchor, then shrinks to a pixel
  const lx = lerp(CXn, SX, travel);
  const ly = lerp(CYn, SY, travel);
  const halfW = lerp(165, 1.5, shrink) + (1 - squash) * 0 ;
  const a = 1 - inCubic(inv(lt, 0.9, 1.0)) * 0.0;   // stays lit — matches frame 0
  const g = ctx.createLinearGradient(lx - halfW, 0, lx + halfW, 0);
  g.addColorStop(0, rgba(RED, 0));
  g.addColorStop(0.5, rgba(RED, 0.95 * a));
  g.addColorStop(1, rgba(RED, 0));
  glow(ctx, rgba(RED, 0.85), lerp(34, 12, shrink), () => {
    ctx.fillStyle = g;
    ctx.fillRect(lx - halfW, ly - 1.4, halfW * 2, 2.8);
    if (shrink > 0.8) dot(ctx, lx, ly, lerp(4, 1.6, inv(lt, 0.9, 1.0)), rgba(RED, a));
  });
}

/* ============================================================================
   Composite: scene router, vignette, left-side protection, grain.
   ============================================================================ */
const SCENES = [
  [0.0, 1.5, scene1],
  [1.5, 4.0, scene2],
  [4.0, 6.5, scene3],
  [6.5, 8.5, scene4],
  [8.5, 10.5, scene5],
  [10.5, 12.0, scene6],
  [12.0, 14.0, scene7],
  [14.0, 15.0, scene8],
];

// hard cuts at these marks get a one-frame white flash + fringe
const CUTS = [1.5, 4.0, 6.5, 8.5, 12.0];

export function renderFrame(ctx, t, noiseTile, frame) {
  // base — never pure flat black, there is always a faint centre-right lift
  ctx.fillStyle = "#050506";
  ctx.fillRect(0, 0, VW, VH);
  const amb = ctx.createRadialGradient(AX, 480, 60, AX, 480, 1250);
  amb.addColorStop(0, "rgba(40,22,26,0.55)");
  amb.addColorStop(0.3, "rgba(29,17,20,0.46)");
  amb.addColorStop(0.55, "rgba(18,12,14,0.32)");
  amb.addColorStop(0.8, "rgba(8,5,6,0.14)");
  amb.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = amb;
  ctx.fillRect(0, 0, VW, VH);

  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.lineJoin = "round";

  for (const [a, b, fn] of SCENES) {
    if (t >= a && t < b) { fn(ctx, t); break; }
  }

  // cut flash
  for (const c of CUTS) {
    const d = t - c;
    if (d >= 0 && d < 0.07) {
      ctx.fillStyle = `rgba(255,255,255,${(1 - d / 0.07) * 0.16})`;
      ctx.fillRect(0, 0, VW, VH);
    }
  }

  // keep the hero's left column dark and legible
  const prot = ctx.createLinearGradient(0, 0, VW * 0.52, 0);
  prot.addColorStop(0, "rgba(5,5,6,0.82)");
  prot.addColorStop(0.55, "rgba(5,5,6,0.3)");
  prot.addColorStop(1, "rgba(5,5,6,0)");
  ctx.fillStyle = prot;
  ctx.fillRect(0, 0, VW * 0.52, VH);

  // bottom fade, so it dissolves into the page below
  const bot = ctx.createLinearGradient(0, VH * 0.62, 0, VH);
  bot.addColorStop(0, "rgba(5,5,6,0)");
  bot.addColorStop(1, "rgba(5,5,6,0.8)");
  ctx.fillStyle = bot;
  ctx.fillRect(0, VH * 0.62, VW, VH * 0.38);

  // vignette
  const vig = ctx.createRadialGradient(AX - 100, VH * 0.48, VH * 0.3, AX - 100, VH * 0.48, VH * 0.95);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, VW, VH);

  // 35mm grain
  if (noiseTile) {
    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = 0.085;
    const ox = -(frame * 37) % noiseTile.width;
    const oy = -(frame * 53) % noiseTile.height;
    for (let x = ox; x < VW; x += noiseTile.width)
      for (let y = oy; y < VH; y += noiseTile.height)
        ctx.drawImage(noiseTile, x, y);
    ctx.restore();
  }
}

export const makeNoise = (size = 180) => {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  const img = g.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 110 + Math.random() * 90;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
};


/* ============================================================================
   Export — records exactly one loop to a video file, in the browser.

   Each captured frame is rendered at t = n / fps and pushed to the encoder
   with requestFrame(), so frame content is exact even if the page stutters.
   MediaRecorder encodes in real time, so the tab must stay in front for the
   15 seconds. H.264 MP4 is preferred (plays in QuickTime, Safari, <video>
   everywhere); WebM is the fallback where MP4 recording isn't available.
   ============================================================================ */
const FORMATS = [
  ["video/mp4;codecs=avc1.640028", "mp4"],
  ["video/mp4;codecs=avc1.4d0028", "mp4"],
  ["video/mp4;codecs=avc1", "mp4"],
  ["video/mp4", "mp4"],
  ["video/webm;codecs=vp9", "webm"],
  ["video/webm;codecs=vp8", "webm"],
  ["video/webm", "webm"],
];

export const pickVideoFormat = () => {
  if (typeof MediaRecorder === "undefined") return null;
  if (typeof HTMLCanvasElement === "undefined" || !("captureStream" in HTMLCanvasElement.prototype)) return null;
  for (const [mime, ext] of FORMATS) {
    if (MediaRecorder.isTypeSupported(mime)) return { mime, ext };
  }
  return null;
};

export function recordShowreel({ fps = 24, bitrate = 12_000_000, onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const format = pickVideoFormat();
    if (!format) {
      reject(new Error("This browser can't record canvas video. Try Chrome or Safari."));
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = VW;
    canvas.height = VH;
    const ctx = canvas.getContext("2d", { alpha: false });
    const noise = makeNoise();
    const total = Math.round(DUR * fps);

    // Manual pushes keep each frame exact; fall back to a fixed-rate stream
    // where requestFrame() isn't implemented.
    let stream = canvas.captureStream(0);
    let track = stream.getVideoTracks()[0];
    const manual = typeof track?.requestFrame === "function";
    if (!manual) {
      track?.stop();
      stream = canvas.captureStream(fps);
      track = stream.getVideoTracks()[0];
    }

    const chunks = [];
    const rec = new MediaRecorder(stream, { mimeType: format.mime, videoBitsPerSecond: bitrate });
    rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };

    let raf = 0;
    let stopTimer = 0;
    let last = 0;
    let t0 = 0;
    let wasHidden = document.hidden;
    const onVis = () => { if (document.hidden) wasHidden = true; };
    document.addEventListener("visibilitychange", onVis);

    const draw = (n) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      renderFrame(ctx, Math.min(n / fps, DUR - 1e-4), noise, n);
      if (manual) track.requestFrame();
    };
    const stop = () => { if (rec.state !== "inactive") rec.stop(); };
    const tick = (now) => {
      const n = Math.floor(((now - t0) / 1000) * fps);
      if (n > last && n < total) {
        last = n;
        draw(n);
        onProgress?.(n / total);
      }
      // stop a tick after the final push, never in the same one: requestFrame()
      // hands the frame over asynchronously, so stopping immediately drops it
      if (n >= total) { stop(); return; }
      raf = requestAnimationFrame(tick);
    };

    const cleanup = () => {
      cancelAnimationFrame(raf);
      clearTimeout(stopTimer);
      document.removeEventListener("visibilitychange", onVis);
      track?.stop();
    };
    rec.onstop = () => {
      cleanup();
      onProgress?.(1);
      resolve({ blob: new Blob(chunks, { type: format.mime.split(";")[0] }), ...format, wasHidden });
    };
    rec.onerror = (e) => { cleanup(); reject(e.error || new Error("Recording failed.")); };

    rec.start(250);
    t0 = performance.now();
    draw(0);
    raf = requestAnimationFrame(tick);
    // Fallback for a throttled tab where rAF stalls: close the loop on the
    // last frame and stop on a later task so that frame still lands.
    stopTimer = setTimeout(() => {
      if (rec.state === "inactive") return;
      if (last < total - 1) { last = total - 1; draw(total - 1); }
      stopTimer = setTimeout(stop, 100);
    }, DUR * 1000 + 250);
  });
}
