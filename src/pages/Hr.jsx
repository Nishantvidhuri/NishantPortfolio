import React from 'react'
import Navbar from '../components/Navbar'
import HrBanner from '../components/HrBanner'
import SkillsShowcase from '../components/SkillsShowcase'
import ExperienceSection from '../components/ExperienceSection'
import ContactSection from '../components/ContactSection'
import ResumeSection from '../components/ResumeSection'
import MiniGames from '../components/MiniGames'
function Hr() {
  return (
    <div className="bg-[#141414] min-h-screen pb-20 overflow-x-hidden">
      <Navbar/>
      <HrBanner />

      <div className="relative z-10 -mt-20 space-y-6">
        <SkillsShowcase />
        <ExperienceSection />
        <ResumeSection />
        <ContactSection />
      </div>
    </div>
  );
}

export default Hr;