import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import Navbar from './Navbar'

function AppLayout() {
  return (
    <div className="app-shell bg-grid">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default AppLayout
