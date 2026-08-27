import React, { useEffect, useRef, useState } from "react";
import { FaPlay, FaRedo, FaTrophy } from "react-icons/fa";

const W = 560;
const H = 280;
const GROUND = H - 50;

function DinoDash() {
  const canvasRef = useRef(null);
  const stRef = useRef({ running: false });
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    () => Number(localStorage.getItem("dinoHigh")) || 0
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const st = {
      running: false,
      y: GROUND, vy: 0, airborne: false,
      obstacles: [],
      particles: [],
      dustTimer: 0,
      spawn: 0,
      speed: 260,
      score: 0,
      t: 0,
      raf: 0, last: performance.now(),
    };
    stRef.current = st;

    const puff = (n, x, y, color, spread = 50, up = 26) => {
      for (let i = 0; i < n; i++) {
        st.particles.push({
          x, y,
          vx: (Math.random() - 0.5) * spread - 30,
          vy: -Math.random() * up,
          life: 0.7 + Math.random() * 0.3,
          size: 1.6 + Math.random() * 2.2,
          color,
        });
      }
    };

    const jump = () => {
      if (st.running && st.y >= GROUND - 1) {
        st.vy = -560;
        puff(6, 80, GROUND + 26, "rgba(180,160,200,0.7)", 70, 10);
      }
    };
    stRef.current.jump = jump;

    const onKey = (e) => {
      if (e.code === "Space" || e.key === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };
    const onPointer = () => jump();
    window.addEventListener("keydown", onKey);
    canvas.addEventListener("pointerdown", onPointer);

    const endGame = () => {
      st.running = false;
      puff(18, 80, st.y - 18, "rgba(229,9,20,0.9)", 170, 60);
      setGameOver(true);
      setGameStarted(false);
      setHighScore((h) => {
        const next = Math.max(h, Math.floor(st.score));
        localStorage.setItem("dinoHigh", String(next));
        return next;
      });
    };

    const drawDino = () => {
      ctx.save();
      // +19 anchors the feet to the road surface (GROUND + 24)
      ctx.translate(80, st.y + 19);
      // subtle tilt while airborne
      ctx.rotate(Math.max(-0.14, Math.min(0.2, st.vy / 2600)));

      const red = "#e50914";
      const dark = "#b00710";

      // tail
      ctx.fillStyle = red;
      ctx.beginPath();
      ctx.moveTo(-18, -22);
      ctx.lineTo(-32, -14);
      ctx.lineTo(-18, -10);
      ctx.closePath();
      ctx.fill();

      // body
      ctx.beginPath();
      ctx.roundRect(-18, -32, 34, 30, 7);
      ctx.fill();

      // back spikes
      ctx.fillStyle = dark;
      for (let i = 0; i < 3; i++) {
        const sx = -12 + i * 10;
        ctx.beginPath();
        ctx.moveTo(sx, -32);
        ctx.lineTo(sx + 5, -40);
        ctx.lineTo(sx + 10, -32);
        ctx.closePath();
        ctx.fill();
      }

      // head
      ctx.fillStyle = red;
      ctx.beginPath();
      ctx.roundRect(6, -52, 26, 19, 6);
      ctx.fill();
      // snout notch
      ctx.fillStyle = dark;
      ctx.fillRect(24, -41, 8, 4);
      // eye
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(18, -45, 4.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.arc(19.5, -45, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // tiny arm
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.roundRect(2, -20, 9, 4, 2);
      ctx.fill();

      // legs — run cycle on ground, tucked in air
      ctx.fillStyle = dark;
      if (st.y >= GROUND - 1 && st.running) {
        const phase = Math.sin(st.t * 22);
        ctx.beginPath();
        ctx.roundRect(-14 + (phase > 0 ? 3 : 0), -4, 8, phase > 0 ? 6 : 9, 2);
        ctx.roundRect(2 - (phase > 0 ? 0 : 3), -4, 8, phase > 0 ? 9 : 6, 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.roundRect(-12, -6, 8, 6, 2);
        ctx.roundRect(2, -6, 8, 6, 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const drawCactus = (o) => {
      const g = o.shade;
      const trunk = `hsl(145, 65%, ${34 + g}%)`;
      const lite = `hsl(145, 60%, ${46 + g}%)`;
      const x = o.x, baseY = GROUND + 24;
      ctx.fillStyle = trunk;
      ctx.beginPath();
      ctx.roundRect(x - o.w / 2, baseY - o.h, o.w, o.h, 5);
      ctx.fill();
      // highlight stripe
      ctx.fillStyle = lite;
      ctx.fillRect(x - o.w / 2 + 3, baseY - o.h + 4, 3, o.h - 8);
      // arms (L-shaped), only on taller cacti
      if (o.h > 38) {
        ctx.fillStyle = trunk;
        // left arm
        ctx.beginPath();
        ctx.roundRect(x - o.w / 2 - 9, baseY - o.h * 0.62, 9, 5, 2);
        ctx.roundRect(x - o.w / 2 - 9, baseY - o.h * 0.62 - 10, 5, 14, 2);
        ctx.fill();
        // right arm
        ctx.beginPath();
        ctx.roundRect(x + o.w / 2, baseY - o.h * 0.5, 9, 5, 2);
        ctx.roundRect(x + o.w / 2 + 4, baseY - o.h * 0.5 - 12, 5, 16, 2);
        ctx.fill();
      }
    };

    const draw = () => {
      // Sky
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#120e26");
      grad.addColorStop(0.7, "#221334");
      grad.addColorStop(1, "#2c1838");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Stars
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      for (let i = 0; i < 22; i++) {
        const sx = ((i * 89 + st.t * 6) % (W + 10)) - 5;
        ctx.fillRect(W - sx, (i * 47) % (H * 0.5), 1.8, 1.8);
      }

      // Moon with halo + craters
      const mg = ctx.createRadialGradient(W - 70, 52, 4, W - 70, 52, 52);
      mg.addColorStop(0, "rgba(254,243,199,0.85)");
      mg.addColorStop(0.35, "rgba(254,243,199,0.2)");
      mg.addColorStop(1, "rgba(254,243,199,0)");
      ctx.fillStyle = mg;
      ctx.fillRect(W - 130, -8, 120, 120);
      ctx.fillStyle = "#fef3c7";
      ctx.beginPath();
      ctx.arc(W - 70, 52, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.beginPath();
      ctx.arc(W - 76, 47, 5, 0, Math.PI * 2);
      ctx.arc(W - 63, 58, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Clouds
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      for (let i = 0; i < 3; i++) {
        const cx = ((i * 230 - st.t * 9) % (W + 120) + W + 120) % (W + 120) - 60;
        const cy = 40 + i * 26;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 42, 11, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 26, cy + 5, 30, 9, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Parallax mountains — far + near
      const mtn = (seed, colr, speedF, hMax, baseUp) => {
        ctx.fillStyle = colr;
        ctx.beginPath();
        ctx.moveTo(-40, GROUND + 24);
        for (let i = 0; i < 10; i++) {
          const mw = 90;
          const x = ((i * mw - st.t * st.speed * speedF) % (W + mw * 2) + W + mw * 2) % (W + mw * 2) - mw;
          const h = baseUp + ((i * 61 + seed * 31) % hMax);
          ctx.lineTo(x, GROUND + 24 - h);
          ctx.lineTo(x + mw / 2, GROUND + 24);
        }
        ctx.lineTo(W + 40, GROUND + 24);
        ctx.closePath();
        ctx.fill();
      };
      mtn(1, "#1b1133", 0.06, 55, 30);
      mtn(7, "#251743", 0.14, 40, 16);

      // Ground
      ctx.fillStyle = "#170f2b";
      ctx.fillRect(0, GROUND + 24, W, H - GROUND - 24);
      ctx.fillStyle = "rgba(229,9,20,0.5)";
      ctx.fillRect(0, GROUND + 24, W, 2);
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      for (let i = 0; i < 12; i++) {
        const gx = ((i * 67 - st.t * st.speed * 0.4) % (W + 40) + W + 40) % (W + 40) - 20;
        ctx.fillRect(gx, GROUND + 34 + (i % 3) * 5, 14, 2);
      }

      // Obstacles
      st.obstacles.forEach(drawCactus);

      // Particles
      st.particles.forEach((pt) => {
        ctx.globalAlpha = Math.max(0, pt.life);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      drawDino();
    };

    const loop = (now) => {
      st.raf = requestAnimationFrame(loop);
      const dt = Math.min((now - st.last) / 1000, 0.04);
      st.last = now;

      // particles always
      for (let i = st.particles.length - 1; i >= 0; i--) {
        const pt = st.particles[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.vy += 120 * dt;
        pt.life -= dt * 1.8;
        if (pt.life <= 0) st.particles.splice(i, 1);
      }

      if (st.running) {
        st.t += dt;
        st.speed += dt * 9;
        st.score += dt * 12;
        setScore(Math.floor(st.score));

        st.vy += 1500 * dt;
        const prevY = st.y;
        st.y = Math.min(GROUND, st.y + st.vy * dt);

        // landing puff
        if (st.airborne && st.y >= GROUND - 0.5) {
          puff(8, 80, GROUND + 26, "rgba(180,160,200,0.75)", 90, 14);
          st.airborne = false;
        }
        if (st.y < GROUND - 1) st.airborne = true;

        // running dust
        st.dustTimer -= dt;
        if (st.dustTimer <= 0 && st.y >= GROUND - 1) {
          puff(1, 66, GROUND + 27, "rgba(160,140,185,0.5)", 30, 8);
          st.dustTimer = 0.12;
        }

        st.spawn -= dt;
        if (st.spawn <= 0) {
          st.obstacles.push({
            x: W + 30,
            w: 18 + Math.random() * 14,
            h: 28 + Math.random() * 26,
            shade: Math.floor(Math.random() * 3) * 4,
          });
          st.spawn = 0.9 + Math.random() * 0.9 - Math.min(0.45, st.t * 0.01);
        }

        for (let i = st.obstacles.length - 1; i >= 0; i--) {
          const o = st.obstacles[i];
          o.x -= st.speed * dt;
          if (o.x < -40) st.obstacles.splice(i, 1);
          else if (
            Math.abs(o.x - 80) < o.w / 2 + 12 &&
            st.y > GROUND + 24 - o.h - 34
          ) {
            endGame();
          }
        }
      }

      draw();
    };
    st.raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(st.raf);
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  const startGame = () => {
    const st = stRef.current;
    st.y = GROUND;
    st.vy = 0;
    st.airborne = false;
    st.obstacles.length = 0;
    st.particles.length = 0;
    st.spawn = 1.1;
    st.speed = 260;
    st.score = 0;
    st.t = 0;
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

      <div className="w-full h-full flex items-center justify-center">
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
                <h3 className="text-3xl font-bold text-[#e50914] mb-1">Ouch, cactus!</h3>
                <p className="text-xl text-white mb-1">Score: {score}</p>
                <p className="text-gray-400 mb-5">Best: {highScore}</p>
              </>
            ) : (
              <>
                <h3 className="text-3xl font-bold text-[#e50914] mb-2">Dino Dash</h3>
                <p className="text-gray-300 mb-6">Tap, click, or press Space to jump over the cacti!</p>
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

export default DinoDash;
