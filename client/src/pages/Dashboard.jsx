import React from "react";
import { FaHome, FaCoins, FaChartBar, FaUser } from "react-icons/fa";
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale } from "chart.js";
import { Line } from "react-chartjs-2";
import Sidebar from "../components/Sidebar";
import Cards from "../components/Cards";
import Navbar from "../components/Navbar";
import { Particles } from "react-tsparticles";
import { loadFull } from "tsparticles";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale);

const Dashboard = () => {
  // Chart Data
  const lineChartData = {
    labels: ["Jun 13", "Jun 15", "Jun 17", "Jun 19", "Jun 21"],
    datasets: [
      {
        label: "Private Credit",
        data: [10, 20, 25, 30, 35],
        borderColor: "#3B82F6",
        fill: false,
      },
      {
        label: "Commodities",
        data: [8, 15, 18, 25, 32],
        borderColor: "#F59E0B",
        fill: false,
      },
    ],
  };

  const particlesInit = async (engine) => {
    await loadFull(engine);
};

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      y: {
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  return (
    <div className="flex h-screen bg-dark-900 text-white">
      {/* Sidebar */}
      <Sidebar />
     
      {/* Main Content */}
      <div className="flex-1 bg-gradient-to-b from-[#10162f] to-[#0b111e] text-white p-6">
        {/* Navbar */}
        <nav className="text-sm text-gray-400 mb-6">
          <ol className="list-reset flex">
            <li>
              <a href="#" className="text-blue-500 hover:underline">
                Dashboard
              </a>
            </li>
            <li>
              <span className="mx-2">{'>'}</span>
            </li>
            <li className="text-gray-400">Market Overview</li>
          </ol>
        </nav>
        <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: true },
          particles: {
            number: { value: 30 },
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Insights at a Glance</h1>
          <div className="flex items-center space-x-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Contact
            </button>
            <div className="bg-gray-700 p-2 rounded-full">
              <span className="text-white">Username</span>
            </div>
          </div>
        </div>

        {/* Global Market Overview */}
        <div className="p-6 bg-gradient-to-b from-[#1a213a] to-[#161c30] rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-2">Global Market Overview</h2>
          <p className="text-sm text-gray-400 mb-6">
            Explore the activity and risks behind crypto and asset-backed stablecoins. View
            encumbrant and new issuer on-chain traction.
          </p>

          {/* Stat Cards */}
          <div className="grid grid-cols-5 gap-4">
            {/* Card */}
            <div className="bg-[#10162f] p-4 rounded-lg text-center shadow-md">
              <p className="text-gray-400 text-sm">Total RWA Onchain</p>
              <h3 className="text-2xl font-bold mt-2">$13.99B</h3>
              <p className="text-green-400 text-sm mt-1">▲ 5.16% from 30d ago</p>
            </div>

            {/* Card */}
            <div className="bg-[#10162f] p-4 rounded-lg text-center shadow-md">
              <p className="text-gray-400 text-sm">Total Asset Holders</p>
              <h3 className="text-2xl font-bold mt-2">67,530</h3>
              <p className="text-green-400 text-sm mt-1">▲ 4.75% from 30d ago</p>
            </div>

            {/* Card */}
            <div className="bg-[#10162f] p-4 rounded-lg text-center shadow-md">
              <p className="text-gray-400 text-sm">Total Asset Issuers</p>
              <h3 className="text-2xl font-bold mt-2">117</h3>
              <p className="text-red-400 text-sm mt-1">▼ 2.50% from 30d ago</p>
            </div>

            {/* Card */}
            <div className="bg-[#10162f] p-4 rounded-lg text-center shadow-md">
              <p className="text-gray-400 text-sm">Total Stablecoin Value</p>
              <h3 className="text-2xl font-bold mt-2">$202.97B</h3>
              <p className="text-green-400 text-sm mt-1">▲ 10.93% from 30d ago</p>
            </div>

            {/* Card */}
            <div className="bg-[#10162f] p-4 rounded-lg text-center shadow-md">
              <p className="text-gray-400 text-sm">Total Stablecoin</p>
              <h3 className="text-2xl font-bold mt-2">138.28M</h3>
              <p className="text-green-400 text-sm mt-1">▲ 5.16% from 30d ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
