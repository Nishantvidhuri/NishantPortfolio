import React, { useEffect, useRef } from "react";
import { DUR, VW, VH, renderFrame, makeNoise } from "./showreel/renderShowreel";

/* ============================================================================
   HERO SHOWREEL — plays the showreel renderer live behind the hero.
   Owns sizing, the cover/narrow fit, reduced-motion, and pausing offscreen.
   ============================================================================ */

/**
 * safeLeft: CSS px on the left kept clear for copy laid over the reel. The
 * action is fitted into the space to its right — full cover where there's
 * room, scaled down a little where the copy takes a big share of the width.
 */
function HeroShowreel({ className = "", startAt = 0, paused = false, safeLeft = 0 }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const noiseTile = makeNoise();
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    let raf = 0;
    let t = startAt % DUR;
    let last = 0;
    let frame = 0;
    let inView = false;         // set by the IntersectionObserver's first callback
    let dead = false;

    const fit = () => {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const w = Math.max(1, Math.round(r.width * dpr));
      const h = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      return { w, h };
    };

    /**
     * Fit the 1920x1080 stage. Three limits, smallest wins:
     *  - cover, so on a normal desktop the stage fills the frame;
     *  - MIN_VISIBLE_W, so a phone never crops to a sliver and cuts type;
     *  - the action box (where every scene lives) must fit right of safeLeft.
     * The action box is then right-aligned. Anything the stage doesn't reach
     * is filled with the same near-black the composition vignettes to.
     */
    const MIN_VISIBLE_W = 1560;
    const ACTION_L = 860, ACTION_R = 1900;
    const paint = () => {
      const { w, h } = fit();
      const dpr = w / Math.max(1, wrap.getBoundingClientRect().width);
      // never give the copy more than 55% of the frame, or the reel gets tiny
      const safe = Math.min(safeLeft * dpr, w * 0.55);
      const s = Math.min(Math.max(w / VW, h / VH), w / MIN_VISIBLE_W, (w - safe) / (ACTION_R - ACTION_L));
      let tx = w - ACTION_R * s;
      if (VW * s >= w) tx = Math.min(0, Math.max(w - VW * s, tx));
      const ty = (h - VH * s) / 2;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#050506";
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.translate(tx, ty);
      ctx.scale(s, s);
      ctx.beginPath();
      ctx.rect(0, 0, VW, VH);
      ctx.clip();
      renderFrame(ctx, t, noiseTile, frame);
      ctx.restore();

      // The stage sits slightly lighter than the fill around it, so a hard
      // letterbox edge shows as a seam. Feather the stage into the fill.
      const bar = (x0, y0, x1, y1, bw, bh) => {
        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        g.addColorStop(0, "#050506");
        g.addColorStop(1, "rgba(5,5,6,0)");
        ctx.fillStyle = g;
        ctx.fillRect(Math.min(x0, x0 + bw), Math.min(y0, y0 + bh), Math.abs(bw), Math.abs(bh));
      };
      if (ty > 0.5) {
        const f = Math.min(90, VH * s * 0.14);
        bar(0, ty, 0, ty + f, w, f);
        bar(0, h - ty, 0, h - ty - f, w, -f);
      }
      const right = tx + VW * s;
      if (tx > 0.5) {
        const f = Math.min(90, VW * s * 0.1);
        bar(tx, 0, tx + f, 0, f, h);
      }
      if (right < w - 0.5) {
        const f = Math.min(90, VW * s * 0.1);
        bar(right, 0, right - f, 0, -f, h);
      }
    };

    if (reduced) {
      t = 13.2;                 // hold the title card
      paint();
      const ro = new ResizeObserver(paint);
      ro.observe(wrap);
      return () => { ro.disconnect(); };
    }

    // The loop only runs while the reel is on screen, and stops outright when
    // it's scrolled past or mounted under a display:none layout on phones, so
    // it costs nothing when nobody can see it. Background tabs need no check:
    // the browser already stops rAF there, and dt is clamped on resume.
    const loop = (now) => {
      raf = 0;
      if (dead || paused || !inView) return;
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      t = (t + dt) % DUR;
      frame++;
      paint();
      raf = requestAnimationFrame(loop);
    };
    const run = () => {
      if (raf || dead || paused || !inView) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    paint();                    // first frame, so a paused mount still shows something

    const io = new IntersectionObserver(
      ([e]) => { inView = e.isIntersecting; run(); },
      { threshold: 0.01 }
    );
    io.observe(wrap);

    const ro = new ResizeObserver(() => paint());
    ro.observe(wrap);

    // fonts land asynchronously; repaint once they do
    document.fonts?.ready?.then(() => { if (!dead) paint(); });

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [startAt, paused, safeLeft]);

  return (
    <div ref={wrapRef} className={`overflow-hidden bg-[#050506] ${className}`}>
      <canvas ref={canvasRef} className="block w-full h-full" aria-hidden="true" />
    </div>
  );
}

export default HeroShowreel;
