import React, { useEffect, useRef } from "react";
import { DUR, VW, VH, AX, renderFrame, makeNoise } from "./showreel/renderShowreel";

/* ============================================================================
   HERO SHOWREEL — plays the showreel renderer live behind the hero.
   Owns sizing, the cover/narrow fit, reduced-motion, and pausing offscreen.
   ============================================================================ */

function HeroShowreel({ className = "", startAt = 0, paused = false }) {
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
    let last = performance.now();
    let frame = 0;
    let visible = true;
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
     * Cover-fit the 1920x1080 stage, except on narrow viewports: pure cover on
     * a phone would crop to a ~675px slice of the stage and cut the type in
     * half. So the scale is also capped so at least MIN_VISIBLE_W of the stage
     * is always across the frame, and the leftover top/bottom is filled with
     * the same near-black the composition already vignettes to — invisible.
     * The crop is centred on the action (AX), not on the stage centre.
     */
    const MIN_VISIBLE_W = 1560;
    const ACTION_CX = AX;
    const paint = () => {
      const { w, h } = fit();
      const s = Math.min(Math.max(w / VW, h / VH), w / MIN_VISIBLE_W);
      let tx;
      if (VW * s <= w) tx = (w - VW * s) / 2;
      else tx = Math.min(0, Math.max(w - VW * s, w / 2 - ACTION_CX * s));
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#050506";
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.translate(tx, (h - VH * s) / 2);
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
      const top = (h - VH * s) / 2;
      if (top > 0.5) {
        const f = Math.min(90, VH * s * 0.14);
        bar(0, top, 0, top + f, w, f);
        bar(0, h - top, 0, h - top - f, w, -f);
      }
      if (tx > 0.5) {
        const f = Math.min(90, VW * s * 0.1);
        bar(tx, 0, tx + f, 0, f, h);
        bar(w - tx, 0, w - tx - f, 0, -f, h);
      }
    };

    if (reduced) {
      t = 13.2;                 // hold the title card
      paint();
      const ro = new ResizeObserver(paint);
      ro.observe(wrap);
      return () => { ro.disconnect(); };
    }

    const loop = (now) => {
      if (dead) return;
      raf = requestAnimationFrame(loop);
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      if (paused || !visible) return;
      t = (t + dt) % DUR;
      frame++;
      paint();
    };
    paint();                    // first frame, so a paused mount still shows something
    raf = requestAnimationFrame(loop);

    const onVis = () => { visible = !document.hidden; last = performance.now(); };
    document.addEventListener("visibilitychange", onVis);

    const io = new IntersectionObserver(
      ([e]) => { visible = e.isIntersecting && !document.hidden; last = performance.now(); },
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
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
      ro.disconnect();
    };
  }, [startAt, paused]);

  return (
    <div ref={wrapRef} className={`relative overflow-hidden bg-[#050506] ${className}`}>
      <canvas ref={canvasRef} className="block w-full h-full" aria-hidden="true" />
    </div>
  );
}

export default HeroShowreel;
