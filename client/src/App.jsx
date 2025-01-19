import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Sidebar from './components/Sidebar'
import Team from './pages/Team';
import Research from './pages/Research';

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
    <div className="min-h-screen bg-[#0B0F1C] text-white">
      {/* Navbar */}
      

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/home" element={<Home />} />
        <Route path="/team" element={<Team />} />
        <Route path="/research" element={<Research/>} />
        <Route path="*" element={<Sidebar />} />
      </Routes>
    </div>
  </Router>
  )
}

export default App
