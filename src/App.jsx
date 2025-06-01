import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Intropage from "./components/IntroPage";
import Developer from "./pages/Developer";
import Hr from "./pages/Hr";
import Kids from "./pages/Kids";
import { ProjectProvider } from "./context/ProjectContext";
import { ProfileProvider } from "./context/ProfileContext";
import MyProjects from "./components/MyProjects";
import { useProfile } from "./context/ProfileContext";
import emailjs from '@emailjs/browser';
import About from "./pages/About";
import NetflixIntro from "./components/NetflixIntro";

// Create a wrapper component to handle route-based role updates
const AppContent = () => {
  const location = useLocation();
  const { userRole, updateUserRole } = useProfile();
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (location.pathname === '/developer') {
      updateUserRole('developer');
    } else if (location.pathname === '/hr') {
      updateUserRole('hr');
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
          <Route path="/developer" element={<Developer />} />
          <Route path="/hr" element={<Hr />} />
          <Route path="/kids" element={<Kids />} />
          <Route path="/projects" element={<MyProjects/>}/>
          <Route path="/about" element={<About />} />
        </Routes>
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
