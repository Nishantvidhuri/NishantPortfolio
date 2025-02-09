import React, { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaGithub, FaLinkedin, FaInstagram, FaDiscord, FaEnvelope, FaPhone } from "react-icons/fa";

const socialMediaLinks = [
  { name: "Email", icon: <FaEnvelope />, link: "mailto:nisahntvidhuri0987@gmail.com" },
  { name: "LinkedIn", icon: <FaLinkedin />, link: "https://www.linkedin.com/in/nishant-vidhuri-092a63124/" },
  { name: "Phone", icon: <FaPhone />, link: "tel:+91 9871202673" },
  { name: "GitHub", icon: <FaGithub />, link: "https://github.com/Nishantvidhuri" },
  { name: "Instagram", icon: <FaInstagram />, link: "https://www.instagram.com/nishantvidhuriii" },
  { name: "Discord", icon: <FaDiscord />, link: "https://discord.com/users/nishantvidhuri_77577" }
];

function SocialMedia() {
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
      onMouseEnter={() => setShowArrows(true)} // Show arrows on hover (desktop)
      onMouseLeave={() => setShowArrows(false)} // Hide arrows when mouse leaves
    >
      <h1 className="ml-4 sm:ml-10 pt-3 pb-3 text-lg sm:text-xl font-[Poppins] text-white">
        Connect With Me
      </h1>

      <div className="relative flex items-center">
        {/* Scroll Left Button (Only visible on desktop and when hovered) */}
        <button
          className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 p-3 h-12 w-12 sm:h-16 sm:w-16 z-50 text-white hover:bg-black/80 transition-all duration-300 rounded-full hidden sm:flex items-center justify-center ${
            showArrows ? "opacity-100" : "opacity-0"
          }`}
          onClick={scrollLeftHandler}
        >
          <FaChevronLeft className="transition-transform duration-300 hover:scale-125" size={25} />
        </button>

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
          <div className="flex gap-4 whitespace-nowrap">
            {socialMediaLinks.map((platform, index) => (
              <a
                key={index}
                href={platform.link}
                target="_blank"
                rel="noopener noreferrer"
                className="relative border border-gray-700 rounded-md w-40 sm:w-80 h-32 sm:h-40 flex-shrink-0 flex flex-col items-center justify-center cursor-pointer"
              >
                {/* Icon - Corrected Sizes for Mobile & PC */}
                <div className="text-white text-4xl sm:text-6xl">{platform.icon}</div>

                <span className="text-xs sm:text-sm text-white font-semibold mt-2">
                  {platform.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Scroll Right Button (Only visible on desktop and when hovered) */}
        <button
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 p-3 h-12 w-12 sm:h-16 sm:w-16 z-50 text-white hover:bg-black/80 transition-all duration-300 rounded-full hidden sm:flex items-center justify-center ${
            showArrows ? "opacity-100" : "opacity-0"
          }`}
          onClick={scrollRightHandler}
        >
          <FaChevronRight className="transition-transform duration-300 hover:scale-125" size={25} />
        </button>
      </div>
    </div>
  );
}

export default SocialMedia;
