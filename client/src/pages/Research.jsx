import React, { useState } from "react";
import ParticlesBg from "particles-bg";
import ParticlesCanvas from "../components/Particles";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Particles } from "react-tsparticles";
import { loadFull } from "tsparticles";
import { FaPaperPlane } from "react-icons/fa"; // Import PaperPlane icon

const Research = () => {
  const [selectedOption, setSelectedOption] = useState("Select Option");
  const [inputValue, setInputValue] = useState("");

  const particlesInit = async (engine) => {
    await loadFull(engine);
  };

  const handleSubmit = () => {
    if (inputValue.trim()) {
      // Construct the URL by appending the input value to the base URL
      const baseUrl = "https://www.ebay.com/sch/i.html?_nkw=";
      const query = encodeURIComponent(inputValue.trim()); // Encode the input value
      const url = baseUrl + query;

      console.log("URL:", url);

      // Open the URL in a new tab
      window.open(url, "_blank");

      // Clear the input field after submission
      setInputValue("");
    }
  };

  return (
    <>
      <Navbar />
      <div className="relative w-full h-screen bg-gradient-to-r from-gray-00 via-purple-900 to-black overflow-hidden">
        {/* Grid Background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "120px 120px",
            WebkitMaskImage: `
              linear-gradient(to bottom, rgba(0, 0, 0, 1) 10%, rgba(0, 0, 0, 0) 80%),
              linear-gradient(to right, rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 0) 80%)
            `,
            maskImage: `
              linear-gradient(to bottom, rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 0) 80%),
              linear-gradient(to right, rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 0) 80%)
            `,
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            WebkitMaskComposite: "multiply",
            maskComposite: "intersect",
          }}
        />
        {/* Particles */}
        <ParticlesBg type="cobweb" bg={true} />
        <ParticlesCanvas />
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            fullScreen: { enable: true },
            particles: {
              number: { value: 30 },
              color: { value: "#ffffff" },
              opacity: { value: 0.1 },
              size: { value: 2 },
              links: {
                enable: true,
                color: "#ffffff",
                opacity: 0.2,
                distance: 50,
              },
              move: { enable: true, speed: 1 },
            },
          }}
        />
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-12">
            Research & Insights
          </h1>
          {/* Input Fields */}
          <div className="flex flex-col gap-8 items-center w-full max-w-3xl">
            {/* Dropdown */}
            <div className="relative w-full">
              <select
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-dark-800 to-dark-900 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                onChange={(e) => setSelectedOption(e.target.value)}
              >
                <option value="Select Option" className="text-black">
                  Select Option
                </option>
                <option value="Shopping" className="text-black">
                  Shopping
                </option>
                <option value="Technology" className="text-black">
                  Technology
                </option>
                <option value="Development" className="text-black">
                  Development
                </option>
              </select>
            </div>
            {/* Input with Badge and Send Button */}
            <div className="relative w-full flex items-center">
              {selectedOption !== "Select Option" && (
                <span className="absolute left-4 top-3 bg-blue-600 text-white text-sm px-3 py-1 rounded-lg">
                  {selectedOption}
                </span>
              )}
              <input
                type="text"
                className={`w-full py-3 ${
                  selectedOption !== "Select Option" ? "pl-36" : "pl-4"
                } pr-12 rounded-lg bg-gradient-to-r from-dark-800 to-dark-900 text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                placeholder={
                  selectedOption !== "Select Option"
                    ? "Type your query here"
                    : "Enter your query here"
                }
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button
                onClick={handleSubmit}
                className="absolute right-4 p-3 bg-blue-600 rounded-full hover:bg-blue-700 text-white focus:outline-none"
              >
                <FaPaperPlane className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Research;
