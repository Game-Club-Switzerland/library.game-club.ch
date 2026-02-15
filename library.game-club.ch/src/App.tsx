import { Route, Routes } from 'react-router-dom'
import AdminPage from './pages/AdminPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import AuthSteamPage from './pages/AuthSteamPage'
import GameDetailPage from './pages/GameDetailPage'
import GamesPage from './pages/GamesPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import AppLayout from './components/AppLayout'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="games" element={<GamesPage />} />
        <Route path="game/:appid" element={<GameDetailPage />} />
        <Route path="auth/steam" element={<AuthSteamPage />} />
        <Route path="auth/steam/callback" element={<AuthCallbackPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
