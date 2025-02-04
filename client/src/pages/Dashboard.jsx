import React, {useState} from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Particles } from "react-tsparticles";
import { loadFull } from "tsparticles";
import { FaPaperPlane } from "react-icons/fa"; // Import PaperPlane icon
import axios from 'axios'

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  ArcElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [selectedOption, setSelectedOption] = useState("Select Option");
    const [inputValue, setInputValue] = useState("");

    const handleSubmit = async () => {
      console.log(inputValue);
      if (inputValue.trim()) {
        // Construct the URL by appending the input value to the base URL
        const baseUrl = "https://www.ebay.com/sch/i.html?_nkw=";
        // const query = encodeURIComponent(inputValue.trim()); // Encode the input value
        const url = baseUrl + inputValue;
  
        // console.log("URL:", url);
        const data = {
          baseUrl: baseUrl,  // First parameter
          endPoint: inputValue   // Second parameter
      };
  
      try {
          const response = await axios.post('http://localhost:3000/api/v1/firecrawl/scrap', data);
          console.log('Response:', response.data.data.parseData);
          console.log('Response:', response.data.data.originalData);
          setData(response.data.data.parseData)
      } catch (error) {
          console.error('Error:', error.response ? error.response.data : error.message);
      }
  
        // Open the URL in a new tab
        window.open(url, "_blank");
  
        // Clear the input field after submission
        setInputValue("");
      }
    };

  // Chart Data
  const marketData = {
    labels: ["Q1", "Q2", "Q3", "Q4"],
    datasets: [
      {
        label: "Private Credit",
        data: [12, 19, 14, 25],
        borderColor: "#3B82F6",
        fill: false,
      },
      {
        label: "Commodities",
        data: [8, 15, 10, 22],
        borderColor: "#F59E0B",
        fill: false,
      },
    ],
  };

  const competitorData = {
    labels: ["Brand A", "Brand B", "Brand C", "Brand D"],
    datasets: [
      {
        label: "Market Share (%)",
        data: [30, 25, 20, 25],
        borderColor: "#EF4444",
        fill: false,
      },
    ],
  };

  const suggestionsData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Engagement Rate",
        data: [3.5, 4.0, 3.8, 4.2],
        borderColor: "#10B981",
        fill: false,
      },
    ],
  };

  const trendData = {
    labels: ["2018", "2019", "2020", "2021", "2022"],
    datasets: [
      {
        label: "Growth Rate (%)",
        data: [10, 12, 15, 20, 25],
        borderColor: "#8B5CF6",
        fill: false,
      },
    ],
  };

  const particlesInit = async (engine) => {
    await loadFull(engine);
  };

  const chartOptions = {
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
    <div className="flex h-full bg-dark-900 text-white">
      {/* Main Content */}
      <div className="flex-1 h-full bg-gradient-to-b from-[#10162f] to-[#0b111e] text-white p-6">
        {/* Particles */}
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

        <h1 className="text-4xl md:text-6xl font-bold mb-12 text-center">
          Research & Insights
        </h1>

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

        {/* Market Insights */}
        {/* Pain Points & Engagement Metrics */}
        <div className="p-6 bg-gradient-to-b from-[#1a213a] to-[#161c30] rounded-xl shadow-md mb-6">
          <h2 className="text-xl font-bold mb-2">
            Pain Points & Engagement Metrics
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Analyze the challenges faced by users and monitor engagement levels
            to improve overall user experience.
          </p>

          {/* Pain Points List */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-[#10162f] p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-white">Pain Point 1</h3>
              <p className="text-sm text-gray-400 mt-2">
                Users find the platform navigation confusing and time-consuming.
              </p>
            </div>
            <div className="bg-[#10162f] p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-white">Pain Point 2</h3>
              <p className="text-sm text-gray-400 mt-2">
                Limited integration with third-party tools reduces efficiency.
              </p>
            </div>
            <div className="bg-[#10162f] p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-white">Pain Point 3</h3>
              <p className="text-sm text-gray-400 mt-2">
                Lack of real-time updates creates delays in decision-making.
              </p>
            </div>
            <div className="bg-[#10162f] p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-white">Pain Point 4</h3>
              <p className="text-sm text-gray-400 mt-2">
                Users report difficulty in tracking performance metrics over
                time.
              </p>
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="flex justify-between items-center space-x-6">
            {/* Engagement Graph */}
            <div className="w-1/2">
              <h3 className="text-lg font-semibold text-white mb-2">
                Weekly Engagement Rate
              </h3>
              <Line
                data={{
                  labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
                  datasets: [
                    {
                      label: "Engagement Rate (%)",
                      data: [45, 55, 50, 60],
                      borderColor: "#10B981",
                      fill: false,
                    },
                  ],
                }}
                options={{
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
                }}
              />
            </div>

            {/* Engagement Metrics Summary */}
            <div className="w-1/2 grid grid-cols-2 gap-4">
              <div className="bg-[#10162f] p-4 rounded-lg text-center shadow-md">
                <p className="text-gray-400 text-sm">Daily Active Users</p>
                <h3 className="text-2xl font-bold mt-2">12,530</h3>
                <p className="text-green-400 text-sm mt-1">
                  ▲ 8.25% from last week
                </p>
              </div>
              <div className="bg-[#10162f] p-4 rounded-lg text-center shadow-md">
                <p className="text-gray-400 text-sm">
                  Average Session Duration
                </p>
                <h3 className="text-2xl font-bold mt-2">5m 24s</h3>
                <p className="text-green-400 text-sm mt-1">
                  ▲ 3.12% from last week
                </p>
              </div>
              <div className="bg-[#10162f] p-4 rounded-lg text-center shadow-md">
                <p className="text-gray-400 text-sm">Bounce Rate</p>
                <h3 className="text-2xl font-bold mt-2">37.5%</h3>
                <p className="text-red-400 text-sm mt-1">
                  ▼ 2.50% from last week
                </p>
              </div>
              <div className="bg-[#10162f] p-4 rounded-lg text-center shadow-md">
                <p className="text-gray-400 text-sm">Total Signups</p>
                <h3 className="text-2xl font-bold mt-2">3,890</h3>
                <p className="text-green-400 text-sm mt-1">
                  ▲ 5.16% from last week
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Competitive Overview */}
        <div className="p-6 bg-gradient-to-b from-[#1a213a] to-[#161c30] rounded-xl shadow-md mb-6">
          <h2 className="text-xl font-bold mb-2">Competitive Overview</h2>
          <p className="text-sm text-gray-400 mb-4">
            Analyze the performance of competitor ads to gain insights and
            improve strategies.
          </p>

          {/* Competitor List */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-[#10162f] p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-white">Competitor X</h3>
              <p className="text-sm text-gray-400 mt-2">
                Review the ad performance of Competitor X to identify strengths
                and areas for improvement.
              </p>
              <button
                onClick={() =>
                  window.open("https://www.competitorx.com/ad-link", "_blank")
                }
                className="mt-4 py-2 px-4 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
              >
                Visit Ad
              </button>
              <div className="mt-4">
                <h4 className="text-md font-semibold text-white">
                  Ad Performance Insights
                </h4>
                <p className="text-sm text-gray-400 mt-2">
                  <strong>Engagement:</strong> High
                  <br />
                  <strong>Clicks:</strong> 1,500
                  <br />
                  <strong>Impressions:</strong> 50,000
                  <br />
                  <strong>Conversion Rate:</strong> 3.2%
                </p>
              </div>
            </div>
            <div className="bg-[#10162f] p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-white">Competitor Y</h3>
              <p className="text-sm text-gray-400 mt-2">
                Check out Competitor Y's ad strategy and performance metrics.
              </p>
              <button
                onClick={() =>
                  window.open("https://www.competitory.com/ad-link", "_blank")
                }
                className="mt-4 py-2 px-4 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
              >
                Visit Ad
              </button>
              <div className="mt-4">
                <h4 className="text-md font-semibold text-white">
                  Ad Performance Insights
                </h4>
                <p className="text-sm text-gray-400 mt-2">
                  <strong>Engagement:</strong> Medium
                  <br />
                  <strong>Clicks:</strong> 2,300
                  <br />
                  <strong>Impressions:</strong> 75,000
                  <br />
                  <strong>Conversion Rate:</strong> 2.5%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sentiments Data */}
        <div className="p-6 bg-gradient-to-b from-[#1a213a] to-[#161c30] rounded-xl shadow-md mb-6">
          <h2 className="text-xl font-bold mb-2">Sentiments Data</h2>
          <p className="text-sm text-gray-400 mb-4">
            Visualize the sentiment breakdown of your content.
          </p>

          {/* Sentiment Pie Chart */}
          <div className="flex justify-center mb-6">
            <div className="">
              {" "}
              {/* Control the size of the pie chart */}
              <Pie
                data={{
                  labels: ["Positive", "Negative", "Neutral"],
                  datasets: [
                    {
                      data: [1200, 300, 500], // Example data, replace with actual data
                      backgroundColor: ["#10B981", "#EF4444", "#3B82F6"], // Green, Red, Blue
                      hoverOffset: 4,
                    },
                  ],
                }}
              />
            </div>
          </div>

          {/* Sentiment Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#10162f] p-4 rounded-lg text-center shadow-md">
              <p className="text-gray-400 text-sm">Positive Sentiments</p>
              <h3 className="text-2xl font-bold mt-2">1200</h3>
            </div>
            <div className="bg-[#10162f] p-4 rounded-lg text-center shadow-md">
              <p className="text-gray-400 text-sm">Negative Sentiments</p>
              <h3 className="text-2xl font-bold mt-2">300</h3>
            </div>
            <div className="bg-[#10162f] p-4 rounded-lg text-center shadow-md">
              <p className="text-gray-400 text-sm">Neutral Sentiments</p>
              <h3 className="text-2xl font-bold mt-2">500</h3>
            </div>
          </div>
        </div>

        {/* Trend Analysis */}
        <div className="p-6 bg-gradient-to-b from-[#1a213a] to-[#161c30] rounded-xl shadow-md mb-6">
          <h2 className="text-xl font-bold mb-2">Trend Analysis</h2>
          <p className="text-sm text-gray-400 mb-4">
            Observe the yearly growth trends and predict future market
            trajectories.
          </p>
          <Line data={trendData} options={chartOptions} />
        </div>

        <div className="p-6 bg-gradient-to-b from-[#1a213a] to-[#161c30] rounded-xl shadow-md mb-6">
          <h2 className="text-xl font-bold mb-2">Hooks & Calls to Action</h2>
          <p className="text-sm text-gray-400 mb-4">
            Utilize these strategies to enhance user engagement and improve
            conversion rates. Explore the available hooks and CTAs.
          </p>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-[#10162f] p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-white">
                Hook 1: Limited Time Offer
              </h3>
              <p className="text-sm text-gray-400 mt-2">
                A sense of urgency can drive immediate action. Offer discounts
                or bonuses available for a limited time.
              </p>
              <button
                onClick={() =>
                  window.open("https://www.example.com/limited-offer", "_blank")
                }
                className="mt-4 py-2 px-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
              >
                Claim Offer
              </button>
              <div className="mt-4">
                <h4 className="text-md font-semibold text-white">
                  Performance Insights
                </h4>
                <p className="text-sm text-gray-400 mt-2">
                  <strong>Engagement:</strong> High
                  <br />
                  <strong>Conversion Rate:</strong> 7.5%
                </p>
              </div>
            </div>

            <div className="bg-[#10162f] p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-white">
                Hook 2: Free Trial
              </h3>
              <p className="text-sm text-gray-400 mt-2">
                Allow users to experience your product with no commitment. This
                encourages users to test the service.
              </p>
              <button
                onClick={() =>
                  window.open("https://www.example.com/free-trial", "_blank")
                }
                className="mt-4 py-2 px-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
              >
                Start Free Trial
              </button>
              <div className="mt-4">
                <h4 className="text-md font-semibold text-white">
                  Performance Insights
                </h4>
                <p className="text-sm text-gray-400 mt-2">
                  <strong>Engagement:</strong> Medium
                  <br />
                  <strong>Conversion Rate:</strong> 5.2%
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#10162f] p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-white">
                Hook 3: Referral Program
              </h3>
              <p className="text-sm text-gray-400 mt-2">
                Reward users for referring others to the platform. This can
                drive both engagement and new user acquisition.
              </p>
              <button
                onClick={() =>
                  window.open(
                    "https://www.example.com/referral-program",
                    "_blank"
                  )
                }
                className="mt-4 py-2 px-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
              >
                Refer a Friend
              </button>
              <div className="mt-4">
                <h4 className="text-md font-semibold text-white">
                  Performance Insights
                </h4>
                <p className="text-sm text-gray-400 mt-2">
                  <strong>Engagement:</strong> High
                  <br />
                  <strong>Conversion Rate:</strong> 10.0%
                </p>
              </div>
            </div>

            <div className="bg-[#10162f] p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-white">Early Access</h3>
              <p className="text-sm text-gray-400 mt-2">
                Let users be the first to try new features or products. This can
                create excitement and exclusivity.
              </p>
              <button
                onClick={() =>
                  window.open("https://www.example.com/early-access", "_blank")
                }
                className="mt-4 py-2 px-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
              >
                Get Early Access
              </button>
              <div className="mt-4">
                <h4 className="text-md font-semibold text-white">
                  Performance Insights
                </h4>
                <p className="text-sm text-gray-400 mt-2">
                  <strong>Engagement:</strong> Medium
                  <br />
                  <strong>Conversion Rate:</strong> 4.8%
                </p>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Dashboard;
