import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import FirstSectionHome from '../components/FirstSectionHome';
import Projectsuggestions from '../components/Projectsuggestions';
import Technologies from '../components/Technologies';
import SocialMedia from '../components/SocialMedia';
import Documents from '../components/Documents';
import MiniGames from '../components/MiniGames';
import ExperienceSection from '../components/ExperienceSection';

function Developer() {
  useEffect(() => {
    document.title = "Nishant | Developer";
  }, []);

  return (
    <div className='overflow-x-hidden'>
      <Navbar />
      <FirstSectionHome/>
      <Projectsuggestions/>
      <Technologies/>
      <ExperienceSection/>
      <SocialMedia/>
      <Documents/>
    </div>
  );
}

export default Developer;
