import React, { useEffect, useState } from "react";
import { useProjects } from "../context/ProjectContext"; // Import the context hook
import { useNavigate } from 'react-router-dom';
import HeroShowreel from "./HeroShowreel";
import { getScore, unlockShowreelAudio } from "./showreel/showreelAudio";

function FirstSectionHome() {
  const { projects } = useProjects();
  const [randomIndex, setRandomIndex] = useState(0);
  const navigate = useNavigate();

  // The showreel autoplays muted; sound is opt-in, like Netflix's billboard trailer
  const [sound, setSound] = useState(false);
  const toggleSound = () => {
    if (!sound) unlockShowreelAudio();   // browsers only start audio inside a click
    setSound((on) => !on);
  };
  const warmSound = () => { getScore().catch(() => {}); };   // render the score before the click lands

  // It plays once and rests on its end card. Then, as on Netflix's billboard,
  // the same button becomes Replay, keeping whatever sound setting you had.
  const [ended, setEnded] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const onBillboardButton = () => {
    if (!ended) { toggleSound(); return; }
    if (sound) unlockShowreelAudio();
    setEnded(false);
    setReplayKey((k) => k + 1);
  };

  useEffect(() => {
    if (projects.length > 0) {
      const randomNumber = Math.floor(Math.random() * 4);
      setRandomIndex(randomNumber);
    }
  }, [projects.length]);

  const handleNavigation = (path) => {
    if (path === 'resume') {
      // Open resume in new tab
      window.open("https://drive.google.com/file/d/1mYm-u_piUtMuNP4_kEem3QelcAqDZB4I/view?usp=sharing", "_blank");
    } else {
      // Navigate to internal routes
      navigate(`/${path}`);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="text-white text-center p-10">Loading projects...</div>
    );
  }

  return (
    <div className="w-full relative text-white overflow-hidden">
      {/* PC/Laptop View */}
      <div className="hidden sm:flex flex-col justify-end p-4 w-full h-screen relative">
        {/* The showreel plays behind the billboard, like a title's trailer on Netflix */}
        {/* safeLeft: p-4 + md:ml-[40px] + the 500px text column, plus air */}
        <HeroShowreel className="absolute inset-0 w-full h-full" safeLeft={580} sound={sound} onEnded={() => setEnded(true)} replayKey={replayKey} />
        {/* Legibility scrim behind the copy. No blur, so the reel stays sharp. */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/10 to-transparent pointer-events-none"></div>
        {/* Netflix billboard fade into the rows below */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent pointer-events-none"></div>

        {/* Content, with Netflix's mute button level with the buttons (clear of the chat bubble's corner) */}
        <div className="relative z-10 flex items-end justify-between gap-6 mb-10 sm:mb-20 md:mb-[125px] ml-2 sm:ml-4 md:ml-[40px] mr-16 md:mr-[104px] translate-y-6 sm:translate-y-10 md:translate-y-20">
          <div>
            {/* Logo */}
            <img
              src={projects[randomIndex].logo} // ✅ Fix Here
              alt={`${projects[randomIndex].name} Logo`}
              className="w-28 sm:w-36 md:w-60 h-20 sm:h-28 md:h-40 mb-4  object-contain"
            />

            {/* N FEATURED PROJECT tag */}
            <div className="flex items-center gap-2 pt-3 sm:pt-5 md:pt-8">
              <span className="font-['Bebas_Neue'] text-[#e50914] text-2xl md:text-3xl leading-none">N</span>
              <span className="text-gray-300 text-[10px] md:text-xs tracking-[0.4em] font-semibold">FEATURED PROJECT</span>
            </div>

            {/* Project Name */}
            <h2 className="w-full max-w-[500px] pb-1 font-['Bebas_Neue'] tracking-wide text-3xl sm:text-4xl md:text-6xl drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
              {projects[randomIndex].name}
            </h2>

            {/* Netflix metadata row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pb-2 text-sm md:text-base">
              <span className="text-[#46d369] font-semibold">98% Match</span>
              <span className="text-gray-400">2026</span>
              <span className="border border-gray-500 text-gray-300 text-[10px] px-1.5 rounded-sm leading-4">HD</span>
              {projects[randomIndex].genre && (
                <span className="text-gray-300">{projects[randomIndex].genre}</span>
              )}
            </div>

            {/* Project Summary */}
            <h2 className="w-full max-w-[500px] pb-4 sm:pb-6 md:pb-10 font-jakarta text-sm sm:text-base md:text-lg">
              {projects[randomIndex].summary}
            </h2>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <a
                href={projects[randomIndex].livelink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center  gap-2 bg-white text-black font-semibold  px-3 sm:px-4 py-2 sm:py-3 rounded transition"
              >
                <div className="w-4 sm:w-5 h-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    role="img"
                    viewBox="0 0 24 24"
                    width="24"
                    height="18"
                    aria-hidden="true"
                    className="text-black"
                  >
                    <path
                      d="M5 2.69127C5 1.93067 5.81547 1.44851 6.48192 1.81506L23.4069 11.1238C24.0977 11.5037 24.0977 12.4963 23.4069 12.8762L6.48192 22.1849C5.81546 22.5515 5 22.0693 5 21.3087V2.69127Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </div>
                <span className="text-sm text-black sm:text-md">Live Demo</span>
              </a>

              <a
                href={projects[randomIndex].githublink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#716A63] text-white font-semibold w-28 sm:w-32 md:w-40 justify-center h-10 sm:h-12 opacity-60 rounded transition hover:opacity-50"
              >
                <div className="w-6 sm:w-7 h-5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    role="img"
                    viewBox="0 0 24 24"
                    width="24"
                    height="22"
                    aria-hidden="true"
                    className="text-white"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12ZM13 10V18H11V10H13ZM12 8.5C12.8284 8.5 13.5 7.82843 13.5 7C13.5 6.17157 12.8284 5.5 12 5.5C11.1716 5.5 10.5 6.17157 10.5 7C10.5 7.82843 11.1716 8.5 12 8.5Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </div>
                <span className="text-sm sm:text-lg">GitHub</span>
              </a>
            </div>
          </div>

          <button
            onClick={onBillboardButton}
            onPointerEnter={warmSound}
            onFocus={warmSound}
            aria-label={ended ? "Replay the showreel" : sound ? "Mute the showreel" : "Play the showreel with sound"}
            aria-pressed={ended ? undefined : sound}
            title={ended ? "Replay" : sound ? "Mute" : "Sound on"}
            className="shrink-0 w-12 h-12 rounded-full border border-white/70 bg-black/20 text-white flex items-center justify-center hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
          >
            {ended ? (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
                <path d="M5.5 12a6.5 6.5 0 1 0 2.1-4.8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                <path d="M7.9 3.8v3.9H4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : sound ? (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
                <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" />
                <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
                <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" />
                <path d="M15.5 9.5l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile View */}
      <div className="flex sm:hidden flex-col items-center justify-end w-full min-h-[560px] px-4 pt-24 pb-8 bg-[#141414] relative">
        {/* Background Image */}
        <div
          className="absolute  inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${projects[randomIndex].imageMob})`, // ✅ Fix Here
          }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[3px]"></div>
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#141414] to-transparent"></div>
        </div>

        {/* Navigation Buttons */}
        <div className="absolute top-16 inset-x-0 px-4 flex gap-2 text-sm">
          <button
            onClick={() => handleNavigation('projects')}
            className="flex-1 py-1.5 border rounded-full border-gray-300/70 text-gray-200 active:bg-white/10 transition-colors"
          >
            Projects
          </button>
          <button
            onClick={() => handleNavigation('about')}
            className="flex-1 py-1.5 border rounded-full border-gray-300/70 text-gray-200 active:bg-white/10 transition-colors"
          >
            About Me
          </button>
          <button
            onClick={() => handleNavigation('resume')}
            className="flex-1 py-1.5 border rounded-full border-gray-300/70 text-gray-200 active:bg-white/10 transition-colors"
          >
            Resume
          </button>
        </div>

        {/* Project Content — natural flow so nothing can overlap */}
        <div className="relative z-10 w-full flex flex-col items-center text-center gap-3">
          {/* Project Logo */}
          <img
            src={projects[randomIndex].logo} // ✅ Fix Here
            alt={`${projects[randomIndex].name} Logo`}
            className="w-40 max-h-28 object-contain"
          />

          {/* Project Name */}
          <h2 className="text-4xl font-['Bebas_Neue'] tracking-wide leading-none text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
            {projects[randomIndex].name}
          </h2>

          <div className="text-xs text-white flex items-center justify-center gap-2 flex-wrap px-2">
            <span className="text-[#46d369] font-semibold">98% Match</span>
            <span className="text-gray-400">2026</span>
            <span className="text-gray-300">{projects[randomIndex].genre}</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 w-full justify-center pt-1">
            <a
              href={projects[randomIndex].livelink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white text-black font-semibold flex-1 max-w-[150px] justify-center px-3 py-2.5 rounded transition"
            >
              <div className="w-4 sm:w-5 h-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  role="img"
                  viewBox="0 0 24 24"
                  width="24"
                  height="18"
                  aria-hidden="true"
                  className="text-black"
                >
                  <path
                    d="M5 2.69127C5 1.93067 5.81547 1.44851 6.48192 1.81506L23.4069 11.1238C24.0977 11.5037 24.0977 12.4963 23.4069 12.8762L6.48192 22.1849C5.81546 22.5515 5 22.0693 5 21.3087V2.69127Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
              <span className="text-sm text-black">Live Demo</span>
            </a>

            <a
              href={projects[randomIndex].githublink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[rgba(109,109,110,0.7)] text-white font-semibold flex-1 max-w-[150px] justify-center py-2.5 rounded transition active:bg-[rgba(109,109,110,0.4)]"
            >
              <div className="w-6 sm:w-7 h-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  role="img"
                  viewBox="0 0 24 24"
                  width="24"
                  height="22"
                  aria-hidden="true"
                  className="text-white"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12ZM13 10V18H11V10H13ZM12 8.5C12.8284 8.5 13.5 7.82843 13.5 7C13.5 6.17157 12.8284 5.5 12 5.5C11.1716 5.5 10.5 6.17157 10.5 7C10.5 7.82843 11.1716 8.5 12 8.5Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>

              <span className="text-sm">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FirstSectionHome;
