import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Landing from './pages/Landing'
import Admin from './pages/Admin'
import Room from './pages/Room'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/:id" element={<Room />} />
      </Routes>
    </Router>
  )
}

export default App
