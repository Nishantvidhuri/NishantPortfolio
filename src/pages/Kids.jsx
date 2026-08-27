import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import CubeRunner from '../components/games/CubeRunner';
import StackTower from '../components/games/StackTower';
import FlappyBlock from '../components/games/FlappyBlock';
import OrbHunt from '../components/games/OrbHunt';
import PongGame from '../components/games/PongGame';
import BrickBreaker from '../components/games/BrickBreaker';
import StarBlaster from '../components/games/StarBlaster';
import SkyHopper from '../components/games/SkyHopper';
import DinoDash from '../components/games/DinoDash';
import TapTiles from '../components/games/TapTiles';
import { FaPlay, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const NEW_GAMES = [
  // — 3D showcase —
  { id: 'cube-runner', title: 'Cube Runner 3D', emoji: '🚀', tagline: 'Dodge blocks at warp speed', gradient: 'from-red-600 via-orange-500 to-yellow-400', badge: '3D', category: '3d', component: CubeRunner },
  { id: 'stack-tower', title: 'Stack Tower 3D', emoji: '🏗️', tagline: 'Stack blocks sky-high', gradient: 'from-blue-600 via-cyan-500 to-teal-400', badge: '3D', category: '3d', component: StackTower },
  { id: 'orb-hunt', title: 'Orb Hunt 3D', emoji: '🔮', tagline: 'Roll & grab orbs against the clock', gradient: 'from-indigo-600 via-violet-500 to-purple-400', badge: '3D', category: '3d', component: OrbHunt },
  // — Arcade —
  { id: 'flappy-block', title: 'Flappy Block', emoji: '🐦', tagline: 'Fly between the pipes', gradient: 'from-purple-600 via-fuchsia-500 to-pink-400', badge: 'NEW', category: 'arcade', component: FlappyBlock },
  { id: 'dino-dash', title: 'Dino Dash', emoji: '🦖', tagline: 'Jump the cacti, go far', gradient: 'from-amber-600 via-orange-500 to-red-400', badge: 'NEW', category: 'arcade', component: DinoDash },
  { id: 'sky-hopper', title: 'Sky Hopper', emoji: '🪂', tagline: 'Bounce your way to space', gradient: 'from-sky-600 via-blue-500 to-indigo-400', badge: 'NEW', category: 'arcade', component: SkyHopper },
  { id: 'star-blaster', title: 'Star Blaster', emoji: '🛸', tagline: 'Blast the space rocks', gradient: 'from-slate-700 via-purple-600 to-fuchsia-500', badge: 'NEW', category: 'arcade', component: StarBlaster },
  { id: 'brick-breaker', title: 'Brick Breaker', emoji: '🧱', tagline: 'Smash every brick', gradient: 'from-rose-600 via-red-500 to-orange-400', badge: 'NEW', category: 'arcade', component: BrickBreaker },
  { id: 'pong', title: 'Pong', emoji: '🏓', tagline: 'Beat the computer to 5', gradient: 'from-emerald-600 via-teal-500 to-cyan-400', badge: 'NEW', category: 'arcade', component: PongGame },
  { id: 'tap-tiles', title: 'Tap Tiles', emoji: '🎹', tagline: 'Tap the red tiles fast', gradient: 'from-zinc-700 via-neutral-600 to-stone-500', badge: 'NEW', category: 'arcade', component: TapTiles },
];


const Chevron = ({ flip }) => (
  <svg
    viewBox="0 0 36 36"
    width="32"
    height="32"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    role="img"
    className={`${flip ? "rotate-180 " : ""}drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] transition-transform duration-200 group-hover/arrow:scale-125`}
  >
    <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M23.586 18 12.293 29.293l1.414 1.414 12-12a1 1 0 0 0 0-1.414l-12-12-1.414 1.414z"></path>
  </svg>
);

function Kids() {
  const [activeGame, setActiveGame] = useState(null);
  const rowRef = useRef(null);
  const [showArrows, setShowArrows] = useState(false);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = () => {
    const el = rowRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 5);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  };

  const scrollRow = (dir) => {
    const amount = window.innerWidth <= 640 ? 320 : 640;
    rowRef.current?.scrollBy({ left: dir * amount, behavior: 'smooth' });
    setTimeout(updateArrows, 420);
  };

  useEffect(() => {
    updateArrows();
    const t = setTimeout(updateArrows, 400);
    const el = rowRef.current;
    el?.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);
    return () => {
      clearTimeout(t);
      el?.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, []);

  useEffect(() => {
    document.title = "Nishant | Kids Games";
  }, []);

  // Lock scroll while a game modal is open
  useEffect(() => {
    document.body.style.overflow = activeGame ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeGame]);

  const ActiveGameComponent = activeGame?.component;

  return (
    <div className='relative overflow-x-hidden bg-[#141414]'>
      <Navbar />

      {/* Hero Section — featured game billboard */}
      <div className="relative h-screen w-full">
        {/* Hero Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500">
          {/* Floating game emojis */}
          <div className="absolute inset-0 overflow-hidden opacity-30">
            {['🚀', '🎮', '🏗️', '🐦', '🎨', '🕹️', '⭐', '🧩', '🏆'].map((e, i) => (
              <motion.span
                key={i}
                className="absolute text-5xl md:text-7xl select-none"
                style={{ left: `${(i * 11 + 4) % 92}%`, top: `${(i * 23 + 8) % 80}%` }}
                animate={{ y: [0, -22, 0], rotate: [0, i % 2 ? 12 : -12, 0] }}
                transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.4 }}
              >
                {e}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/90 via-transparent to-transparent"></div>

        {/* Hero Content */}
        <div className="absolute bottom-1/4 left-0 px-4 md:px-16 space-y-4 w-full md:w-2/3">
          <div className="flex items-center gap-2">
            <span className="font-['Bebas_Neue'] text-[#e50914] text-3xl leading-none drop-shadow">N</span>
            <span className="text-white/90 text-xs md:text-sm tracking-[0.4em] font-semibold drop-shadow">KIDS ARCADE</span>
          </div>
          <h1 className="font-['Bebas_Neue'] text-6xl md:text-8xl text-white leading-[0.9] tracking-wide drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
            Cube Runner 3D
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm md:text-base">
            <span className="text-green-300 font-semibold drop-shadow">100% Fun</span>
            <span className="text-white/80">2026</span>
            <span className="border border-white/60 text-white text-[10px] px-1.5 rounded-sm leading-4">3D</span>
            <span className="text-white/90">Built with Three.js</span>
          </div>
          <p className="text-lg md:text-2xl text-white/90 drop-shadow max-w-xl">
            Blast through a neon world and dodge the blocks. How far can you run?
          </p>
          <div className="flex space-x-4 pt-2">
            <button
              onClick={() => setActiveGame(NEW_GAMES[0])}
              className="flex items-center px-8 py-3 bg-white text-black rounded font-bold hover:bg-white/80 transition"
            >
              <FaPlay className="mr-2" /> Play Now
            </button>
            <button
              onClick={() => document.getElementById('new-games')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center px-8 py-3 bg-gray-600/70 text-white rounded font-bold hover:bg-gray-600/50 transition"
            >
              <FaInfoCircle className="mr-2" /> All Games
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Game Takeover */}
      <AnimatePresence>
        {activeGame && (
          <motion.div
            className="fixed inset-0 bg-black z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Game fills the entire screen */}
            <div className="absolute inset-0">
              <ActiveGameComponent />
            </div>

            {/* Floating top bar */}
            <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3 bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-none">
              <h2 className="text-white text-lg sm:text-2xl font-bold flex items-center gap-2 sm:gap-3 drop-shadow">
                <span>{activeGame.emoji}</span> {activeGame.title}
                <span className="bg-[#e50914] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                  {activeGame.badge}
                </span>
              </h2>
              <button
                className="pointer-events-auto text-gray-300 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2.5"
                onClick={() => setActiveGame(null)}
                aria-label="Close game"
              >
                <FaTimes size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's Top Games — single ranked poster row */}
      <div
        id="new-games"
        className="relative z-10 -mt-24 px-2 md:px-6"
        onMouseEnter={() => setShowArrows(true)}
        onMouseLeave={() => setShowArrows(false)}
      >
        <h2 className="text-lg md:text-2xl font-bold text-[#e5e5e5] mb-3 px-1">
          Today's Top Games <span className="text-gray-500 font-normal">— pick a number</span>
        </h2>
        <div className="relative">
          {canLeft && (
            <button
              className={`group/arrow absolute left-0 top-0 bottom-6 w-12 sm:w-16 z-30 text-white bg-gradient-to-r from-black/80 via-black/45 to-transparent transition-opacity duration-300 hidden sm:flex items-center justify-center ${showArrows ? "opacity-100" : "opacity-0"}`}
              onClick={() => scrollRow(-1)}
            >
              <Chevron flip />
            </button>
          )}
          {canRight && (
            <button
              className={`group/arrow absolute right-0 top-0 bottom-6 w-12 sm:w-16 z-30 text-white bg-gradient-to-l from-black/80 via-black/45 to-transparent transition-opacity duration-300 hidden sm:flex items-center justify-center ${showArrows ? "opacity-100" : "opacity-0"}`}
              onClick={() => scrollRow(1)}
            >
              <Chevron />
            </button>
          )}
          <div ref={rowRef} className="flex items-end overflow-x-auto no-scrollbar pb-6 pt-2">
          {NEW_GAMES.map((game, index) => (
            <div key={game.id} className="flex items-end flex-shrink-0 mr-3 md:mr-5">
              {/* Netflix Top-10 rank number */}
              <span className="rank-number font-['Bebas_Neue'] text-[90px] md:text-[135px] leading-[0.75] -mr-2 select-none">
                {index + 1}
              </span>
              {/* Movie poster card */}
              <div
                onClick={() => setActiveGame(game)}
                className="group relative z-10 w-36 md:w-44 h-52 md:h-64 rounded-md overflow-hidden cursor-pointer border border-white/10 hover:border-white/50 shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-all duration-300 hover:scale-105"
              >
                {/* Poster art */}
                <div className={`absolute inset-0 bg-gradient-to-b ${game.gradient}`} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(255,255,255,0.3),transparent_60%)]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-black/35" />

                {/* Netflix N + badge */}
                <span className="absolute top-2 left-2 font-['Bebas_Neue'] text-[#e50914] text-xl leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                  N
                </span>
                <span className="absolute top-2 right-2 bg-[#e50914] text-white text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded-sm">
                  {game.badge}
                </span>

                {/* Artwork */}
                <div className="absolute inset-x-0 top-7 md:top-10 flex justify-center">
                  <span className="text-6xl md:text-7xl drop-shadow-[0_10px_24px_rgba(0,0,0,0.7)] group-hover:scale-110 transition-transform duration-300">
                    {game.emoji}
                  </span>
                </div>

                {/* Poster title */}
                <div className="absolute bottom-0 inset-x-0 px-2 pb-2.5 text-center">
                  <h3 className="font-['Bebas_Neue'] text-white text-2xl md:text-[28px] leading-[0.95] tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                    {game.title}
                  </h3>
                  <p className="text-white/70 text-[9px] md:text-[11px] mt-1 leading-tight">
                    {game.tagline}
                  </p>
                </div>

                {/* Hover play button */}
                <div className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/30">
                  <div className="bg-white text-black rounded-full w-11 h-11 flex items-center justify-center shadow-lg">
                    <FaPlay size={14} className="ml-0.5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>

      {/* Bottom padding */}
      <div className="h-20"></div>
    </div>
  );
}

export default Kids;
