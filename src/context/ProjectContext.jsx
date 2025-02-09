import { createContext, useContext } from "react";

// ✅ Import Project Images
import AiImage from "../assets/projects/AiImage.png";
import AngelicSalon from "../assets/projects/AngelicSalon.png";
import CineChronicle from "../assets/projects/cinechronicle.png";
import YoutubeClone from "../assets/projects/Youtube.png";
import DevDetective from "../assets/projects/DevDetective.png";
import ExoApe from "../assets/projects/ExoApe.png";
import PasswordGenerator from "../assets/projects/PasswordGenerator.png";
import RecipeBook from "../assets/projects/RecipeBook.png";
import SortingVisualizer from "../assets/projects/SortingVisualizer.png";
import TicTacToe from "../assets/projects/tictactoe.png";

// ✅ Import Project Logos
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

// 1️⃣ Create Context
const ProjectContext = createContext();

// 2️⃣ Create Provider Component
export const ProjectProvider = ({ children }) => {
  const projects = [
    {
      name: "AI Image Generator",
      image: AiImage,
      logo: AiImageLogo,
      githublink: "https://github.com/Nishantvidhuri/AI-Image",
      livelink: "https://your-ai-image-project.vercel.app/",
      summary: "This AI-powered image generator uses deep learning models to create unique visuals...",
      techUsed: ["React", "Tailwind CSS", "OpenAI API"],
      genre: "AI/ML, Image Processing"
    },
    {
      name: "Angelic Salon",
      image: AngelicSalon,
      logo: AngelicSalonLogo,
      githublink: "https://github.com/Nishantvidhuri/Angelic-Salon",
      livelink: "https://angelicsalon.vercel.app/",
      summary: "Angelic Salon is an online beauty service booking platform...",
      techUsed: ["React", "Tailwind CSS", "Vite", "Express.js"],
      genre: "E-commerce, Booking System"
    },
    {
      name: "CineChronicle",
      image: CineChronicle,
      logo: CineChronicleLogo,
      githublink: "https://github.com/Nishantvidhuri/CineChronicle",
      livelink: "https://cinemachronicle.netlify.app/",
      summary: "CineChronicle is an IMDb-like movie database showcasing trending films...",
      techUsed: ["React", "TMDb API", "Tailwind CSS", "Vite", "Redux"],
      genre: "Entertainment, Movie Database"
    },
    {
      name: "YouTube Clone",
      image: YoutubeClone,
      logo: YoutubeCloneLogo,
      githublink: "https://github.com/Nishantvidhuri/Youtube-Clone",
      livelink: "https://mytube-chi.vercel.app/",
      summary: "This YouTube clone replicates core YouTube functionalities...",
      techUsed: ["React", "Tailwind CSS", "YouTube API", "Vite"],
      genre: "Streaming, Video Platform"
    },
    {
      name: "Dev Detective",
      image: DevDetective,
      logo: DevDetectiveLogo,
      githublink: "https://github.com/Nishantvidhuri/DevDetective",
      livelink: "https://dev-detective.vercel.app/",
      summary: "Dev Detective is a GitHub profile lookup tool...",
      techUsed: ["React", "GitHub API", "Tailwind CSS"],
      genre: "Developer Tool, API Integration"
    },
    {
      name: "ExoApe Clone",
      image: ExoApe,
      logo: ExoApeLogo,
      githublink: "https://github.com/Nishantvidhuri/exoape-landing-clone",
      livelink: "https://exoape-landing-clone.vercel.app/",
      summary: "ExoApe Clone is a visually stunning landing page...",
      techUsed: ["React", "Tailwind CSS", "Framer Motion"],
      genre: "Landing Page, UI/UX Design"
    },
    {
      name: "Password Generator",
      image: PasswordGenerator,
      logo: PasswordGeneratorLogo,
      githublink: "https://github.com/Nishantvidhuri/Password-Generator",
      livelink: "https://nishantvidhuri.github.io/Password-Generator/",
      summary: "This Password Generator provides strong, randomized passwords...",
      techUsed: ["HTML", "CSS", "JavaScript"],
      genre: "Cybersecurity, Utility Tool"
    },
    {
      name: "Recipe Book",
      image: RecipeBook,
      logo: RecipeBookLogo,
      githublink: "https://github.com/Nishantvidhuri/Recipe-Book",
      livelink: "https://recipe-book.vercel.app/",
      summary: "The Recipe Book is an interactive cooking guide...",
      techUsed: ["React", "Spoonacular API", "Tailwind CSS"],
      genre: "Food, Recipe Guide"
    },
    {
      name: "Sorting Visualizer",
      image: SortingVisualizer,
      logo: SortingVisualizerLogo,
      githublink: "https://github.com/Nishantvidhuri/Sortingvisualizer",
      livelink: "https://nishantvidhuri.github.io/Sortingvisualizer/",
      summary: "This Sorting Visualizer helps users understand sorting algorithms...",
      techUsed: ["HTML", "CSS", "JavaScript"],
      genre: "Education, Algorithm Visualization"
    },
    {
      name: "Tic Tac Toe",
      image: TicTacToe,
      logo: TicTacToeLogo,
      githublink: "https://github.com/Nishantvidhuri/Tic-Tac-Toe",
      livelink: "https://nishantvidhuri.github.io/Tic-Tac-Toe/",
      summary: "Tic Tac Toe is a simple yet engaging two-player game...",
      techUsed: ["HTML", "CSS", "JavaScript"],
      genre: "Game, Interactive Web App"
    }
  ];

  return <ProjectContext.Provider value={{ projects }}>{children}</ProjectContext.Provider>;
};

// 3️⃣ Create Custom Hook for Easy Access
export const useProjects = () => {
  return useContext(ProjectContext);
};
