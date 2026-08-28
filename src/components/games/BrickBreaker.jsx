import React, { useEffect, useRef, useState } from "react";
import { FaPlay, FaRedo, FaTrophy, FaHeart } from "react-icons/fa";
import { sfx, haptic, shake } from './gameFeel';

const W = 440;
const H = 520;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_COLORS = ["#e50914", "#f97316", "#facc15", "#22c55e", "#3b82f6"];

function BrickBreaker() {
  const canvasRef = useRef(null);
  const stRef = useRef({ running: false });
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(
    () => Number(localStorage.getItem("brickHigh")) || 0
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // Input surface = the fullscreen wrapper, so the letterboxed
    // black bars on narrow screens are tappable too.
    const surface = canvas.parentElement || canvas;

    const st = {
      running: false,
      px: W / 2,
      bx: W / 2, by: H - 80, bvx: 190, bvy: -260,
      bricks: [],
      trail: [],
      particles: [],
      drops: [],      // falling power-ups
      slowT: 0,       // slow-motion timer
      score: 0, lives: 3, level: 1,
      raf: 0, last: performance.now(),
      t: 0,
    };
    stRef.current = st;

    const PW = 84, PH = 12, BR = 7;
    const BW = (W - 40) / BRICK_COLS, BH = 20;

    const shade = (hex, f) => {
      const n = parseInt(hex.slice(1), 16);
      const r = Math.min(255, Math.max(0, ((n >> 16) & 255) * f));
      const g = Math.min(255, Math.max(0, ((n >> 8) & 255) * f));
      const b = Math.min(255, Math.max(0, (n & 255) * f));
      return `rgb(${r | 0},${g | 0},${b | 0})`;
    };

    const buildBricks = () => {
      st.bricks = [];
      for (let r = 0; r < BRICK_ROWS; r++)
        for (let c = 0; c < BRICK_COLS; c++)
          st.bricks.push({ x: 20 + c * BW, y: 50 + r * (BH + 6), color: BRICK_COLORS[r], alive: true });
    };

    const boom = (n, x, y, color) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 40 + Math.random() * 120;
        st.particles.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 0.5 + Math.random() * 0.35,
          size: 1.6 + Math.random() * 2.4,
          color,
        });
      }
    };

    const onMove = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      st.px = Math.max(PW / 2, Math.min(W - PW / 2, (clientX - rect.left) * (W / rect.width)));
    };
    const onMouse = (e) => onMove(e.clientX);
    const onTouch = (e) => {
      e.preventDefault();
      onMove(e.touches[0].clientX);
    };
    surface.addEventListener("mousemove", onMouse);
    surface.addEventListener("touchmove", onTouch, { passive: false });

    const loseLife = () => {
      sfx.fail(); haptic([30, 25, 50]); shake(surface, 8);
      st.lives -= 1;
      setLives(st.lives);
      if (st.lives <= 0) {
        st.running = false;
        setGameOver(true);
        setWon(false);
        setGameStarted(false);
        setHighScore((h) => {
          const next = Math.max(h, st.score);
          localStorage.setItem("brickHigh", String(next));
          return next;
        });
      } else {
        st.bx = st.px;
        st.by = H - 80;
        st.bvx = 190 * (Math.random() < 0.5 ? 1 : -1);
        st.bvy = -260;
        st.trail.length = 0;
      }
    };

    const draw = () => {
      // Background
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#0c0a1c");
      grad.addColorStop(1, "#191030");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      // starfield + drifting nebula
      const neb = ctx.createRadialGradient(W * 0.7, 120, 20, W * 0.7, 120, 220);
      neb.addColorStop(0, "rgba(129,80,255,0.16)");
      neb.addColorStop(1, "rgba(129,80,255,0)");
      ctx.fillStyle = neb;
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 46; i++) {
        const tw = 0.35 + 0.45 * Math.abs(Math.sin(st.t * 1.6 + i));
        ctx.fillStyle = `rgba(255,255,255,${tw * 0.5})`;
        ctx.fillRect((i * 71) % W, (i * 113) % H, 2, 2);
      }
      // faint play-area grid
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
      // neon side rails
      ctx.fillStyle = "rgba(229,9,20,0.5)";
      ctx.fillRect(0, 0, 3, H);
      ctx.fillRect(W - 3, 0, 3, H);
      ctx.fillRect(0, 0, W, 3);

      // Bricks — bevelled
      st.bricks.forEach((b) => {
        if (!b.alive) return;
        const bg = ctx.createLinearGradient(b.x, b.y, b.x, b.y + BH);
        bg.addColorStop(0, shade(b.color, 1.25));
        bg.addColorStop(1, shade(b.color, 0.75));
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.roundRect(b.x + 1, b.y + 1, BW - 2, BH - 2, 4);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillRect(b.x + 4, b.y + 3, BW - 8, 3);
        // inner bevel + glow rim
        ctx.strokeStyle = "rgba(0,0,0,0.35)";
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x + 1.5, b.y + 1.5, BW - 3, BH - 3);
        ctx.fillStyle = "rgba(255,255,255,0.10)";
        ctx.fillRect(b.x + 3, b.y + BH - 6, BW - 6, 2);
      });

      // Ball trail
      st.trail.forEach((tp, i) => {
        const a = (i / st.trail.length) * 0.35;
        ctx.globalAlpha = a;
        ctx.fillStyle = "#ff5b63";
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, BR * (0.5 + (i / st.trail.length) * 0.5), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Particles
      st.particles.forEach((pt) => {
        ctx.globalAlpha = Math.max(0, pt.life * 1.6);
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
      });
      ctx.globalAlpha = 1;

      // falling power-ups
      st.drops.forEach((d) => {
        const isLife = d.kind === "life";
        ctx.save();
        ctx.shadowColor = isLife ? "rgba(229,9,20,0.9)" : "rgba(56,189,248,0.9)";
        ctx.shadowBlur = 12;
        ctx.fillStyle = isLife ? "#e50914" : "#38bdf8";
        ctx.beginPath();
        ctx.roundRect(d.x - 13, d.y - 8, 26, 16, 8);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(isLife ? "+1" : "SLO", d.x, d.y + 4);
        ctx.textAlign = "left";
      });

      // slow-motion tint
      if (st.slowT > 0) {
        ctx.fillStyle = "rgba(56,189,248,0.07)";
        ctx.fillRect(0, 0, W, H);
      }

      // Paddle — glowing with red core
      ctx.save();
      ctx.shadowColor = "rgba(229,9,20,0.7)";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#f3f4f6";
      ctx.beginPath();
      ctx.roundRect(st.px - PW / 2, H - 30, PW, PH, 6);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = "#e50914";
      ctx.beginPath();
      ctx.roundRect(st.px - 14, H - 30 + 3, 28, PH - 6, 3);
      ctx.fill();

      // Ball
      ctx.save();
      ctx.shadowColor = "rgba(229,9,20,0.9)";
      ctx.shadowBlur = 10;
      const ballG = ctx.createRadialGradient(st.bx - 2, st.by - 2, 1, st.bx, st.by, BR);
      ballG.addColorStop(0, "#ff8a8f");
      ballG.addColorStop(1, "#e50914");
      ctx.fillStyle = ballG;
      ctx.beginPath();
      ctx.arc(st.bx, st.by, BR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const loop = (now) => {
      st.raf = requestAnimationFrame(loop);
      const dt = Math.min((now - st.last) / 1000, 0.04);
      st.last = now;
      st.t += dt;

      for (let i = st.particles.length - 1; i >= 0; i--) {
        const pt = st.particles[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.vy += 220 * dt;
        pt.life -= dt * 1.6;
        if (pt.life <= 0) st.particles.splice(i, 1);
      }

      if (st.running) {
        if (st.slowT > 0) st.slowT -= dt;
        for (let i = st.drops.length - 1; i >= 0; i--) {
          const d = st.drops[i];
          d.y += 130 * dt;
          const caught = d.y > H - 34 && d.y < H - 10 && Math.abs(d.x - st.px) < PW / 2 + 12;
          if (caught) {
            if (d.kind === "life") { st.lives = Math.min(5, st.lives + 1); setLives(st.lives); sfx.cheer(); }
            else { st.slowT = 6; sfx.coin(); }
            haptic(15);
            st.drops.splice(i, 1);
          } else if (d.y > H + 20) st.drops.splice(i, 1);
        }
        st.trail.push({ x: st.bx, y: st.by });
        if (st.trail.length > 7) st.trail.shift();

        const sm = st.slowT > 0 ? 0.62 : 1;
        st.bx += st.bvx * dt * sm;
        st.by += st.bvy * dt * sm;

        if (st.bx < BR || st.bx > W - BR) st.bvx *= -1;
        if (st.by < BR) st.bvy = Math.abs(st.bvy);

        if (
          st.bvy > 0 &&
          st.by > H - 30 - BR &&
          st.by < H - 30 + PH &&
          Math.abs(st.bx - st.px) < PW / 2 + BR
        ) {
          st.bvy = -Math.abs(st.bvy);
          st.bvx += ((st.bx - st.px) / (PW / 2)) * 160;
          sfx.blip(); haptic(6);
        }

        for (const b of st.bricks) {
          if (!b.alive) continue;
          if (st.bx > b.x - BR && st.bx < b.x + BW + BR && st.by > b.y - BR && st.by < b.y + BH + BR) {
            b.alive = false;
            sfx.brick();
            if (Math.random() < 0.14) {
              st.drops.push({
                x: b.x + BW / 2, y: b.y + BH / 2,
                kind: Math.random() < 0.5 ? "life" : "slow",
              });
            }
            boom(9, b.x + BW / 2, b.y + BH / 2, b.color);
            st.score += 10;
            setScore(st.score);
            const overlapX = Math.min(st.bx - (b.x - BR), b.x + BW + BR - st.bx);
            const overlapY = Math.min(st.by - (b.y - BR), b.y + BH + BR - st.by);
            if (overlapX < overlapY) st.bvx *= -1;
            else st.bvy *= -1;
            break;
          }
        }

        if (st.bricks.every((b) => !b.alive)) {
          st.level += 1;
          buildBricks();
          st.bx = st.px;
          st.by = H - 80;
          const speed = 1 + st.level * 0.08;
          st.bvx = 190 * speed * (Math.random() < 0.5 ? 1 : -1);
          st.bvy = -260 * speed;
          st.trail.length = 0;
        }

        if (st.by > H + BR) loseLife();
      }

      draw();
    };
    st.raf = requestAnimationFrame(loop);

    stRef.current.buildBricks = buildBricks;
    buildBricks();

    return () => {
      cancelAnimationFrame(st.raf);
      surface.removeEventListener("mousemove", onMouse);
      surface.removeEventListener("touchmove", onTouch);
    };
  }, []);

  const startGame = () => {
    const st = stRef.current;
    st.buildBricks();
    st.score = 0;
    st.lives = 3;
    st.level = 1;
    st.bx = W / 2;
    st.by = H - 80;
    st.bvx = 190;
    st.bvy = -260;
    st.trail.length = 0;
    st.particles.length = 0;
    st.drops.length = 0;
    st.slowT = 0;
    st.running = true;
    setScore(0);
    setLives(3);
    setWon(false);
    setGameOver(false);
    setGameStarted(true);
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-16 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
        <div className="bg-[#e50914] text-white px-3 py-1 rounded-md flex items-center gap-2">
          <FaTrophy /> <span className="font-bold">{score}</span>
        </div>
        <div className="flex items-center gap-1 text-[#e50914]">
          {Array.from({ length: lives }).map((_, i) => <FaHeart key={i} />)}
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
                <h3 className="text-3xl font-bold text-[#e50914] mb-1">{won ? "You cleared it!" : "Game Over"}</h3>
                <p className="text-xl text-white mb-1">Score: {score}</p>
                <p className="text-gray-400 mb-5">Best: {highScore}</p>
              </>
            ) : (
              <>
                <h3 className="text-3xl font-bold text-[#e50914] mb-2">Brick Breaker</h3>
                <p className="text-gray-300 mb-6">Move the paddle with your mouse or finger. Smash all the bricks!</p>
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

export default BrickBreaker;
