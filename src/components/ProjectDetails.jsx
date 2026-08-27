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
import Recriview from "../assets/projects/recriview.jpeg";

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
import RecriviewLogo from "../assets/logo/recrivio.png";

// ✅ Function to get correct image & logo from project name
const getProjectImage = (name) => {
  const images = {
    "Recriview": Recriview,
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
    "Recriview": RecriviewLogo,
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
        className="bg-[#181818] rounded-md shadow-2xl w-[95%] sm:w-[75%] sm:max-w-[1200px] h-auto max-h-[95%] relative overflow-y-auto no-scrollbar flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Close Button (stays pinned while modal scrolls) */}
        <div className="sticky top-0 z-50 h-0">
          <button
            className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 text-white bg-[#181818] rounded-full flex items-center justify-center cursor-pointer"
            onClick={onClose}
          >
            <h1 className="text-md sm:text-lg font-[Nunito]">X</h1>
          </button>
        </div>

        {/* Project Image */}
        <div className="relative w-full shrink-0 h-[280px] sm:h-[520px]">
          <img
            src={getProjectImage(project.name)} // ✅ FIXED IMAGE PATH
            alt={`${project.name} Background`}
            className="w-full h-full object-cover rounded-t-lg"
          />
          <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-[#181818] to-transparent"></div>

          {/* Title block over the backdrop */}
          <div className="absolute left-5 sm:left-10 bottom-20 sm:bottom-24 z-10">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <span className="font-['Bebas_Neue'] text-[#e50914] text-xl sm:text-2xl leading-none">N</span>
              <span className="text-gray-300 text-[9px] sm:text-[11px] tracking-[0.4em] font-semibold">PROJECT</span>
            </div>
            <h2 className="text-white text-4xl sm:text-6xl font-['Bebas_Neue'] tracking-wide drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
              {project.name}
            </h2>
          </div>

          {/* Buttons (Live Demo & GitHub) */}
          <div className="absolute bottom-5 sm:bottom-1 left-5 sm:left-10 flex items-center gap-4 sm:gap-10">
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
              className="flex items-center gap-2 bg-[rgba(109,109,110,0.7)] text-white font-semibold w-32 sm:w-40 justify-center h-10 sm:h-12 rounded transition hover:bg-[rgba(109,109,110,0.4)]"
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

          {/* Project logo at the right of the buttons */}
          <img
            src={getProjectLogo(project.name)}
            alt={`${project.name} Logo`}
            className="absolute right-5 sm:right-10 bottom-5 sm:bottom-1 h-16 sm:h-28 object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
          />
        </div>

        {/* Netflix metadata row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 sm:px-10 pt-4 sm:pt-5 text-sm sm:text-base">
          <span className="text-[#46d369] font-semibold">98% Match</span>
          <span className="text-gray-400">2026</span>
          <span className="border border-gray-500 text-gray-300 text-[10px] px-1.5 rounded-sm leading-4">HD</span>
        </div>

        {/* Content Section */}
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-10 px-4 sm:px-10 py-4 sm:py-6">
          <p className="text-white text-base font-[Archivo] w-full sm:w-[60%] leading-relaxed">
            {project.summary}
          </p>

          {/* Tech Used & Genre Section — Netflix "Cast:" style */}
          <div className="w-full sm:w-[40%] flex flex-col gap-3 text-sm">
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              <h3 className="text-[#777777] font-[Nunito]">
                Tech Used:
              </h3>
              {project.techUsed.map((tech, index) => (
                <span key={index} className="text-white font-[Nunito]">
                  {tech}{index !== project.techUsed.length - 1 ? "," : ""}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-x-2 gap-y-1">
              <h3 className="text-[#777777] font-[Nunito]">
                Genre:
              </h3>
              {project.genre.split(", ").map((genre, index) => (
                <span key={index} className="text-white font-[Nunito]">
                  {genre}{index !== project.genre.split(", ").length - 1 ? "," : ""}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ProjectDetails;
