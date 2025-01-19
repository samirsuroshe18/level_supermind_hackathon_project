import React from "react";
import ParticlesBg from "particles-bg";
import ParticlesCanvas from "../components/Particles";
import Navbar from "../components/Navbar";
import Cards from "../components/Cards";
import { Particles } from "react-tsparticles";
import { loadFull } from "tsparticles";
import Footer from "../components/Footer";
import Features from "../components/Features";
import Chat from "../components/Chat";

const Home = () => {

  const particlesInit = async (engine) => {
    await loadFull(engine);
}

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




      <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500 opacity-50 rounded-full blur-2xl"></div>
      
      {/* Particles */}
      <ParticlesBg type="cobweb" bg={true} />
      <ParticlesCanvas />

      {/* Blob Shape */}
      <div className="absolute top-60 right-10 w-64 h-64 bg-blue-500 opacity-50 rounded-full blur-3xl sm:hidden"></div>
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
        <h1 className="text-4xl md:text-6xl font-bold">
        Transform Your Ads with  <span className="text-blue-400">AdVise</span>
        </h1>
        <p className="mt-8 mb-4 text-lg opacity-80 max-w-3xl">
        AdVise provides AI-driven insights to help marketers create compelling ads. By analyzing user pain points, competitor strategies, and trending hooks and CTAs, it helps you design ads that resonate and drive results.




        </p>
        <button className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg  transition">
          Start your Research &rarr;
        </button>
        
      </div>
    </div>
    {/* <Chat /> */}
    <Features />
    <Footer />
    </>
  );
};

export default Home;
