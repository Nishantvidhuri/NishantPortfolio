import React, { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// ✅ Import Certificate Logos
import dsaLogo from "../assets/Certificates/codingninja.png";
import frontendLogo from "../assets/Certificates/sheriyans.png";
import resumeLogo from "../assets/Certificates/resume.png";

const documents = [
  { name: "Resume", logo: resumeLogo, link: "https://drive.google.com/file/d/18z0fJm-KOhX3aejFhth5Mh1FvrZJip1x/view?usp=sharing" },
  { name: "DSA Certificate", logo: dsaLogo, link: "https://drive.google.com/file/d/1KbxojO0BGBbZD7pIh0uHtOXk4HKvGyXH/view?usp=sharing" },
  { name: "Frontend Certificate", logo: frontendLogo, link: "https://drive.google.com/file/d/1CnF-ItunVRUbe0q6f-YYpN3sCpaEkkbf/view?usp=sharing" },
];

function Documents() {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showArrows, setShowArrows] = useState(false);

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
    <div
      className="bg-[#141414] py-5 relative w-full"
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      <h1 className="ml-4 sm:ml-10  pb-3 text-lg sm:text-xl font-[Poppins] text-white">
        My Documents
      </h1>

      <div className="relative flex items-center">
        {/* Scroll Left Button (Visible on Desktop if 5+ documents and on hover) */}
        {documents.length >= 5 && (
          <button
            className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 p-3 h-12 w-12 sm:h-16 sm:w-16 z-50 text-white hover:bg-black/80 transition-all duration-300 rounded-full hidden sm:flex items-center justify-center ${
              showArrows ? "opacity-100" : "opacity-0"
            }`}
            onClick={scrollLeftHandler}
          >
            <FaChevronLeft className="transition-transform duration-300 hover:scale-125" size={25} />
          </button>
        )}

        {/* Scrollable Documents Container */}
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
            {documents.map((doc, index) => (
              <a
                key={index}
                href={doc.link}
                target="_blank"
                rel="noopener noreferrer"
                className="relative border border-gray-700 rounded-md w-40 sm:w-80 h-32 sm:h-40 flex-shrink-0 flex flex-col items-center justify-center cursor-pointer "
              >
                <img src={doc.logo} alt={doc.name} className="w-20 sm:w-28 h-20 sm:h-28 object-contain" />
                <span className="text-xs sm:text-sm text-white font-semibold mt-2">
                  {doc.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Scroll Right Button (Visible on Desktop if 5+ documents and on hover) */}
        {documents.length >= 5 && (
          <button
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 p-3 h-12 w-12 sm:h-16 sm:w-16 z-50 text-white hover:bg-black/80 transition-all duration-300 rounded-full hidden sm:flex items-center justify-center ${
              showArrows ? "opacity-100" : "opacity-0"
            }`}
            onClick={scrollRightHandler}
          >
            <FaChevronRight className="transition-transform duration-300 hover:scale-125" size={25} />
          </button>
        )}
      </div>
    </div>
  );
}

export default Documents;
