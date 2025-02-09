import React from "react";
import { useNavigate } from "react-router";

function Intropage() {
  const navigate = useNavigate();
  const handleLink = (link) => {
    navigate(link);
  };

  return (
    <div className="w-screen flex flex-col gap-10 justify-center items-center h-screen bg-[#141414] px-4 sm:px-0">
      <h1 className="text-3xl sm:text-6xl text-white text-center">Who's Watching?</h1>

      <div className="flex gap-5 mt-10 items-center">
        <div
          className="group h-40 w-40 sm:h-60 sm:w-60 text-white flex flex-col gap-3 items-center rounded-md cursor-pointer"
          onClick={() => handleLink("/developer")}
        >
          {/* Image with Border on Hover */}
          <img
            className="h-24 sm:h-32 group-hover:border-white group-hover:border-2"
            src="/src/assets/developer.png"
            alt="Developer"
          />

          {/* Text Color Changes to White on Hover */}
          <h1 className="text-gray-500 font-bold text-sm sm:text-lg group-hover:text-white">
            Developer
          </h1>
        </div>

        <div
          className="group h-40 w-40 sm:h-60 sm:w-60 text-white flex flex-col gap-3 items-center rounded-md cursor-pointer"
          onClick={() => handleLink("/hr")}
        >
          {/* Image with Border on Hover */}
          <img
            className="h-24 sm:h-32 group-hover:border-white group-hover:border-2"
            src="/src/assets/hr.png"
            alt="HR"
          />

          {/* Text Color Changes to White on Hover */}
          <h1 className="text-gray-500  font-bold text-sm sm:text-lg group-hover:text-white">
            HR
          </h1>
        </div>
      </div>
    </div>
  );
}

export default Intropage;
