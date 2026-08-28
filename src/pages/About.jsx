import React from 'react';
import Navbar from '../components/Navbar';
import { FaGithub, FaLinkedin, FaEnvelope, FaMapMarkerAlt, FaPhone, FaPlay } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Technologies from '../components/Technologies';
import Documents from '../components/Documents';

function About() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    if (path === 'resume') {
      window.open("https://drive.google.com/file/d/1mYm-u_piUtMuNP4_kEem3QelcAqDZB4I/view?usp=sharing", "_blank");
    } else {
      navigate(`/${path}`);
    }
  };

  const experiences = [
    {
      company: "Recrivio",
      title: "Associate Software Developer",
      period: "August 2025 - Present",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScqpp3Y5Duvh-v7pYI0lzo5lgFz2VIs7tSUvc2QEZeBg&s=10",
    },
    {
      company: "Vox Gauge",
      title: "Frontend Developer",
      period: "Feb 2025 - June 2025",
      logo: "https://framerusercontent.com/images/5MwGErH8PsYI9enHWzWZJRF7kJ4.svg?scale-down-to=512",
    },
    {
      company: "Big Verse",
      title: "Frontend Developer",
      period: "Oct 2024 - Feb 2025",
      logo: "/image.png",
    },
  ];

  const education = [
    { name: "B.Tech (A.K.T.U)", detail: "7.4 CGPA", year: "Graduated Oct 2023" },
    { name: "St. Mary's Christian Public School", detail: "12th Grade (C.B.S.E)", year: "Aug 2019" },
    { name: "Sidhharth International Public School", detail: "10th Grade (C.B.S.E)", year: "Aug 2017" },
  ];

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      {/* Mobile Navigation */}
      <div className="absolute z-[1000] top-16 inset-x-0 flex gap-2 text-sm px-4 md:hidden">
        <button onClick={() => handleNavigation('projects')} className="flex-1 py-1.5 border rounded-full border-gray-300/70 text-gray-200 active:bg-white/10 transition-colors">Projects</button>
        <button onClick={() => handleNavigation('about')} className="flex-1 py-1.5 border rounded-full border-gray-300/70 text-gray-200 active:bg-white/10 transition-colors">About Me</button>
        <button onClick={() => handleNavigation('resume')} className="flex-1 py-1.5 border rounded-full border-gray-300/70 text-gray-200 active:bg-white/10 transition-colors">Resume</button>
      </div>

      {/* Hero Banner */}
      <div className="relative w-full h-[70vh] sm:h-[80vh] flex items-end">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://dev-to-uploads.s3.amazonaws.com/i/jxx4zedqe3hkoysugr5j.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />

        <div className="relative z-10 w-full px-4 sm:px-10 pb-8 sm:pb-12">
          <div className=" mx-auto">
            <div className="inline-block mb-4">
              <span className="text-[#46d369] font-semibold text-sm tracking-wider uppercase">S1:E1 &middot; About Me</span>
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold text-white font-['Teko'] leading-none mb-2">
              NISHANT VIDHURI
            </h1>
            <p className="text-gray-300 text-lg sm:text-xl font-['Poppins'] mb-6 max-w-2xl">
              Frontend Developer crafting pixel-perfect, high-performance web experiences with modern technologies.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <a
                href="https://drive.google.com/file/d/1mYm-u_piUtMuNP4_kEem3QelcAqDZB4I/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded hover:bg-white/90 transition"
              >
                <FaPlay size={14} />
                <span>View Resume</span>
              </a>
              <a
                href="mailto:nishantvidhuri0987@gmail.com"
                className="flex items-center gap-2 bg-[#6d6d6e]/80 text-white font-semibold px-6 py-3 rounded hover:bg-[#6d6d6e] transition"
              >
                <FaEnvelope size={16} />
                <span>Contact Me</span>
              </a>
              <a href="https://github.com/Nishantvidhuri" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white transition hover:scale-110">
                <FaGithub size={28} />
              </a>
              <a href="https://www.linkedin.com/in/nishant-vidhuri-092a63124/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white transition hover:scale-110">
                <FaLinkedin size={28} />
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-red-500" /> New Delhi, India</span>
              <span className="text-gray-600">|</span>
              <a href="tel:+919871202673" className="flex items-center gap-1 hover:text-white transition"><FaPhone className="text-red-500" /> +91 9871202673</a>
              <span className="text-gray-600">|</span>
              <a href="mailto:nishantvidhuri0987@gmail.com" className="flex items-center gap-1 hover:text-white transition"><FaEnvelope className="text-red-500" /> nishantvidhuri0987@gmail.com</a>
            </div>
          </div>
        </div>
      </div>

      {/* Experience Row */}
      <div className="bg-[#141414] py-6">
        <h2 className="ml-4 sm:ml-10 pb-4 text-lg sm:text-xl font-['Poppins'] text-white">
          Professional Experience
        </h2>
        <div className="flex gap-2 px-4 sm:px-10 overflow-x-auto overflow-y-hidden no-scrollbar">
          {experiences.map((exp, index) => (
            <div
              key={index}
              className="relative border border-gray-700 rounded-md w-44 sm:w-80 h-36 sm:h-40 flex-shrink-0 flex flex-col items-center justify-center hover:border-gray-500 transition-colors group"
            >
              <img src={exp.logo} alt={exp.company} className="w-14 sm:w-20 h-14 sm:h-20 object-contain group-hover:scale-105 transition-transform" />
              <span className="text-xs sm:text-sm text-white font-semibold mt-2">{exp.company}</span>
              <span className="text-xs text-gray-400">{exp.title}</span>
              <span className="text-xs text-red-500 mt-1">{exp.period}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Education Row */}
      <div className="bg-[#141414] py-6">
        <h2 className="ml-4 sm:ml-10 pb-4 text-lg sm:text-xl font-['Poppins'] text-white">
          Education
        </h2>
        <div className="flex gap-2 px-4 sm:px-10 overflow-x-auto overflow-y-hidden no-scrollbar">
          {education.map((edu, index) => (
            <div
              key={index}
              className="relative border border-gray-700 rounded-md w-52 sm:w-80 h-36 sm:h-40 flex-shrink-0 flex flex-col items-center justify-center px-4 text-center hover:border-gray-500 transition-colors group"
            >
              {/* Netflix-style corner rank badge */}
              <div className="absolute top-0 right-0 w-8 h-8 sm:w-10 sm:h-10">
                <div className="absolute inset-0 bg-[#E50914] rounded-bl-md rounded-tr-md" />
                <span className="relative z-10 flex items-center justify-center w-full h-full text-white font-bold text-sm sm:text-base font-['Poppins']">
                  {index + 1}
                </span>
              </div>
              <span className="text-xs sm:text-sm text-white font-semibold">{edu.name}</span>
              <span className="px-2 py-0.5 bg-red-600/10 text-red-500 rounded-full text-xs mt-1">{edu.detail}</span>
              <span className="text-xs text-gray-500 mt-1">{edu.year}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Technologies - same as home page */}
      <Technologies />

      {/* Documents / Certificates - same as home page */}
      <Documents />

      {/* Footer Spacer */}
      <div className="h-16 bg-[#141414]" />
    </div>
  );
}

export default About;
