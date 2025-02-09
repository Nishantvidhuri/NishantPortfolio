import React, { useEffect, useState } from "react";
import { useProjects } from "../context/ProjectContext"; // Import the context hook

function FirstSectionHome() {
  const { projects } = useProjects();
  const [randomIndex, setRandomIndex] = useState(0);

  useEffect(() => {
    if (projects.length > 0) {
      const randomNumber = Math.floor(Math.random() * projects.length);
      setRandomIndex(randomNumber);
    }
  }, [projects.length]);

  if (projects.length === 0) {
    return (
      <div className="text-white text-center p-10">Loading projects...</div>
    );
  }

  return (
    <div className="w-full relative text-white overflow-hidden">
      {/* PC/Laptop View */}
      <div
        className="hidden sm:flex flex-col justify-end p-4 w-full h-screen"
        style={{
          backgroundImage: `url(${projects[randomIndex].image})`, // ✅ Fix Here
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        {/* Content */}
        <div className="relative z-10 mb-10 sm:mb-20 md:mb-[125px] ml-2 sm:ml-4 md:ml-[40px] translate-y-6 sm:translate-y-10 md:translate-y-20">
          {/* Logo */}
          <img
            src={projects[randomIndex].logo} // ✅ Fix Here
            alt={`${projects[randomIndex].name} Logo`}
            className="w-28 sm:w-36 md:w-60 h-20 sm:h-28 md:h-40 mb-4 object-contain"
          />

          {/* Project Name */}
          <h2 className="w-full max-w-[500px] pb-1 pt-3 sm:pt-5 md:pt-10 font-[teko] text-2xl sm:text-3xl md:text-5xl">
            {projects[randomIndex].name}
          </h2>

          {/* Project Summary */}
          <h2 className="w-full max-w-[500px] pb-4 sm:pb-6 md:pb-10 font-jakarta text-sm sm:text-base md:text-lg">
            {projects[randomIndex].summary}
          </h2>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <a
              href={projects[randomIndex].livelink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white text-black font-semibold px-3 sm:px-4 py-2 sm:py-3 rounded transition"
            >
              <span className="text-sm text-black sm:text-md">Live Demo</span>
            </a>

            <a
              href={projects[randomIndex].githublink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#716A63] text-white font-semibold w-28 sm:w-32 md:w-40 justify-center h-10 sm:h-12 opacity-60 rounded transition hover:opacity-50"
            >
              <span className="text-sm sm:text-lg">GitHub</span>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="flex sm:hidden flex-col items-center justify-center w-full h-[700px] p-6 bg-[#141414] relative">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${projects[randomIndex].image})`, // ✅ Fix Here
          }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        </div>

        {/* Navigation Buttons */}
        <div className="absolute top-16 left-8 flex gap-4 text-xl">
          <button className="w-30 py-0.5 border-2 rounded-full border-gray-300 text-gray-300">
            Projects
          </button>
          <button className="w-30 py-0.5 border-2 rounded-full border-gray-300 text-gray-300">
            Skills
          </button>
          <button className="w-30 py-0.5 border-2 rounded-full border-gray-300 text-gray-300">
            Resume
          </button>
        </div>

        {/* Project Content */}
        <div className="relative w-[90%] h-[90%] translate-y-14 flex flex-col items-center justify-center text-center">
          {/* Project Logo */}
          <img
            src={projects[randomIndex].logo} // ✅ Fix Here
            alt={`${projects[randomIndex].name} Logo`}
            className="w-60 absolute top-[20%] mb-4 object-contain"
          />

          {/* Project Name */}
          <h2 className="text-5xl absolute top-[70%] font-[Teko] text-white">
            {projects[randomIndex].name}
          </h2>
          <div className="flex">
           
            <h2 className="text-lg w-full absolute left-0 top-[78%]  text-gray-500">
            {projects[randomIndex].genre}
            </h2>
          </div>
          {/* Buttons */}
          <div className="flex gap-4 absolute top-[85%]">
            <a
              href={projects[randomIndex].livelink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white text-black font-semibold w-40 justify-center px-3 py-2 rounded transition"
            >
              <span className="text-sm text-black">Live Demo</span>
            </a>

            <a
              href={projects[randomIndex].githublink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#716A66] text-white font-semibold w-44 justify-center h-10 opacity-60 rounded transition hover:opacity-50"
            >
              <span className="text-sm">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FirstSectionHome;
