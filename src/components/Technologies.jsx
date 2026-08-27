import React, { useRef, useState, useEffect } from "react";

// ✅ Import Images Directly
import axiosImg from "../assets/Technology/axios.png";
import cssImg from "../assets/Technology/css.png";
import gsapImg from "../assets/Technology/gsap.png";
import htmlImg from "../assets/Technology/html.png";
import jsImg from "../assets/Technology/javascript.png";
import materialUiImg from "../assets/Technology/materialui.png";
import reactImg from "../assets/Technology/react.png";
import reduxImg from "../assets/Technology/redux.png";
import tailwindImg from "../assets/Technology/tailwind.png";
import threeJsImg from "../assets/Technology/threejs.png";
import viteImg from "../assets/Technology/vite.png";
import awsImg from "../assets/Technology/aws.png";
import expressImg from "../assets/Technology/express-js.png";
import mongodbImg from "../assets/Technology/mongodb.png";
import postgresImg from "../assets/Technology/postgres.jpg";

const techStack = [
  // Core: Framework & Language
  { name: "React", image: reactImg },
  { name: "JavaScript", image: jsImg },
  // Backend & Databases
  { name: "Express.js", image: expressImg },
  { name: "MongoDB", image: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/mongodb.png" },
  { name: "PostgreSQL", image: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/postgresql.png" },
  // Cloud & Deployment
  { name: "AWS", image: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/aws-light.png" },
  // Styling & UI
  { name: "HTML", image: htmlImg },
  { name: "CSS", image: cssImg },
  { name: "Tailwind CSS", image: tailwindImg },
  { name: "Material UI", image: materialUiImg },
  // State & Tooling
  { name: "Redux", image: reduxImg },
  { name: "Vite", image: viteImg },
  { name: "Axios", image: axiosImg },
  // Animation & 3D
  { name: "GSAP", image: gsapImg },
  { name: "Three.js", image: threeJsImg },
];

function Technologies() {
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
 // State for showing arrows

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
      onMouseEnter={() => setShowArrows(true)} // Show arrows on hover
      onMouseLeave={() => setShowArrows(false)} // Hide arrows when mouse leaves
    >
      <h1 className="ml-4 sm:ml-10 pb-3 text-lg md:text-2xl font-bold text-[#e5e5e5]">
        Technologies I Worked On
      </h1>

      <div className="relative flex items-center">
        {/* Scroll Left Button (Visible only on Desktop and on Hover) */}
        {canLeft && (
<button
          className={`group/arrow absolute left-0 top-0 bottom-0 w-12 sm:w-16 z-50 text-white bg-gradient-to-r from-black/80 via-black/45 to-transparent transition-opacity duration-300 hidden sm:flex items-center justify-center ${showArrows ? "opacity-100" : "opacity-0"}`}
          onClick={scrollLeftHandler}
        >
          <svg viewBox="0 0 36 36" width="32" height="32" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" className="rotate-180 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] transition-transform duration-200 group-hover/arrow:scale-125"><path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M23.586 18 12.293 29.293l1.414 1.414 12-12a1 1 0 0 0 0-1.414l-12-12-1.414 1.414z"></path></svg>
        </button>
)}

        {/* Scrollable Technologies Container */}
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
          <div className="flex whitespace-nowrap gap-3 pt-2 pb-4">
            {techStack.map((tech, index) => (
              <div
                key={index}
                className="group relative flex-shrink-0 cursor-pointer"
              >
                <div className="relative w-[140px] md:w-[210px] h-[130px] md:h-[180px] bg-gradient-to-b from-[#2a2a2a] to-[#181818] border border-white/10 rounded-sm flex flex-col items-center justify-center gap-3 transition-transform duration-300 group-hover:scale-110 group-hover:border-white/30">
                  <img src={tech.image} alt={tech.name} className="w-12 h-12 md:w-20 md:h-20 object-contain pointer-events-none" draggable={false} />
                  <span className="text-gray-300 text-xs md:text-sm text-center px-1 whitespace-normal">{tech.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Right Button (Visible only on Desktop and on Hover) */}
        {canRight && (
<button
          className={`group/arrow absolute right-0 top-0 bottom-0 w-12 sm:w-16 z-50 text-white bg-gradient-to-l from-black/80 via-black/45 to-transparent transition-opacity duration-300 hidden sm:flex items-center justify-center ${showArrows ? "opacity-100" : "opacity-0"}`}
          onClick={scrollRightHandler}
        >
          <svg viewBox="0 0 36 36" width="32" height="32" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] transition-transform duration-200 group-hover/arrow:scale-125"><path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M23.586 18 12.293 29.293l1.414 1.414 12-12a1 1 0 0 0 0-1.414l-12-12-1.414 1.414z"></path></svg>
        </button>
)}
      </div>
    </div>
  );
}

export default Technologies;
