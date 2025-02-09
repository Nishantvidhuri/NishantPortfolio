import { createContext, useContext } from "react";

// ✅ Import Project Images (Correct Way)
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

// ✅ Import Logos (Correct Way)
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
      livelink: "https://aiimage-blue.vercel.app/home",
      summary: "Generates AI-powered images from user inputs with customization options, supporting high-quality output for designers, artists, and content creators.",
      techUsed: ["React", "Tailwind CSS", "OpenAI API"],
      genre: "AI/ML, Image Processing",
    },
    {
      name: "Angelic Salon",
      image: AngelicSalon,
      logo: AngelicSalonLogo,
      githublink: "https://github.com/Nishantvidhuri/Angelic-Salon",
      livelink: "https://angelicsalon.vercel.app/",
      summary: "An online salon booking platform allowing users to browse services, check prices, and schedule appointments with real-time availability tracking.",
      techUsed: ["React", "Tailwind CSS", "Vite", "Express.js"],
      genre: "E-commerce, Booking System",
    },
    {
      name: "CineChronicle",
      image: CineChronicle,
      logo: CineChronicleLogo,
      githublink: "https://github.com/Nishantvidhuri/CineChronicle",
      livelink: "https://cinemachronicle.netlify.app/",
      summary: "An IMDb-like movie database featuring trending films, TV shows, and actor profiles with search, recommendations, and watchlist features.",
      techUsed: ["React", "TMDb API", "Tailwind CSS", "Vite", "Redux"],
      genre: "Entertainment, Movie Database",
    },
    {
      name: "YouTube Clone",
      image: YoutubeClone,
      logo: YoutubeCloneLogo,
      githublink: "https://github.com/Nishantvidhuri/Youtube-Clone",
      livelink: "https://mytube-chi.vercel.app/",
      summary: "A YouTube replica allowing users to search, browse, and watch videos with trending sections, personalized recommendations, and high-quality playback.",
      techUsed: ["React", "Tailwind CSS", "YouTube API", "Vite"],
      genre: "Streaming, Video Platform",
    },
    {
      name: "Dev Detective",
      image: DevDetective,
      logo: DevDetectiveLogo,
      githublink: "https://github.com/Nishantvidhuri/DevDetective",
      livelink: "https://nishantvidhuri.github.io/Dev-Detective/",
      summary: "GitHub profile lookup tool displaying repositories, contributions, follower stats, and activity insights with a sleek and responsive user interface.",
      techUsed: ["React", "GitHub API", "Tailwind CSS"],
      genre: "Developer Tool, API Integration",
    },
    {
      name: "ExoApe Clone",
      image: ExoApe,
      logo: ExoApeLogo,
      githublink: "https://github.com/Nishantvidhuri/exoape-landing-clone",
      livelink: "https://exoape-landing-clone.vercel.app/",
      summary: "A stunning landing page clone featuring modern UI/UX design, smooth animations, and seamless scrolling for an interactive browsing experience.",
      techUsed: ["React", "Tailwind CSS", "Framer Motion"],
      genre: "Landing Page, UI/UX Design",
    },
    {
      name: "Password Generator",
      image: PasswordGenerator,
      logo: PasswordGeneratorLogo,
      githublink: "https://github.com/Nishantvidhuri/Password-Generator",
      livelink: "https://nishantvidhuri.github.io/Password-Generator/",
      summary: "Creates secure, randomized passwords based on user preferences for length, uppercase/lowercase letters, numbers, and special characters.",
      techUsed: ["HTML", "CSS", "JavaScript"],
      genre: "Cybersecurity, Utility Tool",
    },
    {
      name: "Recipe Book",
      image: RecipeBook,
      logo: RecipeBookLogo,
      githublink: "https://github.com/Nishantvidhuri/Recipe-Book",
      livelink: "https://recipe-book-1iz9.vercel.app/",
      summary: "Interactive cooking guide with categorized recipes, ingredient lists, dietary filters, and step-by-step instructions for home chefs.",
      techUsed: ["React", "Spoonacular API", "Tailwind CSS"],
      genre: "Food, Recipe Guide",
    },
    {
      name: "Sorting Visualizer",
      image: SortingVisualizer,
      logo: SortingVisualizerLogo,
      githublink: "https://github.com/Nishantvidhuri/Sortingvisualizer",
      livelink: "https://nishantvidhuri.github.io/Sortingvisualizer/",
      summary: "Educational sorting algorithm visualizer with real-time animations for Bubble, Merge, Quick, and other sorting techniques for learning.",
      techUsed: ["HTML", "CSS", "JavaScript"],
      genre: "Education, Algorithm Visualization",
    },
    {
      name: "Tic Tac Toe",
      image: TicTacToe,
      logo: TicTacToeLogo,
      githublink: "https://github.com/Nishantvidhuri/Tic-Tac-Toe",
      livelink: "https://nishantvidhuri.github.io/Tic-Tac-Toe/",
      summary: "A simple web-based Tic Tac Toe game with real-time game updates, player turns, and win detection for two players.",
      techUsed: ["HTML", "CSS", "JavaScript"],
      genre: "Game, Interactive Web App",
    },
  ];

  return <ProjectContext.Provider value={{ projects }}>{children}</ProjectContext.Provider>;
};

// 3️⃣ Create Custom Hook for Easy Access
export const useProjects = () => {
  return useContext(ProjectContext);
};
