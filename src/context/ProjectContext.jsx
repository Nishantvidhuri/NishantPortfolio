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

// ✅ Import Mobile-Specific Project Images
import AiImageMob from "../assets/projects/mob/aiimagemob.jpeg";
import AngelicSalonMob from "../assets/projects/mob/angelicmob.jpeg";
import CineChronicleMob from "../assets/projects/mob/cinechroniclemob.jpeg";
import YoutubeCloneMob from "../assets/projects/mob/youtubemob.jpeg";
import DevDetectiveMob from "../assets/projects/mob/devdetectivemob.jpeg";
import ExoApeMob from "../assets/projects/mob/exoapemob.jpeg";
import PasswordGeneratorMob from "../assets/projects/mob/passwordgeneratormob.jpeg";
import RecipeBookMob from "../assets/projects/mob/recipebookmob.jpeg";
import SortingVisualizerMob from "../assets/projects/mob/sortingvisualizermob.jpeg";
import TicTacToeMob from "../assets/projects/mob/tictactoemob.jpeg";

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
      imageMob: AiImageMob,
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
      imageMob: AngelicSalonMob,
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
      imageMob: CineChronicleMob,
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
      imageMob: YoutubeCloneMob,
      logo: YoutubeCloneLogo,
      githublink: "https://github.com/Nishantvidhuri/Youtube-Clone",
      livelink: "https://mytube-chi.vercel.app/",
      summary: "A YouTube replica allowing users to search, browse, and watch videos with trending sections, personalized recommendations, and high-quality playback.",
      techUsed: ["React", "Tailwind CSS", "YouTube API", "Vite"],
      genre: "Streaming, Video Platform",
    },
    {
      name: "Recipe Book",
      image: RecipeBook,
      imageMob: RecipeBookMob,
      logo: RecipeBookLogo,
      githublink: "https://github.com/Nishantvidhuri/Recipe-Book",
      livelink: "https://recipe-book-1iz9.vercel.app/",
      summary: "Interactive cooking guide with categorized recipes, ingredient lists, dietary filters, and step-by-step instructions for home chefs.",
      techUsed: ["React", "Spoonacular API", "Tailwind CSS"],
      genre: "Food, Recipe Guide",
    }
  ];

  return <ProjectContext.Provider value={{ projects }}>{children}</ProjectContext.Provider>;
};

// 3️⃣ Create Custom Hook for Easy Access
export const useProjects = () => {
  return useContext(ProjectContext);
};
