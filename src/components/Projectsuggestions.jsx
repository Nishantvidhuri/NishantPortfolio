import React, { useState, useRef, useEffect } from "react";
import { useProjects } from "../context/ProjectContext";
import ProjectDetails from "./ProjectDetails"; // Import the modal component

function Projectsuggestions() {
  const { projects } = useProjects();
  const scrollRef = useRef(null);
  const mobileScrollRef = useRef(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 5);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  };


  // Scroll Left (One Card)
  const scrollLeftHandler = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
      setTimeout(updateArrows, 420);
    }
  };

  // Scroll Right (One Card)
  const scrollRightHandler = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
      setTimeout(updateArrows, 420);
    }
  };

  // Start Dragging
  const startDrag = (e) => {
    setIsDragging(true);
    setStartX(e.pageX || e.touches[0].pageX);
    setScrollLeft(scrollRef.current ? scrollRef.current.scrollLeft : 0);
  };

  // While Dragging
  const onDrag = (e) => {
    if (!isDragging) return;

    if (e.cancelable) e.preventDefault(); // Prevent default only if dragging

    const x = e.pageX || e.touches[0].pageX;
    const walk = (x - startX) * 1.5; // Increase scroll sensitivity
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
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
    <div className="bg-[#141414] group py-0 sm:py-5 w-full relative">
      <h1 className="ml-4 sm:ml-10 pt-3 pb-3 text-lg md:text-2xl font-bold text-[#e5e5e5]">
        Today's Top Picks For You
      </h1>

      {/* Desktop View */}
      <div className="hidden sm:block relative  items-center ">
        {/* Scroll Left Button (Visible on Desktop) */}
        {canLeft && (
<button
          className="group/arrow absolute left-0 top-0 bottom-0 w-12 sm:w-16 opacity-0 group-hover:opacity-100 z-50 text-white bg-gradient-to-r from-black/80 via-black/45 to-transparent transition-opacity duration-300 flex items-center justify-center"
          onClick={scrollLeftHandler}
        >
          <svg viewBox="0 0 36 36" width="40" height="40" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" className="rotate-180 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] transition-transform duration-200 group-hover/arrow:scale-125"><path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M23.586 18 12.293 29.293l1.414 1.414 12-12a1 1 0 0 0 0-1.414l-12-12-1.414 1.414z"></path></svg>
        </button>
)}

        {/* Scrollable Cards Container */}
        <div
          ref={scrollRef}
          className="overflow-hidden whitespace-nowrap px-4 sm:px-10 w-full cursor-grab active:cursor-grabbing flex"
          onMouseDown={startDrag}
          onMouseMove={onDrag}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          onTouchStart={startDrag}
          onTouchEnd={stopDrag}
        >
          <div className="flex flex-nowrap min-w-max items-end pt-2">
            {projects.map((project, index) => (
              <div key={index} className="flex items-end flex-shrink-0 mr-4 sm:mr-6">
                {/* Netflix Top-10 rank number */}
                <span className="rank-number font-['Bebas_Neue'] text-[100px] sm:text-[130px] leading-[0.75] -mr-2 select-none">
                  {index + 1}
                </span>
                <div
                  className="relative z-10 w-[90%] sm:w-72 h-56 sm:h-40 flex-shrink-0 overflow-hidden rounded-sm cursor-pointer snap-start transition-transform duration-300 hover:scale-105"
                  onClick={() => setSelectedProject(project)}
                >
                  {/* Background Image - Mobile uses wider images */}
                  <img
                    src={project.image}
                    alt={`${project.name} Background`}
                    className="absolute w-full h-full object-cover"
                  />

                  {/* Black Overlay with Blur */}
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[.5px] z-10"></div>

                  {/* Foreground Logo */}
                  <img
                    src={project.logo}
                    alt={`${project.name} Logo`}
                    className="relative z-20 w-20 h-20 object-contain mx-auto mt-3"
                  />

                  {/* Project Name (Centered at Bottom) */}
                  <h1 className="absolute w-full bottom-2 text-center text-white text-lg font-semibold z-20">
                    {project.name}
                  </h1>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Right Button (Visible on Desktop) */}
        {canRight && (
<button
          className="group/arrow absolute right-0 top-0 bottom-0 w-12 sm:w-16 opacity-0 group-hover:opacity-100 z-50 text-white bg-gradient-to-l from-black/80 via-black/45 to-transparent transition-opacity duration-300 flex items-center justify-center"
          onClick={scrollRightHandler}
        >
          <svg viewBox="0 0 36 36" width="40" height="40" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] transition-transform duration-200 group-hover/arrow:scale-125"><path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M23.586 18 12.293 29.293l1.414 1.414 12-12a1 1 0 0 0 0-1.414l-12-12-1.414 1.414z"></path></svg>
        </button>
)}
      </div>

      {/* Mobile View */}
      <div className="sm:hidden w-full overflow-x-auto whitespace-nowrap py-4 no-scrollbar" ref={mobileScrollRef}>
      <div className="flex px-4 items-end"
      >
  {projects.map((project, index) => (
    <div key={index} className="flex items-end flex-shrink-0 mr-4">
      {/* Netflix Top-10 rank number */}
      <span className="rank-number font-['Bebas_Neue'] text-[80px] leading-[0.75] -mr-1 select-none">
        {index + 1}
      </span>
      <div className="w-36 flex-shrink-0 relative z-10" onClick={() => setSelectedProject(project)} >
        {/* Background Image */}
        <img
          src={project.imageMob}
          alt={project.name}
          className="w-40 h-50 object-cover rounded-xs"
        />

        {/* Black Overlay */}
        <div className="absolute inset-0 bg-black/80 rounded-xs"></div>


        <img
                    src={project.logo}
                    alt={`${project.name} Logo`}
                    className="absolute bottom-[25%] left-[25%] z-20 w-20 h-20 object-contain mx-auto mt-3"
                  />
        {/* Project Name */}
        <h2 className="absolute bottom-2 font-[teko] left-0 right-0 text-white text-center text-lg font-semibold z-10">
          {project.name}
        </h2>
      </div>
    </div>
  ))}
</div>

      </div>

      {/* Show ProjectDetails modal when a project is selected */}
      {selectedProject && (
        <ProjectDetails project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  );
}

export default Projectsuggestions;
