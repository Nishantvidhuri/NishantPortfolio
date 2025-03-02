import React from 'react';

function ProjectsGrid() {
  const projects = [
    {
      title: "E-commerce Platform",
      tech: "React, Node.js, MongoDB",
      image: "/project1.jpg",
      description: "Full-stack e-commerce solution with payment integration"
    },
    // Add more projects...
  ];

  return (
    <div className="px-12 py-8">
      <h2 className="text-2xl text-white mb-4">Featured Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <div key={index} className="bg-[#333] rounded-md overflow-hidden">
            <img src={project.image} alt={project.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-white text-xl mb-2">{project.title}</h3>
              <p className="text-red-500 mb-2">{project.tech}</p>
              <p className="text-gray-300">{project.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectsGrid; 