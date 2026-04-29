import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from './theme'
import Landing from './pages/Landing'
import New from './pages/New'
import Room from './pages/Room'
import MyPage from './pages/MyPage'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/new" element={<New />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/:id" element={<Room />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
