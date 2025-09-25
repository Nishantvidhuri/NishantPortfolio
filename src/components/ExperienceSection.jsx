import React, { useRef, useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ContactModal from './ContactModal';

function ExperienceSection() {
  const location = useLocation();
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showArrows, setShowArrows] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Determine if we're on the HR page or Developer page
  const isHrPage = location.pathname.includes('/hr');
  const bgColor = isHrPage ? 'bg-black' : 'bg-[#141414]';
  
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
  
  const openContactModal = () => {
    setIsModalOpen(true);
  };
  
  const experiences = [
    {
      company: "Big Verse",
      title: "Frontend Developer",
      period: "Oct 2024 - Feb 2025",
      logo: "/image.png"
    },
    {
      company: "Vox Gauge",
      title: "Frontend Developer",
      period: "Feb 2025 - June 2025",
      logo: "https://framerusercontent.com/images/5MwGErH8PsYI9enHWzWZJRF7kJ4.svg?scale-down-to=512"
    },
    {
      company: "Recrivio",
      title: "Associate Software Developer",
      period: "August 2025 - Present",
      logo: "/src/assets/logo/recrivio.png"
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
      <h1 className="ml-4 sm:ml-10 pb-3 text-lg sm:text-xl font-[Poppins] text-white">
        Professional Experience
      </h1>

      <div className="relative flex items-center">
        {/* Scroll Left Button */}
        <button
          className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 p-3 h-12 w-12 sm:h-16 sm:w-16 z-50 text-white hover:bg-black/80 transition-all duration-300 rounded-full hidden sm:flex items-center justify-center ${
            showArrows ? "opacity-100" : "opacity-0"
          }`}
          onClick={scrollLeftHandler}
        >
          <FaChevronLeft className="transition-transform duration-300 hover:scale-125" size={25} />
        </button>

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
                className={`relative border ${exp.isPlaceholder ? 'border-dashed border-red-600' : ''} border-gray-700 rounded-md w-40 sm:w-80 h-32 sm:h-40 flex-shrink-0 flex flex-col items-center justify-center ${exp.isPlaceholder ? 'cursor-pointer' : ''}`}
                onClick={exp.isPlaceholder ? openContactModal : undefined}
              >
                {exp.logo ? (
                  <img src={exp.logo} alt={exp.company} className="w-16 sm:w-20 h-16 sm:h-20 object-contain" />
                ) : (
                  <div className="w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center text-red-500 text-4xl">🚀</div>
                )}
                <span className="text-xs sm:text-sm text-white font-semibold mt-2">
                  {exp.company}
                </span>
                <span className="text-xs text-gray-400">
                  {exp.title}
                </span>
                <span className={`text-xs text-red-500 mt-1 ${exp.isPlaceholder ? 'hover:underline' : ''}`}>
                  {exp.period}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Right Button */}
        <button
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 p-3 h-12 w-12 sm:h-16 sm:w-16 z-50 text-white hover:bg-black/80 transition-all duration-300 rounded-full hidden sm:flex items-center justify-center ${
            showArrows ? "opacity-100" : "opacity-0"
          }`}
          onClick={scrollRightHandler}
        >
          <FaChevronRight className="transition-transform duration-300 hover:scale-125" size={25} />
        </button>
      </div>
      
      {/* Contact Modal */}
      <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default ExperienceSection; 