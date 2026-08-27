import React, { useRef, useState, useEffect } from "react";

// ✅ Import Certificate Logos
import dsaLogo from "../assets/Certificates/codingninja.png";
import frontendLogo from "../assets/Certificates/sheriyans.png";
import resumeLogo from "../assets/Certificates/resume.png";

const documents = [
  { name: "Resume", logo: resumeLogo, link: "https://drive.google.com/file/d/1mYm-u_piUtMuNP4_kEem3QelcAqDZB4I/view?usp=sharing", sub: "PDF · Google Drive", gradient: "from-red-700 via-rose-800 to-red-950" },
  { name: "DSA Certificate", logo: dsaLogo, link: "https://drive.google.com/file/d/1KbxojO0BGBbZD7pIh0uHtOXk4HKvGyXH/view?usp=sharing", sub: "DSA with C++ · Code Help", gradient: "from-orange-600 via-amber-700 to-orange-950" },
  { name: "Frontend Certificate", logo: frontendLogo, link: "https://drive.google.com/file/d/1CnF-ItunVRUbe0q6f-YYpN3sCpaEkkbf/view?usp=sharing", sub: "Frontend Domination · Sheriyans", gradient: "from-amber-500 via-yellow-700 to-orange-950" },
];

function Documents() {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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
    <div className="bg-[#141414] py-5 relative w-full">
      <h1 className="ml-4 sm:ml-10 pb-3 text-lg md:text-2xl font-bold text-[#e5e5e5]">
        My Documents
      </h1>

      <div className="relative flex items-center">
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
                className="w-44 sm:w-72 flex-shrink-0 whitespace-normal group/card"
              >
                <div className="relative h-24 sm:h-40 rounded-md overflow-hidden transition-transform duration-300 group-hover/card:scale-[1.04]">
                  <div className={`absolute inset-0 bg-gradient-to-br ${doc.gradient}`} />
                  {/* key-art layers */}
                  <img
                    src={doc.logo}
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
                  {/* vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/25" />
                  {/* logo chip */}
                  <img
                    src={doc.logo}
                    alt={doc.name}
                    className="absolute top-2 right-2 w-8 h-8 sm:w-12 sm:h-12 object-contain rounded-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
                  />
                  {/* show-title */}
                  <div className="absolute bottom-1.5 sm:bottom-2.5 left-2.5 sm:left-3.5 right-2">
                    <h3 className="font-['Bebas_Neue'] text-white text-2xl sm:text-4xl leading-[0.9] tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                      {doc.name}
                    </h3>
                    <p className="text-[9px] sm:text-[11px] text-white/85 mt-0.5 truncate">
                      {doc.sub}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Documents;
