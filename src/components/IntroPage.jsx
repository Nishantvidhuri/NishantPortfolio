import React from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from '../context/ProfileContext';

// ✅ Import Images Directly (Fixes Vercel Build Issues)
import DeveloperImg from "../assets/developer.png";
import HrImg from "../assets/hr.png";
// Use a placeholder image for kids profile
import KidsImg from "../assets/developer.png"; // Replace with a proper kids image if available

function Intropage() {
  const navigate = useNavigate();
  const { updateUserRole } = useProfile();

  const handleRoleSelect = (role) => {
    updateUserRole(role);
    navigate(role === 'developer' ? '/developer' : role === 'hr' ? '/hr' : '/kids');
  };

  return (
    <div className="w-screen flex flex-col gap-10 justify-center items-center h-screen bg-[#141414] px-4 sm:px-0">
      <h1 className="text-3xl sm:text-6xl text-white text-center">Who's Watching?</h1>

      <div className="flex flex-wrap gap-5 mt-10 items-center justify-center">
        <div
          className="group h-40 w-40 sm:h-60 sm:w-60 text-white flex flex-col gap-3 items-center rounded-md cursor-pointer"
          onClick={() => handleRoleSelect('developer')}
        >
          {/* Image with Border on Hover */}
          <img
            className="h-24 sm:h-32 group-hover:border-white group-hover:border-2"
            src={DeveloperImg}
            alt="Developer"
          />

          {/* Text Color Changes to White on Hover */}
          <h1 className="text-gray-500 font-bold text-sm sm:text-lg group-hover:text-white">
            Developer
          </h1>
        </div>

        <div
          className="group h-40 w-40 sm:h-60 sm:w-60 text-white flex flex-col gap-3 items-center rounded-md cursor-pointer"
          onClick={() => handleRoleSelect('hr')}
        >
          {/* Image with Border on Hover */}
          <img
            className="h-24 sm:h-32 group-hover:border-white group-hover:border-2"
            src={HrImg}
            alt="HR"
          />

          {/* Text Color Changes to White on Hover */}
          <h1 className="text-gray-500 font-bold text-sm sm:text-lg group-hover:text-white">
            HR
          </h1>
        </div>

        {/* Kids Profile */}
        <div
          className="group h-40 w-40 sm:h-60 sm:w-60 text-white flex flex-col gap-3 items-center rounded-md cursor-pointer"
          onClick={() => handleRoleSelect('kids')}
        >
          {/* Netflix Kids Profile Icon */}
          <div className="h-24 sm:h-32 w-24 sm:w-32 rounded-md group-hover:border-white group-hover:border-2 overflow-hidden relative">
            {/* Vertical Color Stripes */}
            <div className="absolute inset-0 flex">
              <div className="flex-1 bg-green-500"></div>
              <div className="flex-1 bg-yellow-400"></div>
              <div className="flex-1 bg-pink-500"></div>
              <div className="flex-1 bg-purple-400"></div>
              <div className="flex-1 bg-red-500"></div>
              <div className="flex-1 bg-blue-500"></div>
            </div>
            
            {/* "children" Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white text-red-600 px-2 py-1 rounded-sm transform -rotate-6 font-bold text-sm sm:text-base">
                children
              </div>
            </div>
          </div>

          {/* Text Color Changes to White on Hover */}
          <h1 className="text-gray-500 font-bold text-sm sm:text-lg group-hover:text-white">
            Kids
          </h1>
        </div>
      </div>
    </div>
  );
}

export default Intropage;
