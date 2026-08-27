import React, { useRef, useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import ContactModal from './ContactModal';

function ExperienceSection() {
  const location = useLocation();
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showArrows, setShowArrows] = useState(false);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 5);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Determine if we're on the HR page or Developer page
  const isHrPage = location.pathname.includes('/hr');
  const bgColor = isHrPage ? 'bg-transparent' : 'bg-[#141414]';
  
  const scrollAmount = window.innerWidth <= 640 ? 200 : 320;

  const scrollLeftHandler = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      setTimeout(updateArrows, 420);
    }
  };

  const scrollRightHandler = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(updateArrows, 420);
    }
  };

  // Start Dragging
  const startDrag = (e) => {
    setIsDragging(true);
    setStartX(e.pageX || e.touches[0].pageX);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  // While Dragging
  const onDrag = (e) => {
    if (!isDragging) return;

    if (e.cancelable) e.preventDefault();

    const x = e.pageX || e.touches[0].pageX;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // Stop Dragging
  const stopDrag = () => {
    setIsDragging(false);
    updateArrows();
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("touchmove", onDrag, { passive: false });

    return () => {
      el.removeEventListener("touchmove", onDrag);
    };
  }, [isDragging]);

  // Show arrows only when the row actually overflows / has somewhere to go
  useEffect(() => {
    updateArrows();
    const t = setTimeout(updateArrows, 400);
    const el = scrollRef.current;
    el?.addEventListener("scroll", updateArrows);
    window.addEventListener("resize", updateArrows);
    return () => {
      clearTimeout(t);
      el?.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, []);

  
  const openContactModal = () => {
    setIsModalOpen(true);
  };
  
  const experiences = [
    {
      company: "Big Verse",
      title: "Frontend Developer",
      period: "Oct 2024 - Feb 2025",
      logo: "/image.png",
      progress: 100,
      gradient: "from-indigo-700 via-purple-700 to-fuchsia-900"
    },
    {
      company: "Vox Gauge",
      title: "Frontend Developer",
      period: "Feb 2025 - June 2025",
      logo: "https://framerusercontent.com/images/5MwGErH8PsYI9enHWzWZJRF7kJ4.svg?scale-down-to=512",
      progress: 100,
      gradient: "from-emerald-700 via-teal-700 to-cyan-900"
    },
    {
      company: "Recrivio",
      title: "Software Developer",
      period: "August 2025 - Present",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScqpp3Y5Duvh-v7pYI0lzo5lgFz2VIs7tSUvc2QEZeBg&s=10",
      progress: 45,
      gradient: "from-blue-700 via-sky-800 to-indigo-900"
    },
    {
      company: "Your Company?",
      title: "Open to Opportunities",
      period: "Let's collaborate",
      logo: null, // No logo for placeholder
      isPlaceholder: true
    }
  ];

  return (
    <div
      className={`${bgColor} py-5 relative w-full`}
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      <h1 className="ml-4 sm:ml-10 pb-3 text-lg md:text-2xl font-bold text-[#e5e5e5]">
        Continue Watching <span className="text-gray-400 font-normal">for Nishant</span>
      </h1>

      <div className="relative flex items-center">
        {/* Scroll Left Button */}
        {canLeft && (
<button
          className={`group/arrow absolute left-0 top-0 bottom-0 w-12 sm:w-16 z-50 text-white bg-gradient-to-r from-black/80 via-black/45 to-transparent transition-opacity duration-300 hidden sm:flex items-center justify-center ${showArrows ? "opacity-100" : "opacity-0"}`}
          onClick={scrollLeftHandler}
        >
          <svg viewBox="0 0 36 36" width="32" height="32" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" className="rotate-180 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] transition-transform duration-200 group-hover/arrow:scale-125"><path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M23.586 18 12.293 29.293l1.414 1.414 12-12a1 1 0 0 0 0-1.414l-12-12-1.414 1.414z"></path></svg>
        </button>
)}

        {/* Scrollable Experiences Container */}
        <div
          ref={scrollRef}
          className="overflow-hidden px-4 sm:px-10 w-full cursor-grab active:cursor-grabbing"
          onMouseDown={startDrag}
          onMouseMove={onDrag}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          onTouchStart={startDrag}
          onTouchEnd={stopDrag}
        >
          <div className="flex gap-2 whitespace-nowrap">
        {experiences.map((exp, index) => (
              <div
                key={index}
                className={`w-44 sm:w-72 flex-shrink-0 whitespace-normal ${exp.isPlaceholder ? 'cursor-pointer' : ''} group/card`}
                onClick={exp.isPlaceholder ? openContactModal : undefined}
              >
                {/* Title-card artwork, like real Netflix */}
                <div
                  className={`relative h-24 sm:h-40 rounded-md overflow-hidden transition-transform duration-300 group-hover/card:scale-[1.04] ${
                    exp.isPlaceholder ? 'border border-dashed border-red-600/70 bg-[#181818]' : ''
                  }`}
                >
                  {!exp.isPlaceholder && (
                    <>
                      <div className={`absolute inset-0 bg-gradient-to-br ${exp.gradient}`} />
                      {/* key-art layers: giant logo watermark, light bloom, beam, texture */}
                      <img
                        src={exp.logo}
                        alt=""
                        aria-hidden
                        className="absolute -right-5 -bottom-8 h-[130%] w-auto object-contain opacity-20 blur-[1px] rotate-[-10deg]"
                      />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_15%,rgba(255,255,255,0.3),transparent_55%)]" />
                      <div className="absolute -left-8 -top-10 h-[220%] w-14 bg-white/10 rotate-[24deg]" />
                      <div
                        className="absolute inset-0 opacity-[0.08]"
                        style={{
                          backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
                          backgroundSize: "11px 11px",
                        }}
                      />
                      {/* vignette for title legibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/25" />
                      <img
                        src={exp.logo}
                        alt={exp.company}
                        className="absolute top-2 right-2 w-8 h-8 sm:w-12 sm:h-12 object-contain rounded-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
                      />
                      {/* show-title art */}
                      <div className="absolute bottom-1.5 sm:bottom-2.5 left-2.5 sm:left-3.5 right-2">
                        <h3 className="font-['Bebas_Neue'] text-white text-2xl sm:text-4xl leading-[0.9] tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                          {exp.company}
                        </h3>
                        <p className="text-[9px] sm:text-[11px] text-white/85 mt-0.5">
                          {exp.title} · {exp.period}
                        </p>
                      </div>
                    </>
                  )}
                  {exp.isPlaceholder && (
                    <>
                      <span className="absolute top-2 left-2 bg-[#e50914] text-white text-[9px] sm:text-[10px] font-bold tracking-widest px-1.5 py-0.5 rounded-sm">
                        COMING SOON
                      </span>
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                        <span className="text-3xl sm:text-4xl transition-transform duration-300 group-hover/card:scale-110">🚀</span>
                        <span className="font-['Bebas_Neue'] text-white text-xl sm:text-2xl tracking-wide">Your Company?</span>
                        <span className="text-[10px] sm:text-xs text-gray-400 group-hover/card:underline">
                          Open to Opportunities · Let's collaborate
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Real-Netflix progress bar: below the artwork on a gray track */}
                {!exp.isPlaceholder && (
                  <div className="mx-2.5 sm:mx-3 mt-1.5 h-[3px] bg-[#4d4d4d] rounded-full overflow-hidden">
                    <div className="h-full bg-[#e50914]" style={{ width: `${exp.progress}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Right Button */}
        {canRight && (
<button
          className={`group/arrow absolute right-0 top-0 bottom-0 w-12 sm:w-16 z-50 text-white bg-gradient-to-l from-black/80 via-black/45 to-transparent transition-opacity duration-300 hidden sm:flex items-center justify-center ${showArrows ? "opacity-100" : "opacity-0"}`}
          onClick={scrollRightHandler}
        >
          <svg viewBox="0 0 36 36" width="32" height="32" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] transition-transform duration-200 group-hover/arrow:scale-125"><path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M23.586 18 12.293 29.293l1.414 1.414 12-12a1 1 0 0 0 0-1.414l-12-12-1.414 1.414z"></path></svg>
        </button>
)}
      </div>
      
      {/* Contact Modal */}
      <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default ExperienceSection; 