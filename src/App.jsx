import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import Intropage from "./components/IntroPage";
import Developer from "./pages/Developer";
import Kids from "./pages/Kids";
import Showreel from "./pages/Showreel";
import NotFound from "./pages/NotFound";
import { ProjectProvider } from "./context/ProjectContext";
import { ProfileProvider } from "./context/ProfileContext";
import MyProjects from "./components/MyProjects";
import { useProfile } from "./context/ProfileContext";
import emailjs from '@emailjs/browser';
import About from "./pages/About";
import NetflixIntro from "./components/NetflixIntro";
import NishantChatBot from "./components/NishantChatBot";

// Create a wrapper component to handle route-based role updates
const AppContent = () => {
  const location = useLocation();
  const { userRole, updateUserRole } = useProfile();
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (location.pathname === '/explorer') {
      updateUserRole('explorer');
    } else if (location.pathname === '/kids') {
      updateUserRole('kids');
    }
  }, [location.pathname, updateUserRole]);

  // Updated useEffect for title update
  useEffect(() => {
    if (location.pathname === '/') {
      document.title = 'Nishant';
    } else {
      document.title = `Nishant | ${userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Portfolio'}`;
    }
  }, [userRole, location.pathname]);

  useEffect(() => {
    emailjs.init('zcL4jj0QhEChPRS1V');
  }, []);

  return (
    <ProjectProvider>
      <div className="bg-black min-h-screen">
        {showIntro && <NetflixIntro onAnimationComplete={() => setShowIntro(false)} />}
        <Routes>
          <Route path="/" element={<Intropage />} />
          <Route path="/explorer" element={<Developer />} />
          <Route path="/developer" element={<Navigate to="/explorer" replace />} />
          <Route path="/hr" element={<Navigate to="/explorer" replace />} />
          <Route path="/kids" element={<Kids />} />
          <Route path="/projects" element={<MyProjects/>}/>
          <Route path="/about" element={<About />} />
          <Route path="/showreel" element={<Showreel />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {location.pathname === '/explorer' && <NishantChatBot />}
      </div>
    </ProjectProvider>
  );
};

function App() {
  return (
    <ProfileProvider>
      <AppContent />
    </ProfileProvider>
  );
}

export default App;
