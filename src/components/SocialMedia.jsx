import React, { useRef, useState, useEffect } from "react";
import { FaGithub, FaLinkedin, FaInstagram, FaDiscord, FaEnvelope, FaPhone } from "react-icons/fa";

const socialMediaLinks = [
  { name: "Email", icon: <FaEnvelope />, link: "mailto:nisahntvidhuri0987@gmail.com", sub: "Say hello anytime", gradient: "from-rose-600 via-red-700 to-orange-900" },
  { name: "LinkedIn", icon: <FaLinkedin />, link: "https://www.linkedin.com/in/nishant-vidhuri-092a63124/", sub: "Let's connect", gradient: "from-sky-600 via-blue-700 to-blue-950" },
  { name: "Phone", icon: <FaPhone />, link: "tel:+91 9871202673", sub: "+91 98712 02673", gradient: "from-emerald-600 via-green-700 to-teal-950" },
  { name: "GitHub", icon: <FaGithub />, link: "https://github.com/Nishantvidhuri", sub: "@Nishantvidhuri", gradient: "from-slate-600 via-gray-700 to-zinc-950" },
  { name: "Instagram", icon: <FaInstagram />, link: "https://www.instagram.com/nishantvidhuriii", sub: "@nishantvidhuriii", gradient: "from-fuchsia-600 via-pink-600 to-amber-700" },
  { name: "Discord", icon: <FaDiscord />, link: "https://discord.com/users/nishantvidhuri_77577", sub: "nishantvidhuri_77577", gradient: "from-indigo-600 via-violet-700 to-indigo-950" }
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

function SocialMedia() {
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


  return (
    <div
      className="bg-[#141414] py-5 relative w-full"
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      <h1 className="ml-4 sm:ml-10 pb-3 text-lg md:text-2xl font-bold text-[#e5e5e5]">
        Connect With Me
      </h1>

      <div className="relative flex items-center">
        {/* Scroll Left Button */}
        {canLeft && (
<button
          className={`group/arrow absolute left-0 top-0 bottom-0 w-12 sm:w-16 z-50 text-white bg-gradient-to-r from-black/80 via-black/45 to-transparent transition-opacity duration-300 hidden sm:flex items-center justify-center ${
            showArrows ? "opacity-100" : "opacity-0"
          }`}
          onClick={scrollLeftHandler}
        >
          <Chevron flip />
        </button>
)}

        {/* Scrollable Social Media Container */}
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
            {socialMediaLinks.map((platform, index) => (
              <a
                key={index}
                href={platform.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-44 sm:w-72 flex-shrink-0 whitespace-normal group/card"
              >
                <div className="relative h-24 sm:h-40 rounded-md overflow-hidden transition-transform duration-300 group-hover/card:scale-[1.04]">
                  <div className={`absolute inset-0 bg-gradient-to-br ${platform.gradient}`} />
                  {/* key-art layers */}
                  <span
                    aria-hidden
                    className="absolute -right-4 -bottom-7 text-white opacity-20 blur-[1px] rotate-[-12deg] text-[100px] sm:text-[150px] leading-none"
                  >
                    {platform.icon}
                  </span>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_15%,rgba(255,255,255,0.3),transparent_55%)]" />
                  <div className="absolute -left-8 -top-10 h-[220%] w-14 bg-white/10 rotate-[24deg]" />
                  <div
                    className="absolute inset-0 opacity-[0.08]"
                    style={{
                      backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
                      backgroundSize: "11px 11px",
                    }}
                  />
                  {/* vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/25" />
                  {/* icon chip */}
                  <span className="absolute top-2 right-2 text-white text-lg sm:text-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                    {platform.icon}
                  </span>
                  {/* show-title */}
                  <div className="absolute bottom-1.5 sm:bottom-2.5 left-2.5 sm:left-3.5 right-2">
                    <h3 className="font-['Bebas_Neue'] text-white text-2xl sm:text-4xl leading-[0.9] tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                      {platform.name}
                    </h3>
                    <p className="text-[9px] sm:text-[11px] text-white/85 mt-0.5 truncate">
                      {platform.sub}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Scroll Right Button */}
        {canRight && (
<button
          className={`group/arrow absolute right-0 top-0 bottom-0 w-12 sm:w-16 z-50 text-white bg-gradient-to-l from-black/80 via-black/45 to-transparent transition-opacity duration-300 hidden sm:flex items-center justify-center ${
            showArrows ? "opacity-100" : "opacity-0"
          }`}
          onClick={scrollRightHandler}
        >
          <Chevron />
        </button>
)}
      </div>
    </div>
  );
}

export default SocialMedia;
