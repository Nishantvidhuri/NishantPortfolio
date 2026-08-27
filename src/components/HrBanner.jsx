import React, { useState, useEffect } from 'react';
import ContactModal from './ContactModal';
import { useNavigate } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaPlay, FaInfoCircle } from 'react-icons/fa';

// Import project images
import aiimage from '../assets/projects/mob/aiimagemob.jpeg';
import angelic from '../assets/projects/mob/angelicmob.jpeg';
import cinechronicle from '../assets/projects/mob/cinechroniclemob.jpeg';
import devdetective from '../assets/projects/mob/devdetectivemob.jpeg';
import exoape from '../assets/projects/mob/exoapemob.jpeg';
import passwordgenerator from '../assets/projects/mob/passwordgeneratormob.jpeg';
import recipebook from '../assets/projects/mob/recipebookmob.jpeg';
import sortingvisualizer from '../assets/projects/mob/sortingvisualizermob.jpeg';
import tictactoe from '../assets/projects/mob/tictactoemob.jpeg';
import youtube from '../assets/projects/mob/youtubemob.jpeg';

function HrBanner() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  const projectImages = [
    { src: aiimage, name: 'AI Image Generator' },
    { src: angelic, name: 'Angelic Store' },
    { src: cinechronicle, name: 'Cine Chronicle' },
    { src: devdetective, name: 'Dev Detective' },
    { src: exoape, name: 'Exoape Portfolio' },
    { src: passwordgenerator, name: 'Password Generator' },
    { src: recipebook, name: 'Recipe Book' },
    { src: sortingvisualizer, name: 'Sorting Visualizer' },
    { src: tictactoe, name: 'Tic Tac Toe' },
    { src: youtube, name: 'YouTube Clone' }
  ];

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % projectImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [projectImages.length]);

  // Calculate carousel item positions
  const getCarouselStyles = (index) => {
    let offset = index - currentImageIndex;
    
    // Handle circular carousel
    if (offset < -Math.floor(projectImages.length / 2)) {
      offset += projectImages.length;
    } else if (offset > Math.floor(projectImages.length / 2)) {
      offset -= projectImages.length;
    }

    const absOffset = Math.abs(offset);
    const isActive = offset === 0;
    const baseScale = isMobile ? 0.7 : 0.8;
    const translateX = isMobile ? 35 : 45;

    return {
      transform: `
        translateX(${offset * translateX}%) 
        scale(${baseScale + (isActive ? 0.2 : 0)})
        translateZ(${-absOffset * 50}px)
      `,
      zIndex: projectImages.length - absOffset,
      opacity: Math.max(0, 1 - absOffset * 0.3),
      filter: `brightness(${1 - absOffset * 0.2})`,
    };
  };

  const handleNavigation = (path) => {
    if (path === 'resume') {
      // Open resume in new tab
      window.open("https://drive.google.com/file/d/1mYm-u_piUtMuNP4_kEem3QelcAqDZB4I/view?usp=sharing", "_blank");
    } else {
      // Navigate to internal routes
      navigate(`/${path}`);
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-64px)] w-full mt-16">
      {/* Background Elements - Adjusted opacity and gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.03]"

      />
      {/* Netflix billboard fade into the rows below */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent pointer-events-none" />
    
      {/* Mobile Navigation Buttons */}
      <div className="absolute top-4 z-[1000] w-full  flex gap-4 text-xl sm:hidden">
          <button 
            onClick={() => handleNavigation('projects')}
            className="w-[30%] py-0.5 border-2 rounded-full border-gray-300 text-gray-300 hover:bg-white/10 transition-colors"
          >
            Projects
          </button>
          <button 
            onClick={() => handleNavigation('about')}
            className="w-[30%] py-0.5 border-2 rounded-full border-gray-300 text-gray-300 hover:bg-white/10 transition-colors"
          >
            About Me
          </button>
          <button 
            onClick={() => handleNavigation('resume')}
            className="w-[30%] py-0.5 border-2 rounded-full border-gray-300 text-gray-300 hover:bg-white/10 transition-colors"
          >
            Resume
          </button>
        </div>

      {/* Content Container */}
      <div className="container mx-auto px-4 h-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between h-full py-20 lg:py-20">
          {/* Text Content — Netflix title billboard */}
          <div className="w-full lg:w-1/2 text-center lg:ml-10  lg:text-left space-y-5 relative">
            {/* N SERIES tag */}
            <div className="flex items-center gap-2 justify-center lg:justify-start">
              <span className="font-['Bebas_Neue'] text-[#e50914] text-3xl leading-none">N</span>
              <span className="text-gray-400 text-xs md:text-sm tracking-[0.4em] font-semibold">PORTFOLIO SERIES</span>
            </div>

            {/* Show title */}
            <h1 className="font-['Bebas_Neue'] text-6xl sm:text-7xl md:text-8xl text-white leading-[0.9] tracking-wide drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
              Nishant
              <br />
              Vidhuri
            </h1>

            {/* Netflix metadata row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 justify-center lg:justify-start text-sm md:text-base">
              <span className="text-[#46d369] font-semibold">98% Match</span>
              <span className="text-gray-400">2026</span>
              <span className="border border-gray-500 text-gray-300 text-[10px] px-1.5 rounded-sm leading-4">HD</span>
              <span className="text-gray-300 font-medium">Frontend Developer</span>
            </div>

            {/* Genre tags */}
            <div className="text-sm text-gray-400 flex flex-wrap gap-x-2 justify-center lg:justify-start">
              <span>React</span><span className="text-gray-600">•</span>
              <span>Tailwind</span><span className="text-gray-600">•</span>
              <span>Redux</span><span className="text-gray-600">•</span>
              <span>Three.js</span>
            </div>

            <p className="text-base md:text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-['Inter']">
              I design and develop responsive, user-friendly websites with clean and efficient code.
              My focus is on creating smooth interactions, optimized performance, and visually appealing
              interfaces that work seamlessly across all devices.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
              {/* Play-style primary → Resume */}
              <button
                onClick={() => handleNavigation('resume')}
                className="flex items-center justify-center gap-3 bg-white text-black font-semibold px-8 py-3 rounded w-full sm:w-auto hover:bg-white/80 transition-colors"
              >
                <FaPlay size={16} />
                Resume
              </button>

              {/* More Info-style secondary → Contact modal */}
              <button
                onClick={() => setIsModalOpen(true)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="flex items-center justify-center gap-3 bg-[rgba(109,109,110,0.7)] text-white font-semibold px-8 py-3 rounded w-full sm:w-auto hover:bg-[rgba(109,109,110,0.4)] transition-colors"
              >
                <FaInfoCircle size={18} className={`transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`} />
                {isMobile ? 'Tap to Contact' : 'Contact Me'}
              </button>

              <div className="flex gap-6">
                <a
                  href="https://github.com/Nishantvidhuri"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-red-500 transition-all duration-300 hover:scale-110"
                >
                  <FaGithub color='white' size={24} />
                </a>
                <a
                  href="https://www.linkedin.com/in/nishant-vidhuri-092a63124/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-red-500 transition-all duration-300 hover:scale-110"
                >
                  <FaLinkedin color='white' size={24} />
                </a>
              </div>
            </div>
          </div>

          {/* Project Carousel */}
          <div className="w-full lg:w-1/2 h-[300px] md:h-[500px]  mt-12 lg:mt-0">
            <div className="relative w-full h-full flex items-center justify-center perspective-[1000px]">
              {projectImages.map((project, index) => (
                <div
                  key={index}
                  className="absolute w-[200px] md:w-[250px] cursor-pointer transition-all duration-500"
                  style={getCarouselStyles(index)}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg overflow-hidden shadow-2xl border border-white/10">
                    <div className="relative aspect-[3/4]">
                      <img
                        src={project.src}
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/50 to-transparent pt-8">
                        <h3 className="text-white text-center py-2 px-3 text-sm font-medium">
                          {project.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  


      <ContactModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  );
}

export default HrBanner; 