import React from 'react'
import { Particles } from "react-tsparticles";
import { loadFull } from "tsparticles";

const Cards = () => {

    const particlesInit = async (engine) => {
        await loadFull(engine);
    };
  return (
    <div>
         <div className="relative h-screen bg-gradient-to-r from-[#1B1F3A] to-[#090B10] text-white">
      {/* Particles */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: true },
          particles: {
            number: { value: 50 },
            color: { value: "#ffffff" },
            opacity: { value: 0.1 },
            size: { value: 3 },
            links: {
              enable: true,
              color: "#ffffff",
              opacity: 0.2,
              distance: 150,
            },
            move: { enable: true, speed: 1 },
          },
        }}
      />

      
    </div>
    </div>
  )
}

export default Cards;