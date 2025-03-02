import React from 'react';

function ExperienceSection() {
  const experiences = [
    {
      title: "Frontend Developer",
      company: "Vox Gause",
      location: "Singapore",
      period: "Present",
      description: "Developing responsive web applications using React, Angular, and modern JavaScript frameworks. Creating interactive and user-friendly interfaces with modern web technologies."
    }
  ];

  return (
    <div className="px-4 md:px-12 py-8">
      <h2 className="text-2xl text-white mb-6">Experience</h2>
      <div className="grid grid-cols-1 gap-4">
        {experiences.map((exp, index) => (
          <div key={index} className="bg-[#333] rounded-md p-6">
            <h3 className="text-white text-xl mb-2">{exp.title}</h3>
            <p className="text-red-500 mb-2">{exp.company} - {exp.location}</p>
            <p className="text-gray-400 text-sm mb-3">{exp.period}</p>
            <p className="text-gray-300">{exp.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExperienceSection; 