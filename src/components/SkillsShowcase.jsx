import React from 'react';
import reactImg from "../assets/Technology/react.png";
import jsImg from "../assets/Technology/javascript.png";
import tailwindImg from "../assets/Technology/tailwind.png";

import angularImg from "../assets/Technology/angular.png";
import reduxImg from "../assets/Technology/redux.png";
import threeJsImg from "../assets/Technology/threejs.png";
import axiosImg from "../assets/Technology/axios.png";
import gsapImg from "../assets/Technology/gsap.png";
import materialUiImg from "../assets/Technology/materialui.png";
import viteImg from "../assets/Technology/vite.png";
import htmlImg from "../assets/Technology/html.png";
import cssImg from "../assets/Technology/css.png";

function SkillsShowcase() {
  const techStack = [
    { name: "React", image: reactImg },
    { name: "Angular", image: angularImg },
    { name: "JavaScript", image: jsImg },
    { name: "Tailwind CSS", image: tailwindImg },
    { name: "Redux", image: reduxImg },
    { name: "Three.js", image: threeJsImg },
    { name: "Axios", image: axiosImg },
    { name: "GSAP", image: gsapImg },
    { name: "Material UI", image: materialUiImg },
    { name: "Vite", image: viteImg },
    { name: "HTML", image: htmlImg },
    { name: "CSS", image: cssImg },
  ];

  return (
    <div className="px-4 md:px-12 py-8">
      <h2 className="text-2xl text-white mb-6">Technologies I Work With</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {techStack.map((tech, index) => (
          <div key={index} className="bg-[#333] rounded-md p-4 flex flex-col items-center justify-center hover:bg-[#404040] transition-colors">
            <img 
              src={tech.image} 
              alt={tech.name} 
              className="w-12 h-12 object-contain mb-2"
            />
            <span className="text-white text-sm text-center">{tech.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkillsShowcase; 