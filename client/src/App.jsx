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
    <h1>Hello world!</h1>
  )
}

export default App
