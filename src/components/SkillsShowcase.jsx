import React, { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

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

const techStack = [
  { name: "React", image: reactImg },
  { name: "JavaScript", image: jsImg },
  { name: "Tailwind CSS", image: tailwindImg },
  { name: "Redux", image: reduxImg },
  { name: "Three.js", image: threeJsImg },
  { name: "Axios", image: axiosImg },
  { name: "GSAP", image: gsapImg },
  { name: "Material UI", image: materialUiImg },
  { name: "Vite", image: viteImg },
  { name: "HTML", image: htmlImg },
  { name: "CSS", image: cssImg },
];

function Technologies() {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showArrows, setShowArrows] = useState(false); // State for showing arrows

  const scrollAmount = window.innerWidth <= 640 ? 200 : 320;

  const scrollLeftHandler = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollRightHandler = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
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
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("touchmove", onDrag, { passive: false });

    return () => {
      el.removeEventListener("touchmove", onDrag);
    };
  }, [isDragging]);

  return (
    <div className="bg-[#141414] py-12 relative w-full">
      <div className="container mx-auto">
        <h1 className="px-4 sm:px-10 pb-8 text-2xl sm:text-3xl font-['Poppins'] text-white">
          Skills & Technologies
        </h1>

        <div className="relative">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#141414] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#141414] to-transparent z-10" />

          {/* Scroll Left Button */}
          <button
            className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 p-3 h-12 w-12 sm:h-16 sm:w-16 z-20 text-white hover:bg-black/80 transition-all duration-300 rounded-full hidden sm:flex items-center justify-center backdrop-blur-sm ${
              showArrows ? "opacity-100" : "opacity-0"
            }`}
            onClick={scrollLeftHandler}
          >
            <FaChevronLeft className="transition-transform duration-300 hover:scale-125" size={25} />
          </button>

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
            <div className="flex gap-4 whitespace-nowrap">
              {techStack.map((tech, index) => (
                <div
                  key={index}
                  className="relative group bg-[#1a1a1a] rounded-lg w-40 sm:w-72 h-32 sm:h-44 flex-shrink-0 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-transform duration-300 hover:scale-105 border border-gray-800/50"
                >
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center gap-4 transform group-hover:translate-y-[-8px] transition-transform duration-300">
                    <img 
                      src={tech.image} 
                      alt={tech.name} 
                      className="w-16 sm:w-20 h-16 sm:h-20 object-contain filter group-hover:brightness-110" 
                    />
                    <span className="text-sm sm:text-base text-gray-300 font-medium group-hover:text-white transition-colors duration-300">
                      {tech.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll Right Button */}
          <button
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 p-3 h-12 w-12 sm:h-16 sm:w-16 z-20 text-white hover:bg-black/80 transition-all duration-300 rounded-full hidden sm:flex items-center justify-center backdrop-blur-sm ${
              showArrows ? "opacity-100" : "opacity-0"
            }`}
            onClick={scrollRightHandler}
          >
            <FaChevronRight className="transition-transform duration-300 hover:scale-125" size={25} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Technologies;
