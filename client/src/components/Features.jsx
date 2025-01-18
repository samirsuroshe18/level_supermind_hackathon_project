import React from "react";

const Features = () => {
  return (
    <div className="bg-gradient-to-r from-gray-800 via-purple-900 to-black text-white py-16 px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-8">Your Gateway to Tokenized Assets</h2>
        <p className="text-lg text-gray-400 mb-12">
          RWA.xyz simplifies tokenization on public blockchains, offering transparent insights and tools for professionals navigating the tokenized asset ecosystem.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <div className="bg-indigo-800 text-white rounded-full h-32 w-32 flex items-center justify-center text-xl font-semibold mb-4">
              $75,125
            </div>
            <p className="text-gray-400">Total RWA Value</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-purple-600 text-white rounded-full h-32 w-32 flex items-center justify-center text-xl font-semibold mb-4">
              $37,708
            </div>
            <p className="text-gray-400">Real Estate</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-teal-500 text-white rounded-full h-32 w-32 flex items-center justify-center text-xl font-semibold mb-4">
              $1,100
            </div>
            <p className="text-gray-400">Commodities</p>
          </div>

          

          <div className="col-span-full text-left grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-center">AI-Driven Insights
              </h3>
              <p className="text-gray-400">
              AdVise uses advanced AI algorithms to analyze user behavior, competitor strategies, and market trends, providing actionable insights for crafting compelling ads that resonate with your audience.


              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-center">Competitor Ad Analysis</h3>
              <p className="text-gray-400">
              AdVise helps you stay ahead of the competition by analyzing top-performing ads from competitors. Discover their hooks, CTAs, and strategies to incorporate in your own campaigns.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-center">Trending Hooks & CTAs</h3>
              <p className="text-gray-400">
              Identify high-performing hooks and calls-to-action (CTAs) that drive engagement. AdVise analyzes market trends to suggest the most effective messaging for your target audience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
