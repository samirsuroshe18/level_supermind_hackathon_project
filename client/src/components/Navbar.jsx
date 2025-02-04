import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import Logo from "../assets/Advise.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // State for the mobile menu
  const navItems = ["Home", "Dashboard", "Research", "Team"];

  return (
    <div className="flex items-center justify-between w-full px-6 py-4 bg-black sticky top-0 z-50">
      {/* Left Logo */}
      <div className="flex items-center space-x-2">
        <div className="w-32 h-10  flex items-center justify-center">
          <img src={Logo} alt="AdVise" className="" />
        </div>
        <h1 className="text-lg sm:text-xl font-semibold"></h1>
      </div>

      {/* Hamburger Icon for Mobile */}
      <button
        className="sm:hidden block focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Menu"
      >
        <div
          className={`w-6 h-1 bg-white rounded-md mb-1 transition-all duration-300 ${
            isOpen ? "rotate-45 translate-y-2.5" : ""
          }`}
        ></div>
        <div
          className={`w-6 h-1 bg-white rounded-md mb-1 transition-all duration-300 ${
            isOpen ? "opacity-0" : ""
          }`}
        ></div>
        <div
          className={`w-6 h-1 bg-white rounded-md transition-all duration-300 ${
            isOpen ? "-rotate-45 -translate-y-2.5" : ""
          }`}
        ></div>
      </button>

      {/* Middle Nav Links (Desktop) */}
      <div className="hidden sm:flex items-center space-x-6 bg-black bg-opacity-30 px-6 py-2 rounded-full shadow-md">
        <NavLink
          to=''
          className={({ isActive }) =>
            `relative text-sm font-medium px-3 py-2 rounded-full transition-all duration-300 ${
              isActive
                ? "bg-gradient-to-r from-blue-700 to-purple-700 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600"
            }`
          }
          aria-current={({ isActive }) => (isActive ? "page" : undefined)}
        >
          Home
        </NavLink>
        <NavLink
          to='dashboard'
          className={({ isActive }) =>
            `relative text-sm font-medium px-3 py-2 rounded-full transition-all duration-300 ${
              isActive
                ? "bg-gradient-to-r from-blue-700 to-purple-700 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600"
            }`
          }
          aria-current={({ isActive }) => (isActive ? "page" : undefined)}
        >
          Dashboard
        </NavLink>
        <NavLink
          to='research'
          className={({ isActive }) =>
            `relative text-sm font-medium px-3 py-2 rounded-full transition-all duration-300 ${
              isActive
                ? "bg-gradient-to-r from-blue-700 to-purple-700 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600"
            }`
          }
          aria-current={({ isActive }) => (isActive ? "page" : undefined)}
        >
          Research
        </NavLink>
        <NavLink
          to='team'
          className={({ isActive }) =>
            `relative text-sm font-medium px-3 py-2 rounded-full transition-all duration-300 ${
              isActive
                ? "bg-gradient-to-r from-blue-700 to-purple-700 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600"
            }`
          }
          aria-current={({ isActive }) => (isActive ? "page" : undefined)}
        >
          Team
        </NavLink>
      </div>

      {/* Right Button (Desktop) */}
      <div className="hidden sm:block">
        <NavLink
          to="/research"
          className="px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-md hover:opacity-90 transition-all duration-300"
        >
          Get Started
        </NavLink>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-black bg-opacity-50 shadow-lg sm:hidden z-50">
          <div className="flex flex-col items-center space-y-4 py-4">
            {navItems.map((item) => {
              const path = `/${item.replace(/\s+/g, "-").toLowerCase()}`;
              return (
                <NavLink
                  key={item}
                  to={path}
                  className={({ isActive }) =>
                    `relative text-sm font-medium px-4 py-2 rounded-full transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-700 to-purple-700 text-white shadow-lg"
                        : "text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600"
                    }`
                  }
                  onClick={() => setIsOpen(false)} // Close menu on link click
                >
                  {item}
                </NavLink>
              );
            })}
            <NavLink
              to="/launch"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-md hover:opacity-90 transition-all duration-300"
              onClick={() => setIsOpen(false)} // Close menu on button click
            >
              Launch Webapp
            </NavLink>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
