import { createContext, useContext } from "react";

// 1️⃣ Create Context
const ProjectContext = createContext();

// 2️⃣ Create Provider Component
export const ProjectProvider = ({ children }) => {
  const projects = [
    {
      name: "AI Image Generator",
      image: "AiImage.png",
      logo: "../assets/logo/aiimage.png",
      githublink: "https://github.com/Nishantvidhuri/AI-Image",
      livelink: "https://your-ai-image-project.vercel.app/",
      summary: "This AI-powered image generator uses deep learning models to create unique visuals. Users can input parameters to generate customized images for various applications, such as marketing, design, and art. The platform features real-time rendering, an interactive UI, and supports high-resolution outputs for diverse use cases in creative fields.",
      techUsed: ["React", "Tailwind CSS", "OpenAI API"],
      genre: "AI/ML, Image Processing"
    },
    {
      name: "Angelic Salon",
      image: "AngelicSalon.png",
      logo: "../assets/logo/angelicsalon.png",
      githublink: "https://github.com/Nishantvidhuri/Angelic-Salon",
      livelink: "https://angelicsalon.vercel.app/",
      summary: "Angelic Salon is an online beauty service booking platform. Users can explore services, check pricing, and schedule appointments easily. The website provides a seamless booking experience, integrates real-time availability, and offers notifications. The minimalistic UI ensures smooth navigation, making it ideal for customers to explore, book, and manage appointments effortlessly.",
      techUsed: ["React", "Tailwind CSS","Vite", "Express.js"],
      genre: "E-commerce, Booking System"
    },
    {
      name: "CineChronicle",
      image: "cinechronicle.png",
      logo: "../assets/logo/cinechronicle.png",
      githublink: "https://github.com/Nishantvidhuri/CineChronicle",
      livelink: "https://cinemachronicle.netlify.app/",
      summary: "CineChronicle is an IMDb-like movie database showcasing trending films, TV shows, and celebrity profiles. Users can browse categories, search for movies, view cast details, watch trailers, and read reviews. The platform integrates a recommendation system, ensuring users discover relevant entertainment content based on their preferences and recent viewing history.",
      techUsed: ["React", "TMDb API", "Tailwind CSS", "Vite","Redux"],
      genre: "Entertainment, Movie Database"
    },
    {
      name: "YouTube Clone",
      image: "Youtube.png",
      logo: "/src/assets/logo/youtube.png",
      githublink: "https://github.com/Nishantvidhuri/Youtube-Clone",
      livelink: "https://mytube-chi.vercel.app/",
      summary: "This YouTube clone replicates core YouTube functionalities, allowing users to browse, search, and watch videos seamlessly. The platform features trending sections, personalized recommendations, and an intuitive UI. Users can explore different video categories, access high-quality playback, and navigate through an optimized interface that closely mirrors YouTube’s user experience.",
      techUsed: ["React", "Tailwind CSS", "YouTube API", "Vite"],
      genre: "Streaming, Video Platform"
    },
    {
      name: "Dev Detective",
      image: "DevDetective.png",
      logo: "../assets/logo/devdetective.png",
      githublink: "https://github.com/Nishantvidhuri/DevDetective",
      livelink: "https://dev-detective.vercel.app/",
      summary: "Dev Detective is a GitHub profile lookup tool that retrieves public repositories, follower stats, and activity insights. Users can search any GitHub username to analyze contributions, pinned repositories, and languages used. The sleek UI and real-time API integration make it a valuable tool for developers and recruiters alike.",
      techUsed: ["React", "GitHub API", "Tailwind CSS"],
      genre: "Developer Tool, API Integration"
    },
    {
      name: "ExoApe Clone",
      image: "ExoApe.png",
      logo: "../assets/logo/exoape.png",
      githublink: "https://github.com/Nishantvidhuri/exoape-landing-clone",
      livelink: "https://exoape-landing-clone.vercel.app/",
      summary: "ExoApe Clone is a visually stunning landing page replication built with modern animations and smooth scrolling effects. The page showcases a dynamic interface, sleek transitions, and pixel-perfect responsiveness. Designed for UI/UX enthusiasts, it demonstrates advanced front-end skills by mimicking the original ExoApe experience with high-performance animations and interactions.",
      techUsed: ["React", "Tailwind CSS", "Framer Motion"],
      genre: "Landing Page, UI/UX Design"
    },
    {
      name: "Password Generator",
      image: "PasswordGenerator.png",
      logo: "../assets/logo/passwordgenerator.png",
      githublink: "https://github.com/Nishantvidhuri/Password-Generator",
      livelink: "https://nishantvidhuri.github.io/Password-Generator/",
      summary: "This Password Generator provides strong, randomized passwords based on user-defined criteria. Users can specify length, uppercase/lowercase letters, numbers, and symbols to enhance security. The generator ensures robust protection against cyber threats by creating unique, hard-to-guess passwords tailored to personal or corporate cybersecurity needs. Instant password generation enhances convenience.",
      techUsed: ["HTML", "CSS", "JavaScript"],
      genre: "Cybersecurity, Utility Tool"
    },
    {
      name: "Recipe Book",
      image: "RecipeBook.png",
      logo: "../assets/logo/recipebook.png",
      githublink: "https://github.com/Nishantvidhuri/Recipe-Book",
      livelink: "https://recipe-book.vercel.app/",
      summary: "The Recipe Book is an interactive cooking guide featuring categorized recipes, ingredient lists, and step-by-step cooking instructions. Users can explore different cuisines, filter recipes based on dietary preferences, and save favorites. The intuitive design, real-time search, and organized layout ensure a seamless experience for home chefs and cooking enthusiasts.",
      techUsed: ["React", "Spoonacular API", "Tailwind CSS"],
      genre: "Food, Recipe Guide"
    },
    {
      name: "Sorting Visualizer",
      image: "SortingVisualizer.png",
      logo: "../assets/logo/sortingvisualizer.png",
      githublink: "https://github.com/Nishantvidhuri/Sortingvisualizer",
      livelink: "https://nishantvidhuri.github.io/Sortingvisualizer/",
      summary: "This Sorting Visualizer helps users understand sorting algorithms through graphical representations. It includes Bubble Sort, Merge Sort, Quick Sort, and more. The real-time visual feedback enables students and programmers to grasp algorithm efficiency, runtime complexities, and sorting principles in an interactive and engaging manner using animated bar representations.",
      techUsed: ["HTML", "CSS", "JavaScript"],
      genre: "Education, Algorithm Visualization"
    },
    {
      name: "Tic Tac Toe",
      image: "tictactoe.png",
      logo: "../assets/logo/tictactoe.png",
      githublink: "https://github.com/Nishantvidhuri/Tic-Tac-Toe",
      livelink: "https://nishantvidhuri.github.io/Tic-Tac-Toe/",
      summary: "Tic Tac Toe is a simple yet engaging two-player game. Players take turns placing 'X' and 'O' on a 3x3 grid, aiming to align three symbols. The interactive UI provides real-time game updates, win detection, and replay functionality, making it a great web-based implementation of this classic game.",
      techUsed: ["HTML", "CSS", "JavaScript"],
      genre: "Game, Interactive Web App"
    }
  ];

  return (
    <ProjectContext.Provider value={{ projects }}>
      {children}
    </ProjectContext.Provider>
  );
};

// 3️⃣ Create Custom Hook for Easy Access
export const useProjects = () => {
  return useContext(ProjectContext);
};
