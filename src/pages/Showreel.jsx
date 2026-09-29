import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import HeroShowreel from "../components/HeroShowreel";
import { HOLD, RUNTIME } from "../components/showreel/renderShowreel";
import { pickVideoFormat, recordShowreel } from "../components/showreel/exportShowreel";
import { getScore, unlockShowreelAudio } from "../components/showreel/showreelAudio";

/**
 * Preview stage for the hero showreel. Shows the loop full-bleed, with an
 * optional overlay of the real hero copy so the composition can be judged
 * the way it will actually be seen.
 */
function Showreel() {
  // ?t=4.2 jumps to a timecode, ?paused=1 freezes it — handy for reviewing frames.
  // Read from the location so the URL stays the source of truth as it changes.
  const { search } = useLocation();
  const q = new URLSearchParams(search);
  const startAt = Number(q.get("t")) || 0;
  const urlPaused = q.get("paused") === "1";
  const urlOverlay = q.get("overlay") !== "0";
  const [overlay, setOverlay] = useState(urlOverlay);
  const [paused, setPaused] = useState(urlPaused);
  useEffect(() => { setPaused(urlPaused); setOverlay(urlOverlay); }, [urlPaused, urlOverlay]);

  // Sound starts muted, like any autoplaying video; a click turns it on.
  const [sound, setSound] = useState(false);
  // It plays once and rests on the end card; Replay runs it again.
  const [ended, setEnded] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const replay = () => { setEnded(false); setReplayKey((k) => k + 1); };
  const toggleSound = () => {
    if (!sound) unlockShowreelAudio();        // must happen inside the click
    setSound((on) => !on);
  };

  // Export: records one loop, with its soundtrack, at 1920x1080 and downloads it.
  const format = useMemo(() => pickVideoFormat(true), []);
  const [rec, setRec] = useState(null);       // null, or { p: 0..1 } while recording
  const [note, setNote] = useState("");

  const exportVideo = async () => {
    if (rec) return;
    const wasPaused = paused;
    setNote("");
    setPaused(true);                          // give the recorder the whole frame budget
    setRec({ p: 0 });
    try {
      const { blob, ext, wasHidden } = await recordShowreel({ onProgress: (p) => setRec({ p }) });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nishant-showreel-1080p.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      if (wasHidden) {
        setNote("This tab was hidden while recording, so frames were dropped. Keep it in front and export again for a smooth file.");
      }
    } catch (e) {
      setNote(e?.message || "Recording failed.");
    } finally {
      setRec(null);
      setPaused(wasPaused);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-[#050506] overflow-hidden">
      <HeroShowreel className="absolute inset-0 w-full h-full" paused={paused} startAt={startAt} sound={sound} onEnded={() => setEnded(true)} replayKey={replayKey} />

      {overlay && (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-6 sm:p-10 md:pl-[40px] md:pb-[120px]">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            Nishant Vidhuri
          </h1>
          <p className="mt-3 max-w-md text-sm sm:text-base text-gray-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Full-stack engineer building multi-tenant SaaS, async pipelines and
            interfaces that ship.
          </p>
          <div className="mt-5 flex gap-3">
            <span className="bg-white text-black px-5 py-2 rounded font-semibold text-sm">▶ Play</span>
            <span className="bg-gray-500/60 text-white px-5 py-2 rounded font-semibold text-sm">More Info</span>
          </div>
        </div>
      )}

      <div className="absolute top-4 left-4 right-4 flex flex-wrap justify-end gap-2 text-xs">
        <button
          onClick={() => setPaused((p) => !p)}
          className="bg-black/70 border border-white/20 text-white px-3 py-1.5 rounded hover:bg-black"
        >
          {paused ? "Play" : "Pause"}
        </button>
        {ended && (
          <button
            onClick={replay}
            className="bg-black/70 border border-white/20 text-white px-3 py-1.5 rounded hover:bg-black"
          >
            Replay
          </button>
        )}
        <button
          onClick={toggleSound}
          onPointerEnter={() => getScore().catch(() => {})}
          aria-pressed={sound}
          className="bg-black/70 border border-white/20 text-white px-3 py-1.5 rounded hover:bg-black"
        >
          {sound ? "Sound off" : "Sound on"}
        </button>
        <button
          onClick={() => setOverlay((o) => !o)}
          className="bg-black/70 border border-white/20 text-white px-3 py-1.5 rounded hover:bg-black"
        >
          {overlay ? "Hide hero copy" : "Show hero copy"}
        </button>
        <button
          onClick={exportVideo}
          disabled={!format || !!rec}
          title={format ? `Records the ${RUNTIME}s reel plus ${HOLD}s on the end card, at 1920×1080 with sound (${format.ext.toUpperCase()})` : "This browser can't record canvas video"}
          className="bg-black/70 border border-white/20 text-white px-3 py-1.5 rounded hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {rec ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#e50914] animate-pulse" />
              Recording {Math.floor(rec.p * (RUNTIME + HOLD))}s / {RUNTIME + HOLD}s
            </>
          ) : (
            "Export video"
          )}
        </button>
        <Link
          to="/explorer"
          className="bg-[#e50914] text-white px-3 py-1.5 rounded hover:bg-[#f6121d]"
        >
          Back
        </Link>
      </div>

      {(rec || note) && (
        <div className="absolute top-16 right-4 max-w-xs text-xs leading-relaxed bg-black/85 border border-white/15 text-gray-200 px-3 py-2 rounded">
          {rec ? "Recording picture and sound in real time. Keep this tab in front until the file downloads." : note}
        </div>
      )}
    </div>
  );
}

export default Showreel;
