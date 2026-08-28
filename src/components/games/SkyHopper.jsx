import React, { useEffect, useRef, useState } from "react";
import { FaPlay, FaRedo, FaTrophy } from "react-icons/fa";
import { sfx, haptic, shake } from './gameFeel';

const W = 400;
const H = 520;

function SkyHopper() {
  const canvasRef = useRef(null);
  const stRef = useRef({ running: false });
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    () => Number(localStorage.getItem("hopperHigh")) || 0
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // Input surface = the fullscreen wrapper, so the letterboxed
    // black bars on narrow screens are tappable too.
    const surface = canvas.parentElement || canvas;

    const st = {
      running: false,
      x: W / 2, y: H - 100, vy: -430, vx: 0,
      platforms: [],
      particles: [],
      height: 0,
      score: 0,
      squash: 0,
      keys: {},
      raf: 0, last: performance.now(),
      t: 0,
    };
    stRef.current = st;

    const PW = 64, PH = 14;

    const buildPlatforms = () => {
      st.platforms = [{ x: W / 2 - PW / 2, y: H - 60, hue: 145 }];
      for (let y = H - 130; y > -60; y -= 66) {
        st.platforms.push({
          x: 10 + Math.random() * (W - PW - 20),
          y,
          hue: 130 + Math.random() * 40,
        });
      }
    };
    stRef.current.buildPlatforms = buildPlatforms;

    const puff = (n, x, y, color) => {
      for (let i = 0; i < n; i++) {
        st.particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 90,
          vy: Math.random() * 60 + 20,
          life: 0.6 + Math.random() * 0.3,
          size: 2 + Math.random() * 2.5,
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
    const onPointer = (e) => {
      if (!st.running) return;
      const rect = surface.getBoundingClientRect();
      st.vx = e.clientX - rect.left < rect.width / 2 ? -240 : 240;
    };
    const onPointerUp = () => (st.vx = 0);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    surface.addEventListener("pointerdown", onPointer);
    window.addEventListener("pointerup", onPointerUp);

    const endGame = () => {
      st.running = false;
      sfx.fail(); haptic([40, 30, 60]); shake(surface, 9);
      setGameOver(true);
      setGameStarted(false);
      setHighScore((h) => {
        const next = Math.max(h, st.score);
        localStorage.setItem("hopperHigh", String(next));
        return next;
      });
    };

    const drawPlatform = (p) => {
      // dirt body
      ctx.fillStyle = `hsl(${p.hue - 100}, 35%, 26%)`;
      ctx.beginPath();
      ctx.roundRect(p.x, p.y + 5, PW, PH - 5, 5);
      ctx.fill();
      // grass top
      ctx.fillStyle = `hsl(${p.hue}, 62%, 46%)`;
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, PW, 8, 4);
      ctx.fill();
      // grass highlight
      ctx.fillStyle = `hsl(${p.hue}, 70%, 60%)`;
      ctx.fillRect(p.x + 4, p.y + 1, PW - 8, 2);
      // little spring coils under each platform
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let k = 0; k < 3; k++) {
        ctx.moveTo(p.x + 14 + k * 18, p.y + PH);
        ctx.lineTo(p.x + 20 + k * 18, p.y + PH + 5);
        ctx.lineTo(p.x + 14 + k * 18, p.y + PH + 9);
      }
      ctx.stroke();
    };

    const drawHopper = () => {
      ctx.save();
      ctx.translate(st.x, st.y);
      // squash & stretch
      const sq = st.squash;
      ctx.scale(1 + sq * 0.35, 1 - sq * 0.3);
      ctx.rotate(Math.max(-0.15, Math.min(0.15, st.vx * 0.0005)));

      // body
      ctx.fillStyle = "#e50914";
      ctx.beginPath();
      ctx.roundRect(-15, -19, 30, 32, 10);
      ctx.fill();
      // belly
      ctx.fillStyle = "#ff5b63";
      ctx.beginPath();
      ctx.roundRect(-15, 0, 30, 13, { bl: 10, br: 10, tl: 0, tr: 0 });
      ctx.fill();
      // eyes
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(-6, -8, 5, 0, Math.PI * 2);
      ctx.arc(6, -8, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1a1a1a";
      const lookY = st.vy < 0 ? -1.5 : 1.5;
      ctx.beginPath();
      ctx.arc(-6, -8 + lookY, 2.4, 0, Math.PI * 2);
      ctx.arc(6, -8 + lookY, 2.4, 0, Math.PI * 2);
      ctx.fill();
      // cheeks
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.beginPath();
      ctx.arc(-10, -1, 2.5, 0, Math.PI * 2);
      ctx.arc(10, -1, 2.5, 0, Math.PI * 2);
      ctx.fill();
      // feet
      ctx.fillStyle = "#b00710";
      ctx.beginPath();
      ctx.roundRect(-12, 12, 9, 5, 3);
      ctx.roundRect(3, 12, 9, 5, 3);
      ctx.fill();
      ctx.restore();
    };

    const draw = () => {
      // Sky — deepens as you climb
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#0d1030");
      grad.addColorStop(0.6, "#1c1240");
      grad.addColorStop(1, "#2a1650");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Moon
      const mg = ctx.createRadialGradient(330, 70, 4, 330, 70, 48);
      mg.addColorStop(0, "rgba(254,243,199,0.85)");
      mg.addColorStop(0.4, "rgba(254,243,199,0.18)");
      mg.addColorStop(1, "rgba(254,243,199,0)");
      ctx.fillStyle = mg;
      ctx.fillRect(270, 12, 120, 120);
      ctx.fillStyle = "#fef3c7";
      ctx.beginPath();
      ctx.arc(330, 70, 19, 0, Math.PI * 2);
      ctx.fill();

      // Stars, drifting down slowly as you rise
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      for (let i = 0; i < 24; i++) {
        const sy = (i * 83 + st.height * 0.25) % (H + 20) - 10;
        ctx.fillRect((i * 61) % W, sy, 2, 2);
      }
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      for (let i = 0; i < 18; i++) {
        const sy = (i * 121 + st.height * 0.12) % (H + 20) - 10;
        ctx.fillRect((i * 97) % W, sy, 1.5, 1.5);
      }

      // Clouds drifting past (parallax with height)
      ctx.fillStyle = "rgba(255,255,255,0.07)";
      for (let i = 0; i < 4; i++) {
        const cy = (i * 170 + st.height * 0.45) % (H + 90) - 45;
        const cx = (i * 137 + st.t * 7) % (W + 130) - 65;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 44, 12, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 30, cy + 6, 30, 9, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // distant skyline far below, scrolling with height
      ctx.fillStyle = "rgba(10,14,40,0.85)";
      for (let i = 0; i < 10; i++) {
        const bw = 46;
        const bx = (i * bw * 1.1) % (W + bw) - bw / 2;
        const bh = 40 + ((i * 53) % 60);
        const by = H - 10 + ((st.height * 0.06) % 120) - 60;
        ctx.fillRect(bx, by, bw - 8, bh);
        ctx.fillStyle = "rgba(255,214,102,0.30)";
        for (let k = 0; k < 3; k++) ctx.fillRect(bx + 5 + k * 12, by + 8 + k * 12, 5, 6);
        ctx.fillStyle = "rgba(10,14,40,0.85)";
      }

      // platforms
      st.platforms.forEach(drawPlatform);

      // particles
      st.particles.forEach((pt) => {
        ctx.globalAlpha = Math.max(0, pt.life);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * pt.life, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      drawHopper();
    };

    const loop = (now) => {
      st.raf = requestAnimationFrame(loop);
      const dt = Math.min((now - st.last) / 1000, 0.04);
      st.last = now;
      st.t += dt;
      st.squash = Math.max(0, st.squash - dt * 5);

      for (let i = st.particles.length - 1; i >= 0; i--) {
        const pt = st.particles[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.life -= dt * 1.7;
        if (pt.life <= 0) st.particles.splice(i, 1);
      }

      if (st.running) {
        const kSpeed = 260;
        if (st.keys.ArrowLeft || st.keys.a || st.keys.A) st.x -= kSpeed * dt;
        else if (st.keys.ArrowRight || st.keys.d || st.keys.D) st.x += kSpeed * dt;
        else st.x += st.vx * dt;

        if (st.x < -14) st.x = W + 14;
        if (st.x > W + 14) st.x = -14;

        st.vy += 900 * dt;
        st.y += st.vy * dt;

        if (st.vy > 0) {
          for (const p of st.platforms) {
            if (
              st.x > p.x - 10 && st.x < p.x + PW + 10 &&
              st.y + 14 > p.y && st.y + 14 < p.y + PH + st.vy * dt + 4
            ) {
              st.vy = -430;
              st.squash = 1;
              sfx.bounce(); haptic(8);
              puff(5, st.x, p.y + 2, "rgba(160,220,170,0.7)");
              break;
            }
          }
        }

        if (st.y < H / 2) {
          const shift = H / 2 - st.y;
          st.y = H / 2;
          st.height += shift;
          st.score = Math.floor(st.height / 10);
          setScore(st.score);
          st.platforms.forEach((p) => (p.y += shift));
          st.particles.forEach((pt) => (pt.y += shift));
          st.platforms = st.platforms.filter((p) => p.y < H + 20);
          while (st.platforms.length < 10) {
            const topY = Math.min(...st.platforms.map((p) => p.y));
            st.platforms.push({
              x: 10 + Math.random() * (W - PW - 20),
              y: topY - 66,
              hue: 130 + Math.random() * 40,
            });
          }
        }

        if (st.y > H + 30) endGame();
      }

      draw();
    };
    st.raf = requestAnimationFrame(loop);

    buildPlatforms();

    return () => {
      cancelAnimationFrame(st.raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("pointerup", onPointerUp);
      surface.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  const startGame = () => {
    const st = stRef.current;
    st.buildPlatforms();
    st.x = W / 2;
    st.y = H - 100;
    st.vy = -430;
    st.vx = 0;
    st.height = 0;
    st.score = 0;
    st.particles.length = 0;
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
                <h3 className="text-3xl font-bold text-[#e50914] mb-1">You fell!</h3>
                <p className="text-xl text-white mb-1">Height: {score}</p>
                <p className="text-gray-400 mb-5">Best: {highScore}</p>
              </>
            ) : (
              <>
                <h3 className="text-3xl font-bold text-[#e50914] mb-2">Sky Hopper</h3>
                <p className="text-gray-300 mb-6">Bounce up the platforms! Arrows/A-D, or hold left & right side.</p>
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

export default SkyHopper;
