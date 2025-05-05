import React from 'react';
import Navbar from '../components/Navbar';
import { FaGithub, FaLinkedin, FaEnvelope, FaMapMarkerAlt, FaPhone, FaExternalLinkAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
function About() {
  const navigate = useNavigate();
  const handleNavigation = (path) => {
    if (path === 'resume') {
      // Open resume in new tab
      window.open("https://drive.google.com/file/d/18z0fJm-KOhX3aejFhth5Mh1FvrZJip1x/view?usp=sharing", "_blank");
    } else {
      // Navigate to internal routes
      navigate(`/${path}`);
    }
  };
  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />
      <div className="absolute z-[1000] top-20 w-full flex gap-4 text-xl px-4 md:hidden">
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
      {/* Hero Section */}
      <div className="relative pt-32 pb-16 px-4 md:px-12">
        
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 md:gap-12 mb-12">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white font-['Poppins']">
                Nishant Vidhuri
              </h1>
              <div className="flex items-center gap-2 text-gray-400">
                <FaMapMarkerAlt />
                <span>New Delhi, India</span>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="flex flex-wrap gap-4 text-gray-400">
              <a href="tel:+919871202673" className="flex items-center gap-2 hover:text-white transition-colors">
                <FaPhone />
                <span>+91 9871202673</span>
              </a>
              <a href="mailto:nishantvidhuri0987@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <FaEnvelope />
                <span>nishantvidhuri0987@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Education & Experience Section */}
              <section className="bg-[#1a1a1a] rounded-lg p-6 space-y-8 hover:bg-[#1f1f1f] transition-colors duration-300">
                <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                  Education & Experience
                  <div className="flex-grow h-[1px] bg-gradient-to-r from-red-600 to-transparent ml-4"></div>
                </h2>
                <div className="space-y-6">
                  {/* Vox Gauge Experience */}
                  <div className="group relative bg-[#141414] rounded-lg p-5 hover:bg-[#1a1a1a] transition-all duration-300 transform hover:scale-[1.02] border border-gray-800 hover:border-red-600/50">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                    <div className="relative space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="bg-white/5 p-2 rounded-lg group-hover:bg-white/10 transition-colors duration-300">
                          <img 
                            src="https://framerusercontent.com/images/5MwGErH8PsYI9enHWzWZJRF7kJ4.svg?scale-down-to=512" 
                            alt="Vox Gauge Logo" 
                            className="w-10 h-10 object-contain filter brightness-0 invert"
                          />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors duration-300">
                            Frontend Developer
                          </h3>
                          <p className="text-lg text-gray-400 group-hover:text-white transition-colors duration-300">
                            Vox Gauge
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="px-3 py-1 bg-red-600/10 text-red-500 rounded-full">
                          Frontend Development
                        </span>
                        <span className="text-gray-400">
                          Feb 2025 - Present
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Education Items */}
                  <div className="space-y-6">
                    <div className="bg-[#141414] p-5 rounded-lg hover:bg-[#1a1a1a] transition-all duration-300 transform hover:translate-x-2">
                      <h3 className="text-lg font-semibold text-white mb-2">B.Tech (A.K.T.U)</h3>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-red-600/10 text-red-500 rounded-full text-sm">
                          7.4 CGPA
                        </span>
                        <span className="text-gray-400 text-sm">
                          Graduated Oct 2023
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#141414] p-5 rounded-lg hover:bg-[#1a1a1a] transition-all duration-300 transform hover:translate-x-2">
                      <h3 className="text-lg font-semibold text-white mb-2">St. Mary's Christian Public School</h3>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-red-600/10 text-red-500 rounded-full text-sm">
                          12th Grade (C.B.S.E)
                        </span>
                        <span className="text-gray-400 text-sm">
                          Aug 2019
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#141414] p-5 rounded-lg hover:bg-[#1a1a1a] transition-all duration-300 transform hover:translate-x-2">
                      <h3 className="text-lg font-semibold text-white mb-2">Sidhharth International Public School</h3>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-red-600/10 text-red-500 rounded-full text-sm">
                          10th Grade (C.B.S.E)
                        </span>
                        <span className="text-gray-400 text-sm">
                          Aug 2017
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Skills Section */}
              <section className="bg-[#1a1a1a] rounded-lg p-6 space-y-6">
                <h2 className="text-2xl font-semibold text-white">Technical Skills</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg text-white mb-2">Proficient In</h3>
                    <div className="flex flex-wrap gap-2">
                      {['C++', 'HTML', 'CSS (Tailwind)', 'JavaScript', 'React', 'REST API', 'Redux', 'SQL'].map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-red-600/10 text-red-500 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg text-white mb-2">Familiar With</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Computer Networks', 'Operating Systems', 'DBMS'].map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-gray-800 text-gray-400 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Certificates Section */}
              <section className="bg-[#1a1a1a] rounded-lg p-6 space-y-6">
                <h2 className="text-2xl font-semibold text-white">Certificates</h2>
                <div className="space-y-4">
                  <a 
                    href="https://drive.google.com/file/d/1CnF-ItunVRUbe0q6f-YYpN3sCpaEkkbf/view" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block p-4 bg-[#141414] rounded-lg group hover:bg-[#1c1c1c] transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-white font-medium">Frontend Domination</h3>
                        <p className="text-gray-400">Sheriyans Coding School</p>
                      </div>
                      <FaExternalLinkAlt className="text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                  </a>
                  <a 
                    href="https://drive.google.com/file/d/1KbxojO0BGBbZD7pIh0uHtOXk4HKvGyXH/view" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block p-4 bg-[#141414] rounded-lg group hover:bg-[#1c1c1c] transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-white font-medium">Data Structures & Algorithms</h3>
                        <p className="text-gray-400">Coding Ninjas</p>
                      </div>
                      <FaExternalLinkAlt className="text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                  </a>
                </div>
              </section>

              {/* Social Links */}
              <section className="bg-[#1a1a1a] rounded-lg p-6 space-y-6">
                <h2 className="text-2xl font-semibold text-white">Connect With Me</h2>
                <div className="flex gap-4">
                  <a 
                    href="https://github.com/Nishantvidhuri"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                  >
                    <FaGithub size={24} className="text-white" />
                    
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/nishant-vidhuri-092a63124/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                  >
                    <FaLinkedin size={24} className="text-white" />
               
                  </a>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About; 