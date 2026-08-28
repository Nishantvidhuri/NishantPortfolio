import React, { useEffect, useRef, useState } from "react";
import { FaPlay, FaRedo, FaTrophy } from "react-icons/fa";
import { sfx, haptic, shake } from './gameFeel';

const W = 400;
const H = 620;
const HORIZON = 150;   // far (bowler's) end of the pitch
const CONTACT_Z = 0.94; // where the ball meets the bat
const BAT_Y = 500;     // batsman's contact height on screen
const CX = 200;
const WICKETS = 3;

function GullyCricket() {
  const canvasRef = useRef(null);
  const stRef = useRef({ running: false });
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [runs, setRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [highScore, setHighScore] = useState(
    () => Number(localStorage.getItem("cricketHigh")) || 0
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // Input surface = fullscreen wrapper so the letterboxed bars are tappable
    const surface = canvas.parentElement || canvas;

    const st = {
      running: false,
      phase: "ready",     // ready | bowling | shot | wicket
      timer: 0,
      ball: null,         // { z, speed, lane, swing }
      runupT: 0,
      swing: -1,          // 0..1 while the bat swings, -1 idle
      shot: null,         // flying ball after a hit
      popup: null,        // { text, life, color }
      particles: [],
      runs: 0,
      wickets: 0,
      balls: 0,
      raf: 0,
      last: performance.now(),
      t: 0,
    };
    stRef.current = st;

    /* ---------- helpers ---------- */

    // perspective: z 0 (far) -> 1 (batsman)
    const zToY = (z) => HORIZON + (BAT_Y - HORIZON) * Math.pow(z, 1.7);
    const zToScale = (z) => 0.12 + 0.88 * Math.pow(z, 2.1);
    const zToX = (z, lane) => CX + lane * 70 * Math.pow(z, 1.5);

    const burst = (n, x, y, color, spread = 150) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 40 + Math.random() * spread;
        st.particles.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 40,
          life: 0.6 + Math.random() * 0.4,
          size: 2 + Math.random() * 3,
          color,
        });
      }
    };

    const say = (text, color) => {
      st.popup = { text, color, life: 1.1 };
    };

    const nextBall = () => {
      st.phase = "ready";
      st.timer = 0.9;
      st.swing = -1;
      st.shot = null;
      st.ball = null;
      st.runupT = 0;
    };

    const bowl = () => {
      st.phase = "bowling";
      // pace ramps with the score, capped so it stays playable
      const pace = 0.72 + Math.min(0.75, st.runs * 0.012);
      st.ball = {
        z: 0,
        speed: pace,
        lane: (Math.random() * 2 - 1) * 0.75, // line: left/right of the stumps
        swing: (Math.random() * 2 - 1) * 0.35, // late movement
      };
    };

    const outNow = (reason) => {
      sfx.fail(); haptic([50, 30, 70]); shake(surface, 11);
      st.phase = "wicket";
      st.timer = 1.3;
      st.wickets += 1;
      setWickets(st.wickets);
      say(reason, "#e50914");
      burst(22, CX, BAT_Y - 20, "rgba(229,9,20,0.95)", 200);

      if (st.wickets >= WICKETS) {
        st.running = false;
        setGameOver(true);
        setGameStarted(false);
        setHighScore((h) => {
          const next = Math.max(h, st.runs);
          localStorage.setItem("cricketHigh", String(next));
          return next;
        });
      }
    };

    const scoreRuns = (n, label, color) => {
      sfx.bat();
      if (n === 6) { sfx.cheer(); haptic([15, 25, 15, 25, 30]); shake(surface, 8); }
      else if (n === 4) { sfx.score(); haptic([12, 20, 20]); shake(surface, 5); }
      else haptic(10);
      st.runs += n;
      setRuns(st.runs);
      say(label, color);
      st.phase = "shot";
      st.timer = 1.25;
      // ball flies away on an arc
      const dir = (Math.random() * 2 - 1);
      st.shot = {
        x: CX + st.ball.lane * 40,
        y: BAT_Y - 24,
        vx: dir * (90 + n * 22),
        vy: -(160 + n * 42),
        r: 9,
      };
      burst(n >= 4 ? 20 : 8, CX, BAT_Y - 24,
        n === 6 ? "rgba(255,199,44,0.95)" : n === 4 ? "rgba(70,211,105,0.95)" : "rgba(255,255,255,0.8)");
    };

    const swingBat = () => {
      if (!st.running) return;
      if (st.phase !== "bowling" || !st.ball || st.swing >= 0) return;
      st.swing = 0;

      const d = Math.abs(st.ball.z - CONTACT_Z);
      if (d < 0.035) scoreRuns(6, "SIX!", "#ffc72c");
      else if (d < 0.07) scoreRuns(4, "FOUR!", "#46d369");
      else if (d < 0.11) scoreRuns(2, "TWO", "#ffffff");
      else if (d < 0.16) scoreRuns(1, "SINGLE", "#ffffff");
      else if (d < 0.24) outNow("CAUGHT!");   // thick edge
      // else: swung far too early — the ball carries on to the stumps
    };
    stRef.current.swingBat = swingBat;

    const onKey = (e) => {
      if (e.code === "Space" || e.key === "ArrowUp") {
        e.preventDefault();
        swingBat();
      }
    };
    const onPointer = () => swingBat();
    window.addEventListener("keydown", onKey);
    surface.addEventListener("pointerdown", onPointer);

    /* ---------- drawing ---------- */

    const drawStumps = (x, y, scale, alpha = 1) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      const h = 46 * scale;
      const w = 3.4 * scale;
      const gap = 7 * scale;
      ctx.fillStyle = "#f4f1e8";
      for (let i = -1; i <= 1; i++) {
        ctx.fillRect(x + i * gap - w / 2, y - h, w, h);
      }
      // bails
      ctx.fillRect(x - gap - w / 2, y - h - 2.5 * scale, gap * 2 + w, 2.2 * scale);
      ctx.restore();
    };

    const drawBatsman = () => {
      const x = CX - 46;
      const y = BAT_Y + 26;
      // shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(x + 6, y + 6, 26, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      // legs (pads)
      ctx.fillStyle = "#f2f2ef";
      ctx.fillRect(x - 10, y - 46, 11, 46);
      ctx.fillRect(x + 5, y - 46, 11, 46);
      // body — Netflix-red jersey
      ctx.fillStyle = "#e50914";
      ctx.beginPath();
      ctx.roundRect(x - 13, y - 88, 30, 46, 7);
      ctx.fill();
      // arms
      ctx.fillStyle = "#e50914";
      ctx.fillRect(x + 12, y - 84, 9, 26);
      // head + helmet
      ctx.fillStyle = "#e8b48c";
      ctx.beginPath();
      ctx.arc(x + 2, y - 99, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1e2a4a";
      ctx.beginPath();
      ctx.arc(x + 2, y - 102, 12, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x + 9, y - 104, 7, 3);

      // bat — swings on tap
      const swingAng = st.swing >= 0
        ? -1.15 + st.swing * 2.5          // whip through
        : -0.55 + Math.sin(st.t * 2) * 0.06; // idle waggle
      ctx.save();
      ctx.translate(x + 22, y - 62);
      ctx.rotate(swingAng);
      ctx.fillStyle = "#c98b46";      // handle
      ctx.fillRect(-3, -6, 6, 22);
      ctx.fillStyle = "#e8c68b";      // blade
      ctx.beginPath();
      ctx.roundRect(-7, 14, 14, 44, 3);
      ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fillRect(-7, 14, 4, 44);
      ctx.restore();
    };

    const drawBowler = () => {
      // runs in during the pause before delivery
      const p = Math.min(1, st.runupT);
      const y = HORIZON - 46 + p * 34;
      const x = CX - 14 + Math.sin(p * 9) * 3;
      const s = 0.5 + p * 0.28;
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "#1e3a8a";
      ctx.fillRect(x - 5 * s, y, 10 * s, 20 * s);        // body
      ctx.fillStyle = "#f2f2ef";
      ctx.fillRect(x - 5 * s, y + 20 * s, 4 * s, 14 * s); // legs
      ctx.fillRect(x + 1 * s, y + 20 * s, 4 * s, 14 * s);
      ctx.fillStyle = "#e8b48c";
      ctx.beginPath();
      ctx.arc(x, y - 6 * s, 5 * s, 0, Math.PI * 2);       // head
      ctx.fill();
      // bowling arm windmills at release
      ctx.strokeStyle = "#1e3a8a";
      ctx.lineWidth = 3 * s;
      ctx.beginPath();
      ctx.moveTo(x, y + 4 * s);
      const arm = p * Math.PI * 1.6;
      ctx.lineTo(x + Math.cos(arm - 1.5) * 14 * s, y + 4 * s + Math.sin(arm - 1.5) * 14 * s);
      ctx.stroke();
      ctx.restore();
    };

    const draw = () => {
      /* sky + floodlit night */
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#0b1026");
      sky.addColorStop(0.35, "#152046");
      sky.addColorStop(1, "#0d2a18");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      /* stadium stands */
      ctx.fillStyle = "#0f1836";
      ctx.beginPath();
      ctx.roundRect(-20, 40, W + 40, 84, 40);
      ctx.fill();
      // crowd speckle
      for (let i = 0; i < 150; i++) {
        const cx = (i * 53) % (W + 20) - 10;
        const cy = 52 + ((i * 37) % 62);
        ctx.fillStyle = `hsla(${(i * 47) % 360}, 55%, 62%, 0.5)`;
        ctx.fillRect(cx, cy, 2.5, 2.5);
      }
      // floodlights
      [60, W - 60].forEach((fx) => {
        ctx.fillStyle = "#243056";
        ctx.fillRect(fx - 2, 6, 4, 40);
        ctx.fillStyle = "#fdf6c8";
        ctx.beginPath();
        ctx.roundRect(fx - 16, 0, 32, 12, 3);
        ctx.fill();
        const glow = ctx.createRadialGradient(fx, 8, 4, fx, 8, 90);
        glow.addColorStop(0, "rgba(253,246,200,0.22)");
        glow.addColorStop(1, "rgba(253,246,200,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(fx - 90, 0, 180, 150);
      });

      /* outfield */
      const grass = ctx.createLinearGradient(0, HORIZON - 24, 0, H);
      grass.addColorStop(0, "#14612f");
      grass.addColorStop(1, "#0c3f1f");
      ctx.fillStyle = grass;
      ctx.fillRect(0, HORIZON - 24, W, H - HORIZON + 24);
      // mown stripes fanning out
      ctx.fillStyle = "rgba(255,255,255,0.035)";
      for (let i = -3; i <= 3; i += 2) {
        ctx.beginPath();
        ctx.moveTo(CX + i * 12, HORIZON - 24);
        ctx.lineTo(CX + i * 12 + 10, HORIZON - 24);
        ctx.lineTo(CX + i * 150 + 90, H);
        ctx.lineTo(CX + i * 150 - 60, H);
        ctx.closePath();
        ctx.fill();
      }
      // boundary rope
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, HORIZON - 22);
      ctx.lineTo(W, HORIZON - 22);
      ctx.stroke();

      /* pitch (perspective trapezoid) */
      ctx.fillStyle = "#c2a173";
      ctx.beginPath();
      ctx.moveTo(CX - 26, HORIZON);
      ctx.lineTo(CX + 26, HORIZON);
      ctx.lineTo(CX + 132, H);
      ctx.lineTo(CX - 132, H);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(CX - 4, HORIZON, 8, H - HORIZON);
      // creases
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = 2;
      [[HORIZON + 16, 34], [BAT_Y + 32, 116]].forEach(([cy, cw]) => {
        ctx.beginPath();
        ctx.moveTo(CX - cw, cy);
        ctx.lineTo(CX + cw, cy);
        ctx.stroke();
      });

      drawStumps(CX, HORIZON + 12, 0.45, 0.85);   // bowler's end
      if (st.phase === "ready") drawBowler();

      /* the delivery */
      if (st.ball && (st.phase === "bowling")) {
        const b = st.ball;
        const lane = b.lane + b.swing * Math.pow(b.z, 2);
        const bx = zToX(b.z, lane);
        const by = zToY(b.z);
        const r = 3 + 8 * zToScale(b.z);
        // trail
        for (let i = 1; i <= 4; i++) {
          const tz = Math.max(0, b.z - i * 0.05);
          ctx.globalAlpha = 0.13 * (5 - i);
          ctx.beginPath();
          ctx.arc(zToX(tz, lane), zToY(tz), Math.max(1, 3 + 8 * zToScale(tz) - i), 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        // ball
        const bg = ctx.createRadialGradient(bx - r * 0.3, by - r * 0.3, r * 0.2, bx, by, r);
        bg.addColorStop(0, "#fff5f5");
        bg.addColorStop(1, "#c81e2a");
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(bx, by, r, 0, Math.PI * 2);
        ctx.fill();
        // seam
        ctx.strokeStyle = "rgba(255,255,255,0.85)";
        ctx.lineWidth = Math.max(1, r * 0.18);
        ctx.beginPath();
        ctx.ellipse(bx, by, r * 0.85, r * 0.35, st.t * 6, 0, Math.PI * 2);
        ctx.stroke();

        // timing ring — pulses as the ball enters the hitting zone
        if (b.z > 0.72 && b.z < 1.05) {
          const near = 1 - Math.abs(b.z - CONTACT_Z) / 0.22;
          ctx.strokeStyle = `rgba(255,199,44,${Math.max(0, near) * 0.85})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(CX, BAT_Y - 18, 26 + (1 - Math.max(0, near)) * 34, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      /* struck ball flying away */
      if (st.shot) {
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(st.shot.x, st.shot.y, st.shot.r, 0, Math.PI * 2);
        ctx.fill();
      }

      drawStumps(CX, BAT_Y + 34, 1, 1);           // batsman's stumps
      drawBatsman();

      /* particles */
      st.particles.forEach((p) => {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      /* popup */
      if (st.popup) {
        const a = Math.min(1, st.popup.life);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.textAlign = "center";
        ctx.font = "bold 54px 'Bebas Neue', sans-serif";
        ctx.fillStyle = st.popup.color;
        ctx.shadowColor = "rgba(0,0,0,0.85)";
        ctx.shadowBlur = 14;
        ctx.fillText(st.popup.text, CX, 300 - (1.1 - st.popup.life) * 40);
        ctx.restore();
      }

      /* wickets remaining */
      ctx.textAlign = "left";
      ctx.font = "bold 15px sans-serif";
      for (let i = 0; i < WICKETS; i++) {
        ctx.fillStyle = i < WICKETS - st.wickets ? "#46d369" : "rgba(255,255,255,0.22)";
        ctx.beginPath();
        ctx.arc(20 + i * 18, H - 22, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    /* ---------- loop ---------- */

    const loop = (now) => {
      st.raf = requestAnimationFrame(loop);
      const dt = Math.min((now - st.last) / 1000, 0.04);
      st.last = now;
      st.t += dt;

      // bat swing animation
      if (st.swing >= 0) {
        st.swing += dt * 3.4;
        if (st.swing > 1) st.swing = -1;
      }
      if (st.popup) {
        st.popup.life -= dt;
        if (st.popup.life <= 0) st.popup = null;
      }
      for (let i = st.particles.length - 1; i >= 0; i--) {
        const p = st.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 260 * dt;
        p.life -= dt * 1.5;
        if (p.life <= 0) st.particles.splice(i, 1);
      }
      if (st.shot) {
        st.shot.x += st.shot.vx * dt;
        st.shot.y += st.shot.vy * dt;
        st.shot.vy += 150 * dt;
        st.shot.r = Math.max(1.5, st.shot.r - dt * 5);
      }

      if (st.running) {
        if (st.phase === "ready") {
          st.timer -= dt;
          st.runupT += dt * 1.15;
          if (st.timer <= 0) bowl();
        } else if (st.phase === "bowling") {
          st.ball.z += st.ball.speed * dt;
          // past the bat: bowled, or a let-through
          if (st.ball.z >= 1.16) {
            const lineAtStumps = Math.abs(st.ball.lane + st.ball.swing);
            if (lineAtStumps < 0.42) outNow("BOWLED!");
            else {
              say("DOT BALL", "#cbd5e1");
              st.phase = "shot";
              st.timer = 0.7;
              st.balls += 1;
            }
          }
        } else if (st.phase === "shot" || st.phase === "wicket") {
          st.timer -= dt;
          if (st.timer <= 0 && st.running) nextBall();
        }
      }

      draw();
    };
    st.raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(st.raf);
      window.removeEventListener("keydown", onKey);
      surface.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  const startGame = () => {
    const st = stRef.current;
    st.runs = 0;
    st.wickets = 0;
    st.balls = 0;
    st.particles.length = 0;
    st.popup = null;
    st.shot = null;
    st.ball = null;
    st.swing = -1;
    st.phase = "ready";
    st.timer = 1.1;
    st.runupT = 0;
    st.running = true;
    setRuns(0);
    setWickets(0);
    setGameOver(false);
    setGameStarted(true);
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-16 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
        <div className="bg-[#e50914] text-white px-3 py-1 rounded-md flex items-center gap-2">
          <FaTrophy /> <span className="font-bold">{runs}</span>
          <span className="opacity-80 text-sm">/ {wickets}</span>
        </div>
        <span className="text-gray-400 text-sm">Best: {highScore}</span>
      </div>

      <div className="w-full h-full flex items-center justify-center touch-none">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="max-w-full max-h-full w-full h-auto md:w-auto md:h-full touch-none"
        />

        {(!gameStarted || gameOver) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 text-center px-4">
            {gameOver ? (
              <>
                <h3 className="text-3xl font-bold text-[#e50914] mb-1">All out!</h3>
                <p className="text-xl text-white mb-1">You scored {runs}</p>
                <p className="text-gray-400 mb-5">Best: {highScore}</p>
              </>
            ) : (
              <>
                <h3 className="text-3xl font-bold text-[#e50914] mb-2">Gully Cricket</h3>
                <p className="text-gray-300 mb-6 max-w-xs">
                  Tap (or press Space) as the ball reaches the bat. Perfect timing = SIX.
                  You have {WICKETS} wickets!
                </p>
              </>
            )}
            <button
              onClick={startGame}
              className="flex items-center bg-[#e50914] text-white px-6 py-3 rounded-md hover:bg-[#f6121d] font-bold"
            >
              {gameOver ? <FaRedo className="mr-2" /> : <FaPlay className="mr-2" />}
              {gameOver ? "Play Again" : "Start"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GullyCricket;
