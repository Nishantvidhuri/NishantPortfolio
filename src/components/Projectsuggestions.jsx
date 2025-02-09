import React, { useState, useRef, useEffect } from "react";
import { useProjects } from "../context/ProjectContext";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ProjectDetails from "./ProjectDetails"; // Import the modal component

function Projectsuggestions() {
  const { projects } = useProjects();
  const scrollRef = useRef(null);
  const mobileScrollRef = useRef(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Scroll Left (One Card)
  const scrollLeftHandler = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  // Scroll Right (One Card)
  const scrollRightHandler = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
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
    <div className="bg-[#141414] group py-0 sm:py-5 w-full relative">
      <h1 className="ml-10 pt-3 pb-3 text-xl font-[Poppins] text-white">
        Today's Top Picks For You
      </h1>

      {/* Desktop View */}
      <div className="hidden sm:block relative flex items-center ">
        {/* Scroll Left Button (Visible on Desktop) */}
        <button
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black/30 p-2 h-40 w-[72px] opacity-0 group-hover:opacity-100 z-50 text-white hover:bg-black/50 transition-opacity duration-300 flex items-center justify-center"
          onClick={scrollLeftHandler}
        >
          <FaChevronLeft className="transition-transform duration-300 hover:scale-125" size={50} />
        </button>

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
          <div className="flex gap-4 sm:gap-2 flex-nowrap min-w-max">
            {projects.map((project, index) => (
              <div
                key={index}
                className="relative w-[90%] sm:w-80 h-56 sm:h-40 flex-shrink-0 overflow-hidden cursor-pointer snap-start"
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
            ))}
          </div>
        </div>

        {/* Scroll Right Button (Visible on Desktop) */}
        <button
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black/30 p-2 h-40 w-[72px] opacity-0 group-hover:opacity-100 z-50 text-white hover:bg-black/50 transition-opacity duration-300 flex items-center justify-center"
          onClick={scrollRightHandler}
        >
          <FaChevronRight className="transition-transform duration-300 hover:scale-125" size={50} />
        </button>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden w-full overflow-x-auto whitespace-nowrap py-4 no-scrollbar" ref={mobileScrollRef}>
      <div className="flex gap-4 px-4"
      >
  {projects.map((project, index) => (
    <div key={index} className="w-36 flex-shrink-0 relative" onClick={() => setSelectedProject(project)} >
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
