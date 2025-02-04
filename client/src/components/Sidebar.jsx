import React, { useState } from "react";
import { FaHome, FaCoins, FaChartLine, FaLightbulb, FaCogs } from "react-icons/fa";
import { Link } from "react-router-dom"; // Importing the scroll link from react-scroll
import Particles from "./Particles"; // Import the Particles component

const Sidebar = () => {
  const [active, setActive] = useState(true);
  const menuItems = [
    { label: "Insights", icon: FaHome, active: true, link: "insights" },
    { label: "Competitors", icon: FaChartLine, link: "competitors" },
    { label: "Suggestions", icon: FaCogs, link: "suggestions" },
    { label: "Trend", icon: FaCoins, link: "trend" },
  ];

  return (
    <div className="relative w-64 bg-[#0B0F1C] text-white h-screen flex flex-col justify-between overflow-hidden">
      {/* Particles Background */}
      <Particles />

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
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
