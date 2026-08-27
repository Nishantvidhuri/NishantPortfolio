import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";

const backdrop =
  "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?q=80&w=2079&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen w-screen overflow-hidden text-white">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url(${backdrop})` }}
      />
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60" />

      {/* Header — just the logo, like Netflix's error page */}
      <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black to-transparent px-6 sm:px-12 py-4 z-10">
        <img
          src={Logo}
          alt="Nishant Vidhuri"
          className="w-32 h-10 cursor-pointer"
          onClick={() => navigate("/")}
        />
      </div>

      {/* Center content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
          Lost your way?
        </h1>
        <p className="mt-6 max-w-xl text-base sm:text-xl text-gray-100 leading-relaxed">
          Sorry, we can't find that page. You'll find lots to explore on the
          home page.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-8 bg-white text-black font-semibold px-6 py-2.5 rounded-md hover:bg-white/80 transition-colors"
        >
          Nishant Home
        </button>

        {/* Error code with red bar */}
        <div className="mt-14 flex items-center gap-3 text-xl sm:text-2xl">
          <span className="w-1 self-stretch bg-[#e50914]" />
          <span className="tracking-wide">
            Error Code <span className="font-bold">NSES-404</span>
          </span>
        </div>
      </div>

      {/* Bottom-right attribution, Netflix style */}
      <div className="absolute bottom-6 right-20 sm:right-28 z-10 text-sm sm:text-base tracking-widest text-gray-300">
        FROM <span className="font-bold text-white">NISHANT'S PORTFOLIO</span>
      </div>
    </div>
  );
}

export default NotFound;
