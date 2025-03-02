import React, { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Intropage from "./components/IntroPage";
import Developer from "./pages/Developer";
import Hr from "./pages/Hr";
import { ProjectProvider } from "./context/ProjectContext";
import { ProfileProvider } from "./context/ProfileContext";
import MyProjects from "./components/MyProjects";
import { useProfile } from "./context/ProfileContext";
import emailjs from '@emailjs/browser';

// Create a wrapper component to handle route-based role updates
const AppContent = () => {
  const location = useLocation();
  const { userRole, updateUserRole } = useProfile();

  useEffect(() => {
    if (location.pathname === '/developer') {
      updateUserRole('developer');
    } else if (location.pathname === '/hr') {
      updateUserRole('hr');
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
        <Routes>
          <Route path="/" element={<Intropage />} />
          <Route path="/developer" element={<Developer />} />
          <Route path="/hr" element={<Hr />} />
          <Route path="/projects" element={<MyProjects/>}/>
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
