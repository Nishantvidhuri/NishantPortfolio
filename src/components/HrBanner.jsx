import React, { useState } from 'react';
import ContactModal from './ContactModal';
import ProjectDetails from './ProjectDetails';
import { useNavigate } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaEnvelope, FaPlay } from 'react-icons/fa';
import { useProjects } from '../context/ProjectContext';

function HrBanner() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const { projects } = useProjects();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    if (path === 'resume') {
      window.open("https://drive.google.com/file/d/18z0fJm-KOhX3aejFhth5Mh1FvrZJip1x/view?usp=sharing", "_blank");
    } else {
      navigate(`/${path}`);
    }
  };

  return (
    <>
      {/* Netflix-style Hero */}
      <section className="relative w-full h-[70vh] sm:h-[85vh] flex items-end mt-16">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://dev-to-uploads.s3.amazonaws.com/i/jxx4zedqe3hkoysugr5j.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent" />

        {/* Mobile Navigation */}
        <div className="absolute top-4 z-[1000] w-full flex gap-2 px-4 sm:hidden">
          <button onClick={() => handleNavigation('projects')} className="flex-1 py-0.5 border-2 rounded-full border-gray-400 text-gray-300 text-sm hover:bg-white/10 transition-colors">Projects</button>
          <button onClick={() => handleNavigation('about')} className="flex-1 py-0.5 border-2 rounded-full border-gray-400 text-gray-300 text-sm hover:bg-white/10 transition-colors">About Me</button>
          <button onClick={() => handleNavigation('resume')} className="flex-1 py-0.5 border-2 rounded-full border-gray-400 text-gray-300 text-sm hover:bg-white/10 transition-colors">Resume</button>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full px-4 sm:px-10 pb-8 sm:pb-16">
          <div className=" mx-auto">
            <div className="inline-block mb-4">
              <span className="text-[#46d369] font-semibold text-sm tracking-wider uppercase">Portfolio &middot; HR View</span>
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold text-white font-['Teko'] leading-none mb-2">
              NISHANT VIDHURI
            </h1>
            <p className="text-gray-300 text-lg sm:text-xl font-['Poppins'] mb-6 max-w-2xl">
              Frontend Developer. Clean code, responsive design, and modern tech stack.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-4">
              <a
                href="https://drive.google.com/file/d/18z0fJm-KOhX3aejFhth5Mh1FvrZJip1x/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded hover:bg-white/90 transition"
              >
                <FaPlay size={14} />
                <span>View Resume</span>
              </a>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-[#6d6d6e]/80 text-white font-semibold px-6 py-3 rounded hover:bg-[#6d6d6e] transition"
              >
                <FaEnvelope size={16} />
                <span>Contact Me</span>
              </button>
              <a href="https://github.com/Nishantvidhuri" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white transition hover:scale-110">
                <FaGithub size={28} />
              </a>
              <a href="https://www.linkedin.com/in/nishant-vidhuri-092a63124/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white transition hover:scale-110">
                <FaLinkedin size={28} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Row - same cards as Developer page */}
      {projects.length > 0 && (
        <div className="bg-[#141414] py-6 -mt-2">
          <h2 className="ml-4 sm:ml-10 pb-4 text-lg sm:text-xl font-['Poppins'] text-white">
            Featured Projects
          </h2>
          {/* Desktop: landscape cards with Netflix badges */}
          <div className="hidden sm:flex gap-2 px-4 sm:px-10 overflow-x-auto no-scrollbar pb-2">
            {projects.map((project, index) => (
              <div
                key={index}
                onClick={() => setSelectedProject(project)}
                className="relative w-80 h-40 flex-shrink-0 overflow-hidden cursor-pointer"
              >
                <img
                  src={project.image}
                  alt={`${project.name} Background`}
                  className="absolute w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[.5px] z-10" />
                {/* TOP 10 corner badge - ribbon style */}
                {index < 5 && (
                  <div
                    className="absolute top-0 right-0 z-20 bg-red-600 flex flex-col items-center justify-center py-1 px-1.5 min-w-[28px]"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)' }}
                  >
                    <span className="text-white text-[10px] font-bold leading-tight">TOP</span>
                    <span className="text-white text-xs font-bold leading-tight">10</span>
                  </div>
                )}
                <img
                  src={project.logo}
                  alt={`${project.name} Logo`}
                  className="relative z-20 w-20 h-20 object-contain mx-auto mt-3"
                />
                <h1 className="absolute w-full bottom-8 text-center text-white text-lg font-semibold z-20">
                  {project.name}
                </h1>
                {/* Red label at bottom */}
                <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center ">
                  <span className="bg-red-600 px-2 py-1 text-white text-xs font-bold whitespace-nowrap">
                    {index < 3 ? 'Recently added' : 'Featured'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {/* Mobile: vertical cards with Netflix badges */}
          <div className="sm:hidden flex gap-4 px-4 overflow-x-auto no-scrollbar pb-2">
            {projects.map((project, index) => (
              <div
                key={index}
                className="w-36 flex-shrink-0 relative cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <img
                  src={project.imageMob}
                  alt={project.name}
                  className="w-40 h-50 object-cover rounded-xs"
                />
                <div className="absolute inset-0 bg-black/80 rounded-xs" />
                {/* TOP 10 corner badge */}
                {index < 5 && (
                  <div
                    className="absolute top-0 right-0 z-20 bg-red-600 flex flex-col items-center justify-center py-0.5 px-1 min-w-[22px] rounded-bl"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)' }}
                  >
                    <span className="text-white text-[8px] font-bold leading-tight">TOP</span>
                    <span className="text-white text-[10px] font-bold leading-tight">10</span>
                  </div>
                )}
                <img
                  src={project.logo}
                  alt={`${project.name} Logo`}
                  className="absolute bottom-[25%] left-[25%] z-20 w-20 h-20 object-contain"
                />
                <h2 className="absolute bottom-8 font-[teko] left-0 right-0 text-white text-center text-lg font-semibold z-10">
                  {project.name}
                </h2>
                {/* Red label at bottom */}
                <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center">
                  <span className="bg-red-600 px-1.5 text-white text-[10px] font-bold whitespace-nowrap rounded">
                    {index < 3 ? 'Recently added' : 'Featured'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      {selectedProject && (
        <ProjectDetails project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </>
  );
}

export default HrBanner;
