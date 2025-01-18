import React, { useState, useRef } from "react";
import { FiSend } from "react-icons/fi";
import { AiOutlineUser, AiOutlineRobot } from "react-icons/ai";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const handleSend = () => {
    if (input.trim() === "") return;

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: input },
      { sender: "bot", text: `You said: ${input}` },
    ]);

    setInput("");
    scrollToBottom();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex items-center justify-center p-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-7xl">
        <div className="flex flex-col justify-center bg-gradient-to-r from-blue-600 to-purple-800 text-white p-10 rounded-lg shadow-lg h-full">
          <h1 className="text-4xl font-extrabold mb-4">Welcome to AI Chat</h1>
          <p className="text-lg mb-6">
            Discover the power of conversational AI. Engage with an intelligent chatbot to explore ideas, answer questions, and much more.
          </p>
          <button className="py-3 px-6 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition duration-300">
            Learn More
          </button>
        </div>

        <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white rounded-lg shadow-lg overflow-hidden">
          <header className="py-4 px-6 bg-gray-800 shadow-lg">
            <h2 className="text-xl font-bold text-center">AI Chat</h2>
          </header>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-lg p-4 rounded-lg shadow-lg text-sm ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-700 text-gray-200"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <div className="flex items-center space-x-2">
                      <span>{msg.text}</span>
                      <AiOutlineUser className="text-lg" />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <AiOutlineRobot className="text-lg" />
                      <span>{msg.text}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="bg-gray-800 p-4 flex items-center">
            <input
              type="text"
              className="flex-1 p-3 rounded-lg bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              className="ml-4 p-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition duration-300"
              onClick={handleSend}
            >
              <FiSend className="text-white text-xl" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
