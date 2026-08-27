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
    <div className="py-8">
      <h2 className="px-4 md:px-12 text-lg md:text-2xl font-bold text-[#e5e5e5] mb-3">
        Technologies I Work With
      </h2>
      <div className="flex overflow-x-auto no-scrollbar gap-3 px-4 md:px-12 pb-4 pt-2">
        {techStack.map((tech, index) => (
          <div
            key={index}
            className="group relative flex-shrink-0 cursor-pointer"
          >
            <div className="relative w-[140px] md:w-[210px] h-[130px] md:h-[180px] bg-gradient-to-b from-[#2a2a2a] to-[#181818] border border-white/10 rounded-sm flex flex-col items-center justify-center gap-3 transition-transform duration-300 group-hover:scale-110 group-hover:border-white/30">
              <img
                src={tech.image}
                alt={tech.name}
                className="w-12 h-12 md:w-20 md:h-20 object-contain"
              />
              <span className="text-gray-300 text-xs md:text-sm text-center px-1">{tech.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkillsShowcase; 