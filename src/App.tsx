import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Landing from './pages/Landing'
import New from './pages/New'
import Room from './pages/Room'
import MyPage from './pages/MyPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/new" element={<New />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/:id" element={<Room />} />
      </Routes>
    </Router>
  )
}

export default App
