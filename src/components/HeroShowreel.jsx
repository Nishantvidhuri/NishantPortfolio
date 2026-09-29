import React, { useEffect, useRef } from "react";
import { DUR, SPEED, VW, VH, renderFrame, makeNoise } from "./showreel/renderShowreel";
import {
  audioNow,
  getScore,
  holdShowreelAudio,
  releaseShowreelAudio,
  showreelAudioContext,
} from "./showreel/showreelAudio";

/* ============================================================================
   HERO SHOWREEL — plays the showreel renderer live behind the hero, once,
   then rests on its end card. Owns sizing, the cover/narrow fit,
   reduced-motion, pausing offscreen, and the soundtrack. With sound on, the
   soundtrack is the clock: the picture reads its time from what's reaching
   the speakers, so the two can't drift.
   ============================================================================ */

const clampT = (t) => Math.min(DUR, Math.max(0, t));

/**
 * safeLeft: CSS px on the left kept clear for copy laid over the reel. The
 * action is fitted into the space to its right — full cover where there's
 * room, scaled down a little where the copy takes a big share of the width.
 *
 * sound: play the soundtrack. Turn it on from a click handler that first
 * calls unlockShowreelAudio(), since browsers only start audio on a gesture.
 *
 * onEnded: called once the reel reaches its end card. replayKey: change it
 * to play again from startAt.
 */
function HeroShowreel({ className = "", startAt = 0, paused = false, safeLeft = 0, sound = false, onEnded, replayKey = 0 }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const tRef = useRef(clampT(startAt));     // the reel's clock (timeline time), kept across effect re-runs
  const startRef = useRef(startAt);
  const replayRef = useRef(replayKey);
  const endedRef = useRef(false);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;
  const soundRef = useRef(null);            // { ac, now() } while the soundtrack is on
  const liveRef = useRef(false);            // whether the picture is playing right now

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const noiseTile = makeNoise();
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    // only a new startAt or a replay moves the clock; pausing or resizing keeps its place
    if (startRef.current !== startAt || replayRef.current !== replayKey) {
      tRef.current = clampT(startAt);
      startRef.current = startAt;
      replayRef.current = replayKey;
      endedRef.current = false;
    }
    let raf = 0;
    let t = tRef.current;
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
      t = DUR;                  // just the end card
      paint();
      const ro = new ResizeObserver(paint);
      ro.observe(wrap);
      return () => { ro.disconnect(); };
    }

    // Sound plays only while the picture does: scrolled past, paused, or in a
    // background tab, the soundtrack's clock is suspended along with it.
    const audible = (on) => {
      liveRef.current = on;
      const snd = soundRef.current;
      if (!snd) return;
      if (on && snd.ac.state === "suspended") snd.ac.resume().catch(() => {});
      if (!on && snd.ac.state === "running") snd.ac.suspend().catch(() => {});
    };

    // The loop only runs while the reel is on screen, and stops outright when
    // it's scrolled past or mounted under a display:none layout on phones, so
    // it costs nothing when nobody can see it.
    const finish = () => {
      if (endedRef.current) return;
      endedRef.current = true;
      onEndedRef.current?.();
    };
    const loop = (now) => {
      raf = 0;
      if (dead || paused || !inView) { audible(false); return; }
      const snd = soundRef.current;
      if (snd?.now && snd.ac.state === "running") t = snd.now();      // the soundtrack is the clock
      else t = clampT(t + Math.min((now - last) / 1000, 1 / 20) * SPEED);
      last = now;
      tRef.current = t;
      frame++;
      paint();
      // at rest on the end card there's nothing left to animate, so the loop
      // stops; the sound, if any, still rings out over it
      if (t >= DUR) { finish(); return; }
      raf = requestAnimationFrame(loop);
    };
    const run = () => {
      const showing = !dead && !paused && inView;
      // Only the sound follows document.hidden. The picture doesn't need to:
      // rAF already stops in a background tab, and some hosts report a
      // visible page as hidden, which would freeze the reel.
      audible(showing && !document.hidden);
      if (!showing || raf || t >= DUR) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    paint();                    // first frame, so a paused or finished reel still shows something
    if (t >= DUR) finish();
    run();

    // rAF already stops in a background tab, but audio doesn't
    document.addEventListener("visibilitychange", run);

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
      document.removeEventListener("visibilitychange", run);
      io.disconnect();
      ro.disconnect();
    };
  }, [startAt, paused, safeLeft, replayKey]);

  // The soundtrack: one pre-rendered buffer, started at the picture's current
  // time and then used as the picture's clock.
  useEffect(() => {
    if (!sound) return;
    const ac = showreelAudioContext();
    if (!ac) return;
    holdShowreelAudio();
    const snd = { ac, now: null };
    soundRef.current = snd;
    let dead = false;
    let score = null;
    let src = null;
    let gain = null;

    // starts only once the browser has actually let the context run
    const begin = () => {
      if (dead || src || !score || ac.state !== "running") return;
      gain = ac.createGain();
      gain.gain.setValueAtTime(0, ac.currentTime);
      gain.gain.linearRampToValueAtTime(1, ac.currentTime + 0.35);
      gain.connect(ac.destination);
      src = ac.createBufferSource();
      src.buffer = score;
      src.connect(gain);
      // begin where the picture will be when this sound reaches the ears. The
      // buffer runs in real seconds; the picture in timeline time.
      const lead = 0.05;
      const latency = Math.max(0, ac.currentTime - audioNow(ac));
      const offset = tRef.current / SPEED + lead + latency;
      const startTime = ac.currentTime + lead;
      src.start(startTime, Math.min(offset, score.duration));
      const base = startTime - offset;
      snd.now = () => clampT((audioNow(ac) - base) * SPEED);
      if (!liveRef.current) ac.suspend().catch(() => {});
    };
    ac.addEventListener("statechange", begin);
    getScore().then((buf) => { score = buf; begin(); }, () => {});

    return () => {
      dead = true;
      ac.removeEventListener("statechange", begin);
      if (soundRef.current === snd) soundRef.current = null;
      if (src && gain) {
        const now = ac.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.18);
        src.stop(now + 0.2);
        src.onended = () => { src.disconnect(); gain.disconnect(); };
      }
      releaseShowreelAudio();
    };
  }, [sound, replayKey]);

  return (
    <div ref={wrapRef} className={`overflow-hidden bg-[#050506] ${className}`}>
      <canvas ref={canvasRef} className="block w-full h-full" aria-hidden="true" />
    </div>
  );
}

export default HeroShowreel;
