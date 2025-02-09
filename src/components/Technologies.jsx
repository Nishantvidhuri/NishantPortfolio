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

    // Prevent Default only if dragging (Fix for passive event issue)
    if (e.cancelable) e.preventDefault();

    const x = e.pageX || e.touches[0].pageX;
    const walk = (x - startX) * 1.5; // Increase scroll sensitivity
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // Stop Dragging
  const stopDrag = () => {
    setIsDragging(false);
  };

  // Prevent Passive Event Error by manually setting `passive: false`
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("touchmove", onDrag, { passive: false });

    return () => {
      el.removeEventListener("touchmove", onDrag);
    };
  }, [isDragging]);

  return (
    <div className="bg-[#141414] group py-5 relative w-full overflow-hidden">
      <h1 className="ml-4 sm:ml-10 pt-3 pb-3 text-lg sm:text-xl font-[Poppins] text-white">
        Technologies I Worked On
      </h1>

      <div className="relative flex items-center">
        {/* Scroll Left Button (Visible on Desktop) */}
        <button
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black/30 p-2 h-32 w-12 sm:h-40 sm:w-[72px] opacity-0 group-hover:opacity-100 z-50 text-white hover:bg-black/50 transition-opacity duration-300 flex items-center justify-center hidden md:flex"
          onClick={scrollLeftHandler}
        >
          <FaChevronLeft className="transition-transform duration-300 hover:scale-125" size={30} />
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
          <div className="flex gap-2 whitespace-nowrap">
            {techStack.map((tech, index) => (
              <div
                key={index}
                className="relative w-40 sm:w-80 h-32 sm:h-40 flex-shrink-0 bg-gray-900 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 transition"
              >
                <img src={tech.image} alt={tech.name} className="w-28 sm:w-60 h-16 sm:h-28 object-contain" />
                <span className="font-[Nunito] text-sm sm:text-xl text-white font-bold mt-2">
                  {tech.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Right Button (Visible on Desktop) */}
        <button
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black/30 p-2 h-32 w-12 sm:h-40 sm:w-[72px] opacity-0 group-hover:opacity-100 z-50 text-white hover:bg-black/50 transition-opacity duration-300 flex items-center justify-center hidden md:flex"
          onClick={scrollRightHandler}
        >
          <FaChevronRight className="transition-transform duration-300 hover:scale-125" size={30} />
        </button>
      </div>
    </div>
  );
}

export default Technologies;
