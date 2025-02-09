import React from "react";
import { Route, Routes } from "react-router-dom";
import Intropage from "./components/IntroPage";
import Developer from "./pages/Developer";
import Hr from "./pages/Hr";
import { ProjectProvider } from "./context/ProjectContext";
import MyProjects from "./components/MyProjects";


function App() {
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
}

export default App;
