import React, { useEffect } from "react";

// ✅ Import Images Properly
import AiImage from "../assets/projects/AiImage.png";
import AngelicSalon from "../assets/projects/AngelicSalon.png";
import CineChronicle from "../assets/projects/CineChronicle.png";
import YoutubeClone from "../assets/projects/Youtube.png";
import DevDetective from "../assets/projects/DevDetective.png";
import ExoApe from "../assets/projects/ExoApe.png";
import PasswordGenerator from "../assets/projects/PasswordGenerator.png";
import RecipeBook from "../assets/projects/RecipeBook.png";
import SortingVisualizer from "../assets/projects/SortingVisualizer.png";
import TicTacToe from "../assets/projects/TicTacToe.png";

// ✅ Import Logos Properly
import AiImageLogo from "../assets/logo/aiimage.png";
import AngelicSalonLogo from "../assets/logo/angelicsalon.png";
import CineChronicleLogo from "../assets/logo/cinechronicle.png";
import YoutubeCloneLogo from "../assets/logo/youtube.png";
import DevDetectiveLogo from "../assets/logo/devdetective.png";
import ExoApeLogo from "../assets/logo/exoape.png";
import PasswordGeneratorLogo from "../assets/logo/passwordgenerator.png";
import RecipeBookLogo from "../assets/logo/recipebook.png";
import SortingVisualizerLogo from "../assets/logo/sortingvisualizer.png";
import TicTacToeLogo from "../assets/logo/tictactoe.png";

// ✅ Function to get correct image & logo from project name
const getProjectImage = (name) => {
  const images = {
    "AI Image Generator": AiImage,
    "Angelic Salon": AngelicSalon,
    "CineChronicle": CineChronicle,
    "YouTube Clone": YoutubeClone,
    "Dev Detective": DevDetective,
    "ExoApe Clone": ExoApe,
    "Password Generator": PasswordGenerator,
    "Recipe Book": RecipeBook,
    "Sorting Visualizer": SortingVisualizer,
    "Tic Tac Toe": TicTacToe,
  };
  return images[name] || "";
};

const getProjectLogo = (name) => {
  const logos = {
    "AI Image Generator": AiImageLogo,
    "Angelic Salon": AngelicSalonLogo,
    "CineChronicle": CineChronicleLogo,
    "YouTube Clone": YoutubeCloneLogo,
    "Dev Detective": DevDetectiveLogo,
    "ExoApe Clone": ExoApeLogo,
    "Password Generator": PasswordGeneratorLogo,
    "Recipe Book": RecipeBookLogo,
    "Sorting Visualizer": SortingVisualizerLogo,
    "Tic Tac Toe": TicTacToeLogo,
  };
  return logos[name] || "";
};

function ProjectDetails({ project, onClose }) {
  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden"; // Disable scrolling
    return () => {
      document.body.style.overflow = "auto"; // Enable scrolling on unmount
    };
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px] z-50 pt-7 px-2 sm:px-0"
      onClick={onClose} // Clicking outside the modal closes it
    >
      <div
        className="bg-[#181818] rounded-sm shadow-lg w-[95%] sm:w-[60%] h-[95%] sm:h-[100%] relative overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 z-50 text-white bg-black rounded-full flex items-center justify-center cursor-pointer"
          onClick={onClose}
        >
          <h1 className="text-md sm:text-lg font-[Nunito]">X</h1>
        </button>

        {/* Project Image */}
        <div className="relative w-full h-[60%]">
          <img
            src={getProjectImage(project.name)} // ✅ FIXED IMAGE PATH
            alt={`${project.name} Background`}
            className="w-full h-full object-cover rounded-t-lg"
          />
          <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-[#181818] to-transparent"></div>
          <h2 className="absolute bottom-20 sm:bottom-20 text-white text-3xl sm:text-5xl font-[Teko] left-5 sm:left-10 font-bold">
            {project.name}
          </h2>

          {/* Buttons (Live Demo & GitHub) */}
          <div className="absolute bottom-5 sm:bottom-1 left-5 sm:left-10 flex gap-4 sm:gap-10">
          <a
              href={project.livelink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white text-black font-semibold w-32 sm:w-36 px-4 py-2 rounded transition"
            >
              <div className="w-4 sm:w-5 h-4">
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
              <span className="text-sm sm:text-md">Live Demo</span>
            </a>
            <a
              href={project.githublink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#716A63] text-white font-semibold w-32 sm:w-40 justify-center h-10 sm:h-12 opacity-60 rounded transition hover:opacity-50"
            >
              <div className="w-6 sm:w-7 h-5">
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
              <span className="text-sm sm:text-lg">GitHub</span>
            </a>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-10 p-4 sm:p-10">
          <p className="text-white text-lg sm:text-base font-[Archivo] w-full sm:w-[60%]">
            {project.summary}
          </p>

          {/* Tech Used & Genre Section */}
          <div className="w-full sm:w-[40%] flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <h3 className="text-sm sm:text-md font-bold font-[Nunito] text-[#777777]">
                Tech Used:
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.techUsed.map((tech, index) => (
                  <span key={index} className="text-white text-sm sm:text-md font-[Nunito] font-bold">
                    {tech}{index !== project.techUsed.length - 1 ? "," : ""}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <h3 className="text-sm sm:text-md font-bold font-[Nunito] text-[#777777]">
                Genre:
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.genre.split(", ").map((genre, index) => (
                  <span key={index} className="text-white text-sm sm:text-md font-[Nunito] font-bold">
                    {genre}{index !== project.genre.split(", ").length - 1 ? "," : ""}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Logo Section */}
        <div className="w-full flex justify-center sm:justify-end pt-12 p-4 sm:pr-20">
          <img
            src={getProjectLogo(project.name)} // ✅ FIXED LOGO PATH
            alt={`${project.name} Logo`}
            className="sm:w-32 h-20 sm:h-32 object-contain -translate-y-0 sm:-translate-y-20"
          />
        </div>
      </div>
    </div>
  );
}

export default ProjectDetails;
