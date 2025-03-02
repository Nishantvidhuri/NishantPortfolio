import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import DeveloperImg from "../assets/developer.png";
import HrImg from "../assets/hr.png";
import { FaFileDownload, FaEnvelope, FaCode, FaSearch } from "react-icons/fa";
import { useProfile } from '../context/ProfileContext';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [count, setCount] = useState(3);
  const { userRole, updateUserRole } = useProfile();

  const [notifications, setNotifications] = useState([
    <><FaCode className="inline mr-2" /> Have you checked my latest project?</>,
    <><FaFileDownload className="inline mr-2" /> Want to download my resume? Scroll to the bottom!</>,
    <><FaEnvelope className="inline mr-2" /> Mail me for reviews or any changes!</>
  ]);

  const [activeDropdown, setActiveDropdown] = useState(null);
  let timeoutId;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseEnter = (dropdown) => {
    if(dropdown=="notifications")
      setCount(0)
    clearTimeout(timeoutId);
    setActiveDropdown(dropdown);
  };

  const handleMouseLeave = () => {
    timeoutId = setTimeout(() => setActiveDropdown(null), 200);
  };

  const isDeveloper = location.pathname === "/developer";
  const currentProfileImg = isDeveloper ? DeveloperImg : HrImg;
  const oppositeProfileImg = isDeveloper ? HrImg : DeveloperImg;
  const oppositeProfileUrl = isDeveloper ? "/hr" : "/developer";

  const handleProfileSwitch = (newRole) => {
    updateUserRole(newRole);
    navigate(newRole === 'developer' ? '/developer' : '/hr');
    setActiveDropdown(null);
  };

  const handleLogoClick = () => {
    navigate(userRole === 'developer' ? '/developer' : '/hr');
  };

  return (
    <div className={`fixed w-full top-0 left-0  transition-all duration-300 ${scrolled ? "bg-black shadow-lg" : "bg-transparent"} px-0 sm:px-6 py-3 z-50`}>
      <div className="flex md:hidden justify-between items-center px-4 py-2">
        <img 
          className="w-32 h-10 cursor-pointer" 
          src={Logo} 
          alt="Logo" 
          onClick={handleLogoClick}
        />
        <div className="relative ">
          <button
            onClick={() => handleMouseEnter("profile")}
            className="flex items-center gap-2 text-white"
          >
            <img
              src={userRole === 'developer' ? DeveloperImg : HrImg}
              alt="Current Profile"
              className="w-8 h-8 rounded-md"
            />
          </button>

          {activeDropdown === "profile" && (
            <div 
              className="absolute top-12 right-0 w-40 bg-black/95 border-[1px] border-white/20 rounded-md shadow-lg z-50"
              onMouseLeave={handleMouseLeave}
            >
              <ul className="text-white text-sm font-semibold">
                <li
                  className="px-4 py-3 border-b border-gray-800 hover:bg-red-700 flex items-center gap-3 cursor-pointer"
                  onClick={() => handleProfileSwitch(userRole === 'developer' ? 'hr' : 'developer')}
                >
                  <img
                    src={userRole === 'developer' ? HrImg : DeveloperImg}
                    alt="Switch Profile"
                    className="w-6 h-6 rounded-md"
                  />
                  <span>{userRole === 'developer' ? "HR" : "Developer"}</span>
                </li>
                <li
                  className="px-4 py-3 hover:bg-red-700 cursor-pointer"
                  onClick={() => navigate("/")}
                >
                  Log Out
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="hidden md:flex px-5 py-2 justify-between items-center">
        <div className="flex gap-8 items-center">
          <img 
            className="w-32 h-10 cursor-pointer" 
            src={Logo} 
            alt="Logo" 
            onClick={handleLogoClick}
          />
          <div className="flex font-bold text-sm !text-[#D5D5D5] gap-5">
            <Link 
              to={userRole === 'developer' ? '/developer' : '/hr'}
              className="hover:text-white transition duration-300"
            >
              Home
            </Link>
            <Link to="/projects" className="hover:text-white transition duration-300">
              My Projects
            </Link>
            <Link to="/about" className="hover:text-white transition duration-300">
              About Me
            </Link>
            <Link 
              to="https://drive.google.com/file/d/18z0fJm-KOhX3aejFhth5Mh1FvrZJip1x/view?usp=sharing" 
              className="hover:text-white transition duration-300"
            >
              My Resume
            </Link>
          </div>
        </div>

        <div className="flex gap-10 items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            width="24"
            height="30"
            className="text-white"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10ZM15.6177 17.0319C14.078 18.2635 12.125 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10C19 12.125 18.2635 14.078 17.0319 15.6177L22.7071 21.2929L21.2929 22.7071L15.6177 17.0319Z"
              fill="currentColor"
            />
          </svg>
          <div
            className="relative flex items-center cursor-pointer"
            onMouseEnter={() => handleMouseEnter("notifications")}
            onMouseLeave={handleMouseLeave}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              width="30"
              height="40"
              className="text-white"
            >
              <path
                fill="currentColor"
                d="M13.0002 4.07092C16.3924 4.55624 19 7.4736 19 11V15.2538C20.0489 15.3307 21.0851 15.4245 22.1072 15.5347L21.8928 17.5232C18.7222 17.1813 15.4092 17 12 17C8.59081 17 5.27788 17.1813 2.10723 17.5232L1.89282 15.5347C2.91498 15.4245 3.95119 15.3307 5.00003 15.2538V11C5.00003 7.47345 7.60784 4.55599 11.0002 4.07086V2H13.0002V4.07092ZM17 15.1287V11C17 8.23858 14.7614 6 12 6C9.2386 6 7.00003 8.23858 7.00003 11V15.1287C8.64066 15.0437 10.3091 15 12 15C13.691 15 15.3594 15.0437 17 15.1287ZM8.62593 19.3712C8.66235 20.5173 10.1512 22 11.9996 22C13.848 22 15.3368 20.5173 15.3732 19.3712C15.3803 19.1489 15.1758 19 14.9533 19H9.0458C8.82333 19 8.61886 19.1489 8.62593 19.3712Z"
              />
            </svg>
            {count > 0 && (
              <span className="absolute -top-[1px] -right-[2px] bg-red-500 text-white text-xs h-4 w-4 flex items-center justify-center font-bold rounded-full">
                {notifications.length}
              </span>
            )}
            {activeDropdown === "notifications" && notifications.length > 0 && (
              <div className="absolute top-12 right-0 w-80 border-white border-2 rounded-md shadow-lg  z-50 bg-black/50">
                {notifications.map((note, index) => (
                  <div
                    key={index}
                    className="text-white text-md px-4 w-full py-3 border-b border-gray-700 hover:bg-red-700 cursor-pointer"
                  >
                    {note}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className="relative flex items-center cursor-pointer"
            onMouseEnter={() => handleMouseEnter("profile")}
            onMouseLeave={handleMouseLeave}
          >
            <img
              className="w-9 h-9 rounded-md"
              src={userRole === 'developer' ? DeveloperImg : HrImg}
              alt={userRole === 'developer' ? "Developer Profile" : "HR Profile"}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="white"
              className="transition-transform duration-300 ml-2"
            >
              <path d="M12 16l-6-6h12z" />
            </svg>

            {activeDropdown === "profile" && (
              <div className="absolute  top-12 right-0 w-40 border-white border-2 rounded-md shadow-lg z-50  ">
                <ul className="text-white  text-sm font-semibold">
                  <li
                    className="px-4 py-3 border-b-1 border-gray-700 hover:bg-red-700 flex items-center gap-3 cursor-pointer"
                    onClick={() => handleProfileSwitch(userRole === 'developer' ? 'hr' : 'developer')}
                  >
                    <img
                      src={userRole === 'developer' ? HrImg : DeveloperImg}
                      alt="Switch Profile"
                      className="w-6 h-6 rounded-md"
                    />
                    <span>{userRole === 'developer' ? "HR" : "Developer"}</span>
                  </li>
                  <li
                    className="px-4 py-3 hover:bg-red-700 cursor-pointer"
                    onClick={() => navigate("/")}
                  >
                    Log Out
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;