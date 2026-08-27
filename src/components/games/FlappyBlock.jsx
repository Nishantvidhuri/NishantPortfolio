import React, { useEffect, useRef, useState } from "react";
import { FaPlay, FaRedo, FaTrophy } from "react-icons/fa";

const W = 400;
const H = 520;

function FlappyBlock() {
  const canvasRef = useRef(null);
  const stRef = useRef({ running: false });
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    () => Number(localStorage.getItem("flappyHigh")) || 0
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const st = {
      running: false,
      y: H / 2,
      vy: 0,
      pipes: [],
      particles: [],
      spawn: 0,
      score: 0,
      flap: 0,
      raf: 0,
      last: performance.now(),
      t: 0,
    };
    stRef.current = st;

    const puff = (n, x, y, color, spread = 60, up = 0) => {
      for (let i = 0; i < n; i++) {
        st.particles.push({
          x, y,
          vx: (Math.random() - 0.5) * spread,
          vy: (Math.random() - 0.5) * spread - up,
          life: 1,
          size: 2 + Math.random() * 3,
          color,
        });
      }
    };

    const flap = () => {
      if (!st.running) return;
      st.vy = -320;
      st.flap = 1;
      puff(4, 90 - 14, st.y + 10, "rgba(255,255,255,0.7)", 50, -20);
    };
    stRef.current.flap = flap;

    const onKey = (e) => {
      if (e.code === "Space" || e.key === "ArrowUp") {
        e.preventDefault();
        flap();
      }
    };
    const onPointer = () => flap();
    window.addEventListener("keydown", onKey);
    canvas.addEventListener("pointerdown", onPointer);

    const endGame = () => {
      st.running = false;
      puff(20, 90, st.y, "rgba(229,9,20,0.9)", 190);
      setGameOver(true);
      setGameStarted(false);
      setHighScore((h) => {
        const next = Math.max(h, st.score);
        localStorage.setItem("flappyHigh", String(next));
        return next;
      });
    };

    // deterministic building heights
    const bH = (i, seed) => 40 + ((i * 73 + seed * 37) % 70);

    const draw = () => {
      // Sky
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#141034");
      grad.addColorStop(0.55, "#1d1240");
      grad.addColorStop(1, "#2a1436");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Moon + halo
      ctx.save();
      const mg = ctx.createRadialGradient(320, 86, 6, 320, 86, 60);
      mg.addColorStop(0, "rgba(254,243,199,0.9)");
      mg.addColorStop(0.35, "rgba(254,243,199,0.25)");
      mg.addColorStop(1, "rgba(254,243,199,0)");
      ctx.fillStyle = mg;
      ctx.fillRect(240, 6, 160, 160);
      ctx.fillStyle = "#fef3c7";
      ctx.beginPath();
      ctx.arc(320, 86, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.beginPath();
      ctx.arc(312, 80, 6, 0, Math.PI * 2);
      ctx.arc(328, 94, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Stars — two parallax layers
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      for (let i = 0; i < 26; i++) {
        const sx = ((i * 97 + st.t * 14) % (W + 20)) - 10;
        ctx.fillRect(W - sx, (i * 61) % (H * 0.6), 2, 2);
      }
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      for (let i = 0; i < 20; i++) {
        const sx = ((i * 131 + st.t * 7) % (W + 20)) - 10;
        ctx.fillRect(W - sx, (i * 83) % (H * 0.55), 1.5, 1.5);
      }

      // Distant skyline (parallax)
      ctx.fillStyle = "#191036";
      for (let i = 0; i < 9; i++) {
        const bw = 52;
        const x = ((i * bw - st.t * 12) % (W + bw * 2) + W + bw * 2) % (W + bw * 2) - bw;
        const h = bH(i, 1);
        ctx.fillRect(x, H - 26 - h, bw - 6, h);
      }
      // Near skyline with lit windows
      for (let i = 0; i < 8; i++) {
        const bw = 64;
        const x = ((i * bw - st.t * 26) % (W + bw * 2) + W + bw * 2) % (W + bw * 2) - bw;
        const h = bH(i, 5) + 26;
        ctx.fillStyle = "#221543";
        ctx.fillRect(x, H - 26 - h, bw - 8, h);
        ctx.fillStyle = "rgba(255,214,102,0.55)";
        for (let wy = 0; wy < 3; wy++)
          for (let wx = 0; wx < 3; wx++)
            if ((i * 7 + wy * 3 + wx) % 3 !== 0)
              ctx.fillRect(x + 8 + wx * 16, H - 26 - h + 10 + wy * 22, 6, 8);
      }

      // Pipes — shaded with glowing rims
      st.pipes.forEach((p) => {
        const pg = ctx.createLinearGradient(p.x, 0, p.x + p.w, 0);
        pg.addColorStop(0, "#15803d");
        pg.addColorStop(0.35, "#4ade80");
        pg.addColorStop(1, "#166534");
        ctx.fillStyle = pg;
        ctx.fillRect(p.x, 0, p.w, p.top);
        ctx.fillRect(p.x, p.top + p.gap, p.w, H - p.top - p.gap - 26);
        // caps
        ctx.save();
        ctx.shadowColor = "rgba(74,222,128,0.8)";
        ctx.shadowBlur = 10;
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(p.x - 5, p.top - 16, p.w + 10, 16);
        ctx.fillRect(p.x - 5, p.top + p.gap, p.w + 10, 16);
        ctx.restore();
        // cap highlight
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.fillRect(p.x - 5, p.top - 16, p.w + 10, 4);
        ctx.fillRect(p.x - 5, p.top + p.gap, p.w + 10, 4);
      });

      // Scrolling ground strip
      ctx.fillStyle = "#160d2b";
      ctx.fillRect(0, H - 26, W, 26);
      ctx.fillStyle = "rgba(229,9,20,0.55)";
      ctx.fillRect(0, H - 26, W, 3);
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      for (let i = 0; i < 10; i++) {
        const gx = ((i * 52 - st.t * 165) % (W + 60) + W + 60) % (W + 60) - 30;
        ctx.fillRect(gx, H - 14, 22, 3);
      }

      // Particles
      st.particles.forEach((pt) => {
        ctx.globalAlpha = Math.max(0, pt.life);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * pt.life, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Player — bird block with flapping wing
      ctx.save();
      ctx.translate(90, st.y);
      ctx.rotate(Math.max(-0.4, Math.min(0.6, st.vy / 500)));
      // body
      ctx.fillStyle = "#e50914";
      ctx.beginPath();
      ctx.roundRect(-16, -16, 32, 32, 7);
      ctx.fill();
      // belly
      ctx.fillStyle = "#ff5b63";
      ctx.beginPath();
      ctx.roundRect(-16, 2, 32, 14, { bl: 7, br: 7, tl: 0, tr: 0 });
      ctx.fill();
      // wing (flaps after each tap)
      const wingAng = -0.5 - st.flap * 1.1 + Math.sin(st.t * 9) * 0.08;
      ctx.save();
      ctx.translate(-6, 2);
      ctx.rotate(wingAng);
      ctx.fillStyle = "#b00710";
      ctx.beginPath();
      ctx.roundRect(-12, -4, 14, 9, 4);
      ctx.fill();
      ctx.restore();
      // eye
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(7, -6, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.arc(8.5, -6, 2.6, 0, Math.PI * 2);
      ctx.fill();
      // beak
      ctx.fillStyle = "#ffb020";
      ctx.beginPath();
      ctx.moveTo(16, -2);
      ctx.lineTo(24, 2);
      ctx.lineTo(16, 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const loop = (now) => {
      st.raf = requestAnimationFrame(loop);
      const dt = Math.min((now - st.last) / 1000, 0.04);
      st.last = now;
      st.t += dt;
      st.flap = Math.max(0, st.flap - dt * 4);

      // particles always update
      for (let i = st.particles.length - 1; i >= 0; i--) {
        const pt = st.particles[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.vy += 160 * dt;
        pt.life -= dt * 1.6;
        if (pt.life <= 0) st.particles.splice(i, 1);
      }

      if (st.running) {
        st.vy += 900 * dt;
        st.y += st.vy * dt;

        st.spawn -= dt;
        if (st.spawn <= 0) {
          const top = 60 + Math.random() * (H - 346);
          st.pipes.push({ x: W + 10, w: 58, top, gap: 165, passed: false });
          st.spawn = 1.45;
        }

        for (let i = st.pipes.length - 1; i >= 0; i--) {
          const p = st.pipes[i];
          p.x -= 165 * dt;
          if (!p.passed && p.x + p.w < 90 - 16) {
            p.passed = true;
            st.score += 1;
            setScore(st.score);
            puff(7, p.x + p.w / 2, p.top + p.gap / 2, "rgba(255,214,102,0.9)", 80);
          }
          if (p.x + p.w < -20) st.pipes.splice(i, 1);

          const withinX = 90 + 16 > p.x && 90 - 16 < p.x + p.w;
          const hitsY = st.y - 16 < p.top || st.y + 16 > p.top + p.gap;
          if (withinX && hitsY) endGame();
        }

        if (st.y + 16 > H - 26 || st.y - 16 < 0) endGame();
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
    st.y = H / 2;
    st.vy = -260;
    st.pipes.length = 0;
    st.particles.length = 0;
    st.spawn = 1.0;
    st.score = 0;
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
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-center px-4">
            {gameOver ? (
              <>
                <h3 className="text-3xl font-bold text-[#e50914] mb-1">Bonked!</h3>
                <p className="text-xl text-white mb-1">Score: {score}</p>
                <p className="text-gray-400 mb-5">Best: {highScore}</p>
              </>
            ) : (
              <>
                <h3 className="text-3xl font-bold text-[#e50914] mb-2">Flappy Block</h3>
                <p className="text-gray-300 mb-6">Tap, click, or press Space to fly through the pipes!</p>
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

export default FlappyBlock;
