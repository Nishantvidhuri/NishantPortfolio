import React from 'react'
import Navbar from '../components/Navbar'
import HrBanner from '../components/HrBanner'
import Technologies from '../components/Technologies'
import Documents from '../components/Documents'
import ExperienceSection from '../components/ExperienceSection'
import ContactSection from '../components/ContactSection'
import ResumeSection from '../components/ResumeSection'
import MiniGames from '../components/MiniGames'

function Hr() {
  return (
    <div className="bg-[#141414] min-h-screen pb-20 overflow-x-hidden">
      <Navbar/>
      <HrBanner />
      <div className="relative z-10 space-y-0">
        <Technologies />
        <ExperienceSection />
        <Documents />
        <ResumeSection />
        <MiniGames />
        <ContactSection />
      </div>
    </div>
  );
}

export default Hr;