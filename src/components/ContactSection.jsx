import React from 'react';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

function ContactSection() {
  return (
    <div className="px-4 md:px-12 py-8">
      <h2 className="text-2xl text-white mb-6">Get In Touch</h2>
      <div className="bg-[#333] rounded-md p-6 max-w-2xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h3 className="text-white text-xl mb-4">Contact Information</h3>
            <div className="space-y-4 text-gray-300">
              <a 
                href="mailto:nishantvidhuri0987@gmail.com" 
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <FaEnvelope className="text-red-500" />
                nishantvidhuri0987@gmail.com
              </a>
              <a 
                href="https://www.linkedin.com/in/nishant-vidhuri-092a63124/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <FaLinkedin className="text-red-500" />
                LinkedIn Profile
              </a>
              <a 
                href="https://github.com/Nishantvidhuri" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <FaGithub className="text-red-500" />
                GitHub Profile
              </a>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-white text-xl mb-4">Quick Connect</h3>
            <button 
              onClick={() => window.location.href = 'mailto:nishantvidhuri0987@gmail.com'}
              className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 w-full md:w-auto"
            >
              Schedule a Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactSection; 