import { DUR, HOLD, RUNTIME, SPEED, VW, VH, renderFrame, makeNoise } from "./renderShowreel";
import { getScore } from "./showreelAudio";

/* ============================================================================
   Export — records the reel once, picture and sound, ending on a few seconds
   of the end card while the tudum rings out.

   Each captured frame is rendered at t = n / fps and pushed to the encoder
   with requestFrame(), so frame content is exact even if the page stutters.
   The soundtrack is the same pre-rendered loop the live player uses, started
   on the same clock as frame 0. MediaRecorder encodes in real time, so the
   tab must stay in front for the whole loop. H.264/AAC MP4 is preferred
   (QuickTime, Safari, <video> everywhere); WebM is the fallback.
   ============================================================================ */
const FORMATS_AV = [
  ["video/mp4;codecs=avc1.640028,mp4a.40.2", "mp4"],
  ["video/mp4;codecs=avc1,mp4a.40.2", "mp4"],
  ["video/mp4;codecs=avc1,opus", "mp4"],
  ["video/mp4", "mp4"],
  ["video/webm;codecs=vp9,opus", "webm"],
  ["video/webm;codecs=vp8,opus", "webm"],
  ["video/webm", "webm"],
];
const FORMATS_V = [
  ["video/mp4;codecs=avc1.640028", "mp4"],
  ["video/mp4;codecs=avc1.4d0028", "mp4"],
  ["video/mp4;codecs=avc1", "mp4"],
  ["video/mp4", "mp4"],
  ["video/webm;codecs=vp9", "webm"],
  ["video/webm;codecs=vp8", "webm"],
  ["video/webm", "webm"],
];

export const pickVideoFormat = (withSound = true) => {
  if (typeof MediaRecorder === "undefined") return null;
  if (typeof HTMLCanvasElement === "undefined" || !("captureStream" in HTMLCanvasElement.prototype)) return null;
  for (const [mime, ext] of withSound ? FORMATS_AV : FORMATS_V) {
    if (MediaRecorder.isTypeSupported(mime)) return { mime, ext };
  }
  return null;
};

export async function recordShowreel({ fps = 24, bitrate = 12_000_000, withSound = true, onProgress } = {}) {
  // A context of its own, created before the first await so it's still inside
  // the click that started the export. It's silent: the sound goes only into
  // the file, and it can't be paused by the preview player's context.
  const AC = window.AudioContext || window.webkitAudioContext;
  let ac = null;
  if (withSound && AC) {
    ac = new AC();
    ac.resume().catch(() => {});
  }
  const format = pickVideoFormat(!!ac);
  if (!format) {
    ac?.close();
    throw new Error("This browser can't record canvas video. Try Chrome or Safari.");
  }
  const score = ac ? await getScore() : null;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = VW;
    canvas.height = VH;
    const ctx = canvas.getContext("2d", { alpha: false });
    const noise = makeNoise();
    const total = Math.round((RUNTIME + HOLD) * fps);

    // Manual pushes keep each frame exact; fall back to a fixed-rate stream
    // where requestFrame() isn't implemented.
    let vstream = canvas.captureStream(0);
    let track = vstream.getVideoTracks()[0];
    const manual = typeof track?.requestFrame === "function";
    if (!manual) {
      track?.stop();
      vstream = canvas.captureStream(fps);
      track = vstream.getVideoTracks()[0];
    }

    let src = null;
    const tracks = [track];
    if (score) {
      const dest = ac.createMediaStreamDestination();
      src = ac.createBufferSource();
      src.buffer = score;
      src.connect(dest);
      tracks.push(dest.stream.getAudioTracks()[0]);
    }
    const stream = new MediaStream(tracks);

    const chunks = [];
    const rec = new MediaRecorder(stream, { mimeType: format.mime, videoBitsPerSecond: bitrate, audioBitsPerSecond: 192_000 });
    rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };

    let raf = 0;
    let stopTimer = 0;
    let last = 0;
    let t0 = 0;
    let wasHidden = document.hidden;
    const onVis = () => { if (document.hidden) wasHidden = true; };
    document.addEventListener("visibilitychange", onVis);

    const draw = (n) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      renderFrame(ctx, Math.min((n / fps) * SPEED, DUR), noise, n);
      if (manual) track.requestFrame();
    };
    const stop = () => { if (rec.state !== "inactive") rec.stop(); };
    const tick = (now) => {
      const n = Math.floor(((now - t0) / 1000) * fps);
      if (n > last && n < total) {
        last = n;
        draw(n);
        onProgress?.(n / total);
      }
      // stop a tick after the final push, never in the same one: requestFrame()
      // hands the frame over asynchronously, so stopping immediately drops it
      if (n >= total) { stop(); return; }
      raf = requestAnimationFrame(tick);
    };

    const cleanup = () => {
      cancelAnimationFrame(raf);
      clearTimeout(stopTimer);
      document.removeEventListener("visibilitychange", onVis);
      stream.getTracks().forEach((tr) => tr.stop());
      try { src?.stop(); } catch { /* never started */ }
      ac?.close();
    };
    rec.onstop = () => {
      cleanup();
      onProgress?.(1);
      resolve({ blob: new Blob(chunks, { type: format.mime.split(";")[0] }), ...format, withSound: !!score, wasHidden });
    };
    rec.onerror = (e) => { cleanup(); reject(e.error || new Error("Recording failed.")); };

    rec.start(250);
    t0 = performance.now();
    src?.start(ac.currentTime);
    draw(0);
    raf = requestAnimationFrame(tick);
    // Fallback for a throttled tab where rAF stalls: land the last frame (the
    // end card) and stop on a later task so that frame still makes it in.
    stopTimer = setTimeout(() => {
      if (rec.state === "inactive") return;
      if (last < total - 1) { last = total - 1; draw(total - 1); }
      stopTimer = setTimeout(stop, 100);
    }, (RUNTIME + HOLD) * 1000 + 250);
  });
}
