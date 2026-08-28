import React, { useEffect, useRef, useState } from "react";
import { FaPlay, FaRedo, FaTrophy } from "react-icons/fa";
import { sfx, haptic, shake } from './gameFeel';

const W = 400;
const H = 520;
const COLS = 4;
const TILE_H = 130;

function TapTiles() {
  const canvasRef = useRef(null);
  const stRef = useRef({ running: false });
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    () => Number(localStorage.getItem("tilesHigh")) || 0
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const COL_W = W / COLS;

    const st = {
      running: false,
      tiles: [],
      ripples: [],
      laneFlash: [0, 0, 0, 0],
      speed: 170,
      score: 0,
      raf: 0, last: performance.now(),
      t: 0,
    };
    stRef.current = st;

    const seedTiles = () => {
      st.tiles = [];
      for (let i = 0; i < 5; i++) {
        st.tiles.push({ col: Math.floor(Math.random() * COLS), y: -i * TILE_H - TILE_H, hit: false });
      }
    };
    stRef.current.seedTiles = seedTiles;

    const endGame = () => {
      st.running = false;
      sfx.fail(); haptic([40, 30, 60]); shake(canvas.parentElement, 9);
      setGameOver(true);
      setGameStarted(false);
      setHighScore((h) => {
        const next = Math.max(h, st.score);
        localStorage.setItem("tilesHigh", String(next));
        return next;
      });
    };

    const tap = (clientX, clientY) => {
      if (!st.running) return;
      const rect = canvas.getBoundingClientRect();
      const x = (clientX - rect.left) * (W / rect.width);
      const y = (clientY - rect.top) * (H / rect.height);
      const col = Math.floor(x / COL_W);
      st.laneFlash[col] = 1;

      const target = st.tiles
        .filter((t) => !t.hit && t.y > -TILE_H)
        .sort((a, b) => b.y - a.y)[0];
      if (!target) return;

      if (target.col === col && y > target.y && y < target.y + TILE_H + 60) {
        target.hit = true;
        st.score += 1;
        st.speed += 4;
        sfx.note(st.score - 1); haptic(6);
        setScore(st.score);
        st.ripples.push({
          x: col * COL_W + COL_W / 2,
          y: target.y + TILE_H / 2,
          r: 8,
          life: 1,
        });
      } else {
        endGame();
      }
    };
    const onPointer = (e) => tap(e.clientX, e.clientY);
    canvas.addEventListener("pointerdown", onPointer);

    const draw = () => {
      // Dark stage
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#101018");
      grad.addColorStop(1, "#191925");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // lane flashes + dividers
      for (let c = 0; c < COLS; c++) {
        if (st.laneFlash[c] > 0) {
          ctx.fillStyle = `rgba(229,9,20,${st.laneFlash[c] * 0.12})`;
          ctx.fillRect(c * COL_W, 0, COL_W, H);
        }
      }
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      for (let c = 1; c < COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(c * COL_W, 0);
        ctx.lineTo(c * COL_W, H);
        ctx.stroke();
      }

      // stage light beams from the top of each lane
      for (let c = 0; c < COLS; c++) {
        const g = ctx.createLinearGradient(0, 0, 0, H * 0.8);
        g.addColorStop(0, `rgba(255,255,255,${0.05 + st.laneFlash[c] * 0.10})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(c * COL_W + COL_W * 0.42, 0);
        ctx.lineTo(c * COL_W + COL_W * 0.58, 0);
        ctx.lineTo(c * COL_W + COL_W, H * 0.8);
        ctx.lineTo(c * COL_W, H * 0.8);
        ctx.closePath();
        ctx.fill();
      }

      // hit zone hint at bottom
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(0, H - 90, W, 90);
      ctx.fillStyle = "rgba(229,9,20,0.4)";
      ctx.fillRect(0, H - 90, W, 2);

      // piano keyboard along the bottom
      for (let c = 0; c < COLS; c++) {
        const kx = c * COL_W + 3;
        const lit = st.laneFlash[c];
        ctx.fillStyle = lit > 0 ? `rgba(255,${120 + lit * 120},${120 + lit * 120},1)` : "#f4f4f5";
        ctx.beginPath();
        ctx.roundRect(kx, H - 46, COL_W - 6, 42, { tl: 3, tr: 3, bl: 6, br: 6 });
        ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.fillRect(kx, H - 46, COL_W - 6, 3);
        if (c < COLS - 1) {
          ctx.fillStyle = "#18181b";
          ctx.fillRect((c + 1) * COL_W - 9, H - 46, 18, 25);
        }
      }

      // tiles
      st.tiles.forEach((t) => {
        const x = t.col * COL_W + 3;
        if (t.hit) {
          ctx.fillStyle = "rgba(229,9,20,0.15)";
          ctx.beginPath();
          ctx.roundRect(x, t.y, COL_W - 6, TILE_H - 6, 8);
          ctx.fill();
        } else {
          // glossy red tile
          const tg = ctx.createLinearGradient(0, t.y, 0, t.y + TILE_H);
          tg.addColorStop(0, "#ff2934");
          tg.addColorStop(1, "#b00710");
          ctx.save();
          ctx.shadowColor = "rgba(229,9,20,0.45)";
          ctx.shadowBlur = 12;
          ctx.fillStyle = tg;
          ctx.beginPath();
          ctx.roundRect(x, t.y, COL_W - 6, TILE_H - 6, 8);
          ctx.fill();
          ctx.restore();
          // gloss
          ctx.fillStyle = "rgba(255,255,255,0.18)";
          ctx.beginPath();
          ctx.roundRect(x + 5, t.y + 5, COL_W - 16, 14, 6);
          ctx.fill();
          // tap pip
          ctx.fillStyle = "rgba(255,255,255,0.85)";
          ctx.beginPath();
          ctx.arc(t.col * COL_W + COL_W / 2, t.y + TILE_H - 26, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // ripples
      st.ripples.forEach((rp) => {
        ctx.globalAlpha = Math.max(0, rp.life * 0.7);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    };

    const loop = (now) => {
      st.raf = requestAnimationFrame(loop);
      const dt = Math.min((now - st.last) / 1000, 0.04);
      st.last = now;
      st.t += dt;

      for (let c = 0; c < COLS; c++) st.laneFlash[c] = Math.max(0, st.laneFlash[c] - dt * 4);
      for (let i = st.ripples.length - 1; i >= 0; i--) {
        const rp = st.ripples[i];
        rp.r += dt * 160;
        rp.life -= dt * 2.4;
        if (rp.life <= 0) st.ripples.splice(i, 1);
      }

      if (st.running) {
        st.tiles.forEach((t) => (t.y += st.speed * dt));

        const missed = st.tiles.find((t) => !t.hit && t.y > H);
        if (missed) {
          endGame();
        }

        for (const t of st.tiles) {
          if (t.y > H + 10 && t.hit) {
            const topY = Math.min(...st.tiles.map((x) => x.y));
            t.y = topY - TILE_H;
            t.col = Math.floor(Math.random() * COLS);
            t.hit = false;
          }
        }
      }

      draw();
    };
    st.raf = requestAnimationFrame(loop);

    seedTiles();

    return () => {
      cancelAnimationFrame(st.raf);
      canvas.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  const startGame = () => {
    const st = stRef.current;
    st.seedTiles();
    st.ripples.length = 0;
    st.speed = 170;
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

      <div className="w-full h-full flex items-center justify-center touch-none">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="max-w-full max-h-full w-full h-auto md:w-auto md:h-full touch-none"
        />

        {(!gameStarted || gameOver) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-center px-4">
            {gameOver ? (
              <>
                <h3 className="text-3xl font-bold text-[#e50914] mb-1">Missed!</h3>
                <p className="text-xl text-white mb-1">Tiles tapped: {score}</p>
                <p className="text-gray-400 mb-5">Best: {highScore}</p>
              </>
            ) : (
              <>
                <h3 className="text-3xl font-bold text-[#e50914] mb-2">Tap Tiles</h3>
                <p className="text-gray-300 mb-6">Tap the red tiles before they reach the bottom. Don't tap empty lanes!</p>
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

export default TapTiles;
