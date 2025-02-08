import React, { useEffect, useState } from "react";
import { useProjects } from "../context/ProjectContext"; // Import the context hook

function FirstSectionHome() {
  const { projects } = useProjects(); // Fetch project data from context
  const [randomIndex, setRandomIndex] = useState(0); // Default index

  useEffect(() => {
    const randomNumber = Math.floor(Math.random() * 4);
    setRandomIndex(randomNumber);
  }, [projects.length]);

  return (
    <div
      className="w-full min-h-screen relative flex flex-col justify-end p-4 text-white overflow-hidden"
      style={{
        backgroundImage: `url(/src/assets/projects/${projects[randomIndex].image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay with Blur Effect */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs"></div>

      {/* Content */}
      <div className="relative z-10 mb-20 md:mb-[125px] ml-4 md:ml-[40px] translate-y-10 md:translate-y-20">
        {/* Logo Image */}
        <img
          src={`/src/assets/logo/${projects[randomIndex].image}`}
          alt={`${projects[randomIndex].name} Logo`}
          className="w-40 md:w-60 h-28 md:h-40 mb-4 object-contain"
        />

        {/* Project Name */}
        <h2 className="w-full max-w-[600px] pb-1 pt-5 md:pt-10 font-[teko] text-3xl md:text-5xl text-white">
          {projects[randomIndex].name}
        </h2>

        {/* Project Summary */}
        <h2 className="w-full max-w-[600px] pb-6 md:pb-10 font-jakarta text-white text-base md:text-lg">
          {projects[randomIndex].summary}
        </h2>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-6">
          <a
            href={projects[randomIndex].livelink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white text-black font-semibold px-3 md:px-4 py-2 rounded-xs transition"
          >
            <div className="w-5 h-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                role="img"
                viewBox="0 0 24 24"
                width="24"
                height="18"
                aria-hidden="true"
                className="text-black"
              >
                <path
                  d="M5 2.69127C5 1.93067 5.81547 1.44851 6.48192 1.81506L23.4069 11.1238C24.0977 11.5037 24.0977 12.4963 23.4069 12.8762L6.48192 22.1849C5.81546 22.5515 5 22.0693 5 21.3087V2.69127Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <span className="text-black text-sm md:text-md">Live Demo</span>
          </a>

          <a
            href={projects[randomIndex].githublink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#716A63] text-white font-semibold w-32 md:w-40 justify-center h-10 md:h-12 opacity-60 rounded-xs transition hover:opacity-50"
          >
            <div className="w-6 md:w-7 h-4 md:h-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                role="img"
                viewBox="0 0 24 24"
                width="24"
                height="22"
                aria-hidden="true"
                className="text-white"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12ZM13 10V18H11V10H13ZM12 8.5C12.8284 8.5 13.5 7.82843 13.5 7C13.5 6.17157 12.8284 5.5 12 5.5C11.1716 5.5 10.5 6.17157 10.5 7C10.5 7.82843 11.1716 8.5 12 8.5Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <span className="text-sm md:text-lg">GitHub</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default FirstSectionHome;
