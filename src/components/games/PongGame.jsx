import React, { useEffect, useRef, useState } from "react";
import { FaPlay, FaRedo } from "react-icons/fa";
import { sfx, haptic, shake } from './gameFeel';

const W = 520;
const H = 340;
const WIN_SCORE = 5;

function PongGame() {
  const canvasRef = useRef(null);
  const stRef = useRef({ running: false });
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [wins, setWins] = useState(() => Number(localStorage.getItem("pongWins")) || 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // Input surface = the fullscreen wrapper, so the letterboxed
    // black bars on narrow screens are tappable too.
    const surface = canvas.parentElement || canvas;

    const st = {
      running: false,
      py: H / 2,
      ay: H / 2,
      bx: W / 2, by: H / 2, bvx: 240, bvy: 120,
      ps: 0, as: 0,
      trail: [],
      particles: [],
      flash: 0,
      raf: 0, last: performance.now(),
      t: 0,
    };
    stRef.current = st;

    const PADDLE_H = 70, PADDLE_W = 10;

    const boom = (n, x, y, color) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 60 + Math.random() * 160;
        st.particles.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 0.5 + Math.random() * 0.4,
          size: 1.8 + Math.random() * 2.4,
          color,
        });
      }
    };

    const resetBall = (towardPlayer) => {
      st.bx = W / 2;
      st.by = H / 2;
      const angle = (Math.random() * 0.6 - 0.3) * Math.PI;
      const speed = 260;
      st.bvx = Math.cos(angle) * speed * (towardPlayer ? -1 : 1);
      st.bvy = Math.sin(angle) * speed;
      st.trail.length = 0;
    };

    const onMove = (clientY) => {
      const rect = canvas.getBoundingClientRect();
      st.py = Math.max(PADDLE_H / 2, Math.min(H - PADDLE_H / 2, (clientY - rect.top) * (H / rect.height)));
    };
    const onMouse = (e) => onMove(e.clientY);
    const onTouch = (e) => {
      e.preventDefault();
      onMove(e.touches[0].clientY);
    };
    surface.addEventListener("mousemove", onMouse);
    surface.addEventListener("touchmove", onTouch, { passive: false });

    const endGame = (playerWon) => {
      st.running = false;
      setGameOver(true);
      setGameStarted(false);
      if (playerWon)
        setWins((w) => {
          localStorage.setItem("pongWins", String(w + 1));
          return w + 1;
        });
    };

    const draw = () => {
      // Court
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#0b0a18");
      grad.addColorStop(1, "#171029");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // perspective arena floor receding to a vanishing point
      ctx.strokeStyle = "rgba(120,140,255,0.10)";
      ctx.lineWidth = 1;
      for (let i = -6; i <= 6; i++) {
        ctx.beginPath();
        ctx.moveTo(W / 2 + i * 26, H / 2);
        ctx.lineTo(W / 2 + i * 150, H);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(W / 2 + i * 26, H / 2);
        ctx.lineTo(W / 2 + i * 150, 0);
        ctx.stroke();
      }
      for (let i = 1; i <= 5; i++) {
        const o = Math.pow(i / 5, 2) * (H / 2);
        ctx.beginPath();
        ctx.moveTo(0, H / 2 + o); ctx.lineTo(W, H / 2 + o);
        ctx.moveTo(0, H / 2 - o); ctx.lineTo(W, H / 2 - o);
        ctx.stroke();
      }
      // arena glow vignette
      const vig = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, W * 0.75);
      vig.addColorStop(0, "rgba(90,110,255,0.10)");
      vig.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);
      // corner posts
      [[6,6],[W-6,6],[6,H-6],[W-6,H-6]].forEach(([px,py]) => {
        ctx.fillStyle = "rgba(229,9,20,0.85)";
        ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI*2); ctx.fill();
      });
      // scanlines
      ctx.fillStyle = "rgba(0,0,0,0.10)";
      for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);

      // goal flash
      if (st.flash > 0) {
        ctx.fillStyle = `rgba(229,9,20,${st.flash * 0.25})`;
        ctx.fillRect(0, 0, W, H);
      }

      // center circle + dashed line
      ctx.strokeStyle = "rgba(255,255,255,0.14)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, 42, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([8, 10]);
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.stroke();
      ctx.setLineDash([]);

      // glowing top/bottom rails
      ctx.fillStyle = "rgba(229,9,20,0.55)";
      ctx.fillRect(0, 0, W, 3);
      ctx.fillRect(0, H - 3, W, 3);

      // scores
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "bold 30px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(st.ps, W / 2 - 50, 42);
      ctx.fillText(st.as, W / 2 + 50, 42);

      // ball trail
      st.trail.forEach((tp, i) => {
        ctx.globalAlpha = (i / st.trail.length) * 0.3;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, 7 * (0.4 + (i / st.trail.length) * 0.6), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // particles
      st.particles.forEach((pt) => {
        ctx.globalAlpha = Math.max(0, pt.life * 1.5);
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
      });
      ctx.globalAlpha = 1;

      // paddles with glow
      ctx.save();
      ctx.shadowColor = "rgba(229,9,20,0.8)";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "#e50914";
      ctx.beginPath();
      ctx.roundRect(14, st.py - PADDLE_H / 2, PADDLE_W, PADDLE_H, 5);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.shadowColor = "rgba(250,204,21,0.8)";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.roundRect(W - 14 - PADDLE_W, st.ay - PADDLE_H / 2, PADDLE_W, PADDLE_H, 5);
      ctx.fill();
      ctx.restore();

      // ball
      ctx.save();
      ctx.shadowColor = "rgba(255,255,255,0.9)";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(st.bx, st.by, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const loop = (now) => {
      st.raf = requestAnimationFrame(loop);
      const dt = Math.min((now - st.last) / 1000, 0.04);
      st.last = now;
      st.t += dt;
      st.flash = Math.max(0, st.flash - dt * 2.4);

      for (let i = st.particles.length - 1; i >= 0; i--) {
        const pt = st.particles[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.life -= dt * 1.7;
        if (pt.life <= 0) st.particles.splice(i, 1);
      }

      if (st.running) {
        st.trail.push({ x: st.bx, y: st.by });
        if (st.trail.length > 8) st.trail.shift();

        st.bx += st.bvx * dt;
        st.by += st.bvy * dt;

        if (st.by < 7 || st.by > H - 7) st.bvy *= -1;

        const aiSpeed = 210;
        if (st.ay < st.by - 6) st.ay = Math.min(st.ay + aiSpeed * dt, st.by);
        else if (st.ay > st.by + 6) st.ay = Math.max(st.ay - aiSpeed * dt, st.by);
        st.ay = Math.max(PADDLE_H / 2, Math.min(H - PADDLE_H / 2, st.ay));

        if (st.bvx < 0 && st.bx < 14 + PADDLE_W + 7 && st.bx > 14 && Math.abs(st.by - st.py) < PADDLE_H / 2 + 7) {
          st.bvx = Math.abs(st.bvx) * 1.05;
          st.bvy += ((st.by - st.py) / (PADDLE_H / 2)) * 140;
          sfx.blip(); haptic(6);
          boom(5, st.bx, st.by, "rgba(229,9,20,0.8)");
        }
        if (st.bvx > 0 && st.bx > W - 14 - PADDLE_W - 7 && st.bx < W - 14 && Math.abs(st.by - st.ay) < PADDLE_H / 2 + 7) {
          st.bvx = -Math.abs(st.bvx) * 1.05;
          st.bvy += ((st.by - st.ay) / (PADDLE_H / 2)) * 140;
          sfx.blip();
          boom(5, st.bx, st.by, "rgba(250,204,21,0.8)");
        }

        if (st.bx < -10) {
          st.as += 1;
          setAiScore(st.as);
          sfx.fail(); shake(surface, 7);
          st.flash = 1;
          boom(14, 6, st.by, "rgba(250,204,21,0.9)");
          if (st.as >= WIN_SCORE) endGame(false);
          else resetBall(false);
        } else if (st.bx > W + 10) {
          st.ps += 1;
          setPlayerScore(st.ps);
          sfx.score(); haptic(20); shake(surface, 5);
          st.flash = 1;
          boom(14, W - 6, st.by, "rgba(229,9,20,0.9)");
          if (st.ps >= WIN_SCORE) endGame(true);
          else resetBall(true);
        }
      }

      draw();
    };
    st.raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(st.raf);
      surface.removeEventListener("mousemove", onMouse);
      surface.removeEventListener("touchmove", onTouch);
    };
  }, []);

  const startGame = () => {
    const st = stRef.current;
    st.ps = 0;
    st.as = 0;
    st.py = H / 2;
    st.ay = H / 2;
    st.bx = W / 2;
    st.by = H / 2;
    st.bvx = 240;
    st.bvy = 120;
    st.trail.length = 0;
    st.particles.length = 0;
    st.running = true;
    setPlayerScore(0);
    setAiScore(0);
    setGameOver(false);
    setGameStarted(true);
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-16 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
        <div className="text-white text-sm font-semibold">
          🔴 You {playerScore} — {aiScore} Computer 🟡
        </div>
        <span className="text-gray-400 text-sm">Wins: {wins}</span>
      </div>

      <div className="w-full h-full flex items-center justify-center touch-none">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="max-w-full max-h-full w-full h-auto md:w-auto md:h-full touch-none cursor-none"
        />

        {(!gameStarted || gameOver) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 text-center px-4">
            {gameOver ? (
              <>
                <h3 className={`text-3xl font-bold mb-1 ${playerScore > aiScore ? "text-green-500" : "text-[#e50914]"}`}>
                  {playerScore > aiScore ? "You win! 🏆" : "Computer wins! 🤖"}
                </h3>
                <p className="text-xl text-white mb-5">{playerScore} — {aiScore}</p>
              </>
            ) : (
              <>
                <h3 className="text-3xl font-bold text-[#e50914] mb-2">Pong</h3>
                <p className="text-gray-300 mb-6">Move your mouse or finger to control the red paddle. First to {WIN_SCORE}!</p>
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

export default PongGame;
