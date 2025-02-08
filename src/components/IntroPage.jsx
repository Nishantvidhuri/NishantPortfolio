import React from "react";
import { useLocation, useNavigate } from "react-router";

function Intropage() {
  const navigate = useNavigate();
  const handleLink = (link) => {
    navigate(link);
  };
  const location = useLocation();
  return (
    <div className="w-screen flex  flex-col gap-10 justify-center items-center h-screen bg-[#141414]">
      <h1 className="text-6xl text-white ">Who's Watching?</h1>
      <div className="flex gap-5 mt-10">
        <div
          className="group h-60 w-60 text-white flex flex-col gap-3 items-center rounded-md cursor-pointer"
          onClick={() => handleLink("/developer")}
        >
          {/* Image with Border on Hover */}
          <img
            className="h-32 group-hover:border-white group-hover:border-2"
            src="/src/assets/developer.png"
          />

          {/* Text Color Changes to White on Hover */}
          <h1 className="text-gray-500 font-jakarta font-bold text-lg group-hover:text-white">
            Developer
          </h1>
        </div>
        <div
          className="group h-60 w-60 text-white flex flex-col gap-3 items-center rounded-md cursor-pointer"
          onClick={() => handleLink("/hr")}
        >
          {/* Image with Border on Hover */}
          <img
            className="h-32 group-hover:border-white group-hover:border-2"
            src="/src/assets/hr.png"
          />

          {/* Text Color Changes to White on Hover */}
          <h1 className="text-gray-500 font-jakarta font-bold text-lg group-hover:text-white">
            HR
          </h1>
        </div>
        
      </div>
    </div>
  );
}

export default Intropage;
