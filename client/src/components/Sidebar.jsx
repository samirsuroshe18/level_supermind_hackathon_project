import React from "react";
import { FaHome, FaNewspaper, FaCoins, FaChartLine, FaLightbulb, FaCogs } from "react-icons/fa";
import { Link } from "react-scroll"; // Importing the scroll link from react-scroll
import Particles from "./Particles"; // Import the Particles component

const Sidebar = () => {
  const menuItems = [
    { label: "Home", icon: FaHome, active: true, link: "home" },
    { label: "Research", icon: FaLightbulb, link: "/research" },
    { label: "Insights", icon: FaNewspaper, link: "insights" },
    { label: "Competitors", icon: FaChartLine, link: "competitors" },
    { label: "Suggestions", icon: FaCogs, link: "suggestions" },
    { label: "Trend", icon: FaCoins, link: "trend" },
  ];

  return (
    <div className="relative w-64 bg-[#0B0F1C] text-white h-screen flex flex-col justify-between overflow-hidden">
      {/* Particles Background */}
      <Particles />

      {/* Logo Section */}
      <div>
        <div className="p-4 text-lg font-bold flex items-center">
          <span className="mr-2 text-blue-400 text-xl">AdVise</span>
        </div>
        <p className="px-4 text-sm text-gray-400">MENU</p>

        {/* Menu Items */}
        <nav className="mt-4">
          <ul>
            {menuItems.map((item, index) => (
              <li key={index} className="group">
                {/* Link component for scrollable navigation */}
                <Link
                  to={item.link}
                  smooth={true}
                  offset={-70} // Adjust scroll offset
                  duration={500} // Smooth scroll duration
                >
                  <a
                    href="#"
                    className={`flex items-center px-4 py-3 text-sm rounded-md relative overflow-hidden ${
                      item.active
                        ? "bg-gradient-to-r from-blue-800 to-purple-700 shadow-lg"
                        : "hover:bg-gray-800"
                    }`}
                  >
                    <span
                      className={`absolute inset-0 transition-transform transform scale-150 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 ${
                        item.active ? "opacity-10" : ""
                      }`}
                    />
                    <item.icon
                      className={`text-lg mr-4 z-10 ${
                        item.active
                          ? "text-white"
                          : "text-gray-400 group-hover:text-white"
                      }`}
                    />
                    <span
                      className={`z-10 ${
                        item.active
                          ? "text-white font-medium"
                          : "text-gray-400 group-hover:text-white"
                      }`}
                    >
                      {item.label}
                    </span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Footer Section */}
      <div className="p-4">
        <ul>
          <li className="flex items-center px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white rounded-md">
            Help Center
          </li>
          <li className="flex items-center px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white rounded-md">
            Downloads
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
