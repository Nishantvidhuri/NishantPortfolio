import React from 'react';
import Navbar from '../components/Navbar';
import { FaGithub, FaLinkedin, FaEnvelope, FaMapMarkerAlt, FaPhone, FaExternalLinkAlt } from 'react-icons/fa';

function About() {
  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative pt-24 pb-16 px-4 md:px-12">
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
              {/* Education Section */}
              <section className="bg-[#1a1a1a] rounded-lg p-6 space-y-6">
                <h2 className="text-2xl font-semibold text-white">Education</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg text-white">B.Tech (A.K.T.U)</h3>
                    <p className="text-red-500">7.4 CGPA</p>
                    <p className="text-gray-400">Graduated Oct 2023</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg text-white">St. Mary's Christian Public School</h3>
                    <p className="text-gray-400">12th Grade (C.B.S.E) • Aug 2019</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg text-white">Sidhharth International Public School</h3>
                    <p className="text-gray-400">10th Grade (C.B.S.E) • Aug 2017</p>
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