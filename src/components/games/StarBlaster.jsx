import React, { useEffect, useRef, useState } from "react";
import { FaPlay, FaRedo, FaTrophy } from "react-icons/fa";
import { sfx, haptic, shake } from './gameFeel';

const W = 440;
const H = 520;

function StarBlaster() {
  const canvasRef = useRef(null);
  const stRef = useRef({ running: false });
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    () => Number(localStorage.getItem("blasterHigh")) || 0
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // Input surface = the fullscreen wrapper, so the letterboxed
    // black bars on narrow screens are tappable too.
    const surface = canvas.parentElement || canvas;

    const st = {
      running: false,
      x: W / 2,
      bullets: [],
      rocks: [],
      particles: [],
      fireTimer: 0,
      spawnTimer: 0,
      score: 0,
      t: 0,
      raf: 0,
      last: performance.now(),
      keys: {},
    };
    stRef.current = st;

    const boom = (n, x, y, color, spread = 140) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = Math.random() * spread;
        st.particles.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 0.6 + Math.random() * 0.4,
          size: 1.8 + Math.random() * 2.6,
          color,
        });
      }
    };

    const onKey = (e, down) => {
      if (["ArrowLeft", "ArrowRight", "a", "d", "A", "D"].includes(e.key)) {
        e.preventDefault();
        st.keys[e.key] = down;
      }
    };
    const onKeyDown = (e) => onKey(e, true);
    const onKeyUp = (e) => onKey(e, false);
    const onMove = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      st.x = Math.max(20, Math.min(W - 20, (clientX - rect.left) * (W / rect.width)));
    };
    const onMouse = (e) => onMove(e.clientX);
    const onTouch = (e) => {
      e.preventDefault();
      onMove(e.touches[0].clientX);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    surface.addEventListener("mousemove", onMouse);
    surface.addEventListener("touchmove", onTouch, { passive: false });

    const endGame = () => {
      st.running = false;
      sfx.explode(); haptic([50, 30, 70]); shake(surface, 12);
      st.exploded = true;
      boom(26, st.x, H - 46, "rgba(229,9,20,0.95)", 210);
      boom(14, st.x, H - 46, "rgba(255,170,60,0.9)", 150);
      setGameOver(true);
      setGameStarted(false);
      setHighScore((h) => {
        const next = Math.max(h, st.score);
        localStorage.setItem("blasterHigh", String(next));
        return next;
      });
    };

    const drawShip = () => {
      ctx.save();
      ctx.translate(st.x, H - 46);

      // engine flames (twin, flickering)
      const fl = 8 + Math.sin(st.t * 30) * 3 + Math.random() * 2;
      ctx.fillStyle = "#ffb020";
      [-8, 8].forEach((fx) => {
        ctx.beginPath();
        ctx.moveTo(fx - 3, 12);
        ctx.lineTo(fx, 12 + fl);
        ctx.lineTo(fx + 3, 12);
        ctx.closePath();
        ctx.fill();
      });

      // side engine pods
      ctx.fillStyle = "#8a0710";
      ctx.beginPath();
      ctx.roundRect(-14, -2, 7, 16, 3);
      ctx.roundRect(7, -2, 7, 16, 3);
      ctx.fill();

      // hull
      ctx.fillStyle = "#e50914";
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.quadraticCurveTo(10, -4, 9, 12);
      ctx.lineTo(-9, 12);
      ctx.quadraticCurveTo(-10, -4, 0, -20);
      ctx.closePath();
      ctx.fill();

      // hull highlight
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.quadraticCurveTo(-6, -4, -5, 10);
      ctx.lineTo(-2, 10);
      ctx.quadraticCurveTo(-3, -6, 0, -18);
      ctx.closePath();
      ctx.fill();

      // cockpit
      ctx.fillStyle = "#9fd9ff";
      ctx.beginPath();
      ctx.ellipse(0, -4, 4, 6.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.ellipse(-1.4, -6.5, 1.5, 2.4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const draw = () => {
      // Nebula sky
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#0a0716");
      grad.addColorStop(0.5, "#140b28");
      grad.addColorStop(1, "#221036");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      const neb = ctx.createRadialGradient(W * 0.25, H * 0.3, 10, W * 0.25, H * 0.3, 240);
      neb.addColorStop(0, "rgba(139,92,246,0.12)");
      neb.addColorStop(1, "rgba(139,92,246,0)");
      ctx.fillStyle = neb;
      ctx.fillRect(0, 0, W, H);

      // Background planet
      ctx.save();
      ctx.globalAlpha = 0.5;
      const pg = ctx.createRadialGradient(W - 80, 120, 8, W - 80, 120, 46);
      pg.addColorStop(0, "#7dd3fc");
      pg.addColorStop(1, "#0ea5e9");
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(W - 80, 120, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(W - 80, 120, 56, 14, -0.35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // distant galaxy swirl
      ctx.save();
      ctx.translate(W * 0.22, H * 0.72);
      ctx.rotate(st.t * 0.05);
      for (let a = 0; a < 3; a++) {
        ctx.strokeStyle = `rgba(190,150,255,${0.10 - a * 0.025})`;
        ctx.lineWidth = 8 - a * 2;
        ctx.beginPath();
        for (let s = 0; s < 40; s++) {
          const th = s * 0.22 + a * 2.1;
          const rr = s * 1.7;
          const px = Math.cos(th) * rr, py = Math.sin(th) * rr * 0.45;
          s ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        }
        ctx.stroke();
      }
      ctx.restore();

      // Stars — two layers
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      for (let i = 0; i < 40; i++) {
        const sy = (i * 137 + st.t * (30 + (i % 5) * 12)) % H;
        ctx.fillRect((i * 61) % W, sy, 2, 2);
      }
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      for (let i = 0; i < 30; i++) {
        const sy = (i * 173 + st.t * 14) % H;
        ctx.fillRect((i * 97) % W, sy, 1.5, 1.5);
      }

      // Bullets — glowing
      st.bullets.forEach((b) => {
        ctx.save();
        ctx.shadowColor = "rgba(254,240,138,0.9)";
        ctx.shadowBlur = 8;
        ctx.fillStyle = "#fef08a";
        ctx.beginPath();
        ctx.roundRect(b.x - 2, b.y - 9, 4, 13, 2);
        ctx.fill();
        ctx.restore();
      });

      // Rocks — outlined with crater dots
      st.rocks.forEach((r) => {
        ctx.save();
        ctx.translate(r.x, r.y);
        ctx.rotate(r.rot);
        ctx.fillStyle = r.color;
        ctx.beginPath();
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * Math.PI * 2;
          const rad = r.size * (0.8 + ((i * 37) % 10) / 25);
          ctx[i ? "lineTo" : "moveTo"](Math.cos(a) * rad, Math.sin(a) * rad);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.35)";
        ctx.lineWidth = 2;
        ctx.stroke();
        // craters
        ctx.fillStyle = "rgba(0,0,0,0.22)";
        ctx.beginPath();
        ctx.arc(-r.size * 0.3, -r.size * 0.15, r.size * 0.18, 0, Math.PI * 2);
        ctx.arc(r.size * 0.25, r.size * 0.3, r.size * 0.13, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Particles
      st.particles.forEach((pt) => {
        ctx.globalAlpha = Math.max(0, pt.life);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * pt.life, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      if (!st.exploded) drawShip();
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
        pt.life -= dt * 1.5;
        if (pt.life <= 0) st.particles.splice(i, 1);
      }

      if (st.running) {
        const kSpeed = 330;
        if (st.keys.ArrowLeft || st.keys.a || st.keys.A) st.x = Math.max(20, st.x - kSpeed * dt);
        if (st.keys.ArrowRight || st.keys.d || st.keys.D) st.x = Math.min(W - 20, st.x + kSpeed * dt);

        st.fireTimer -= dt;
        if (st.fireTimer <= 0) {
          st.bullets.push({ x: st.x, y: H - 64 });
          sfx.laser();
          st.fireTimer = 0.22;
        }
        st.bullets.forEach((b) => (b.y -= 480 * dt));
        st.bullets = st.bullets.filter((b) => b.y > -20);

        st.spawnTimer -= dt;
        if (st.spawnTimer <= 0) {
          const size = 14 + Math.random() * 18;
          st.rocks.push({
            x: 20 + Math.random() * (W - 40),
            y: -30,
            vy: 70 + Math.random() * 90 + st.t * 2.5,
            size,
            rot: 0,
            vrot: (Math.random() - 0.5) * 3,
            color: `hsl(${Math.floor(Math.random() * 360)}, 60%, 55%)`,
          });
          st.spawnTimer = Math.max(0.25, 0.8 - st.t * 0.012);
        }

        for (let i = st.rocks.length - 1; i >= 0; i--) {
          const r = st.rocks[i];
          r.y += r.vy * dt;
          r.rot += r.vrot * dt;

          for (let j = st.bullets.length - 1; j >= 0; j--) {
            const b = st.bullets[j];
            if ((b.x - r.x) ** 2 + (b.y - r.y) ** 2 < (r.size + 4) ** 2) {
              boom(10, r.x, r.y, r.color, 120);
              sfx.brick();
              st.rocks.splice(i, 1);
              st.bullets.splice(j, 1);
              st.score += 10;
              setScore(st.score);
              break;
            }
          }

          if (!st.rocks[i]) continue;
          if ((r.x - st.x) ** 2 + (r.y - (H - 46)) ** 2 < (r.size + 12) ** 2) {
            endGame();
            break;
          }
          if (r.y > H + 40) st.rocks.splice(i, 1);
        }
      }

      draw();
    };
    st.raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(st.raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      surface.removeEventListener("mousemove", onMouse);
      surface.removeEventListener("touchmove", onTouch);
    };
  }, []);

  const startGame = () => {
    const st = stRef.current;
    st.x = W / 2;
    st.bullets.length = 0;
    st.rocks.length = 0;
    st.particles.length = 0;
    st.fireTimer = 0;
    st.spawnTimer = 0.5;
    st.score = 0;
    st.t = 0;
    st.exploded = false;
    st.running = true;
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-16 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
        <div className="bg-[#e50914] text-white px-3 py-1 rounded-md flex items-center gap-2">
          <FaTrophy /> <span className="font-bold">{score}</span>
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
                <h3 className="text-3xl font-bold text-[#e50914] mb-1">Ship Down!</h3>
                <p className="text-xl text-white mb-1">Score: {score}</p>
                <p className="text-gray-400 mb-5">Best: {highScore}</p>
              </>
            ) : (
              <>
                <h3 className="text-3xl font-bold text-[#e50914] mb-2">Star Blaster</h3>
                <p className="text-gray-300 mb-6">Steer with arrows, mouse, or finger — your ship fires on its own. Blast the space rocks!</p>
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

export default StarBlaster;
