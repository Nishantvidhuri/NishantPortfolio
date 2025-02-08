import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import FirstSectionHome from '../components/FirstSectionHome';
import Projectsuggestions from '../components/Projectsuggestions';
import Technologies from '../components/Technologies';
import SocialMedia from '../components/SocialMedia';
import Documents from '../components/Documents';

function Developer() {
  useEffect(() => {
    document.title = "Nishant | Developer";
  }, []);

  return (
    <div>
      <Navbar />
      <FirstSectionHome/>
      <Projectsuggestions/>
      <Technologies/>
      <SocialMedia/>
      <Documents/>
    </div>
  );
}

export default Developer;
