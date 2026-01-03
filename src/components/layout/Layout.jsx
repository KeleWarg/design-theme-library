/**
 * @chunk 1.11 - App Shell & Routing
 * Main layout wrapper with header and sidebar
 */
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="layout">
      <Header onMenuToggle={toggleSidebar} />
      <div className="layout-body">
        {/* Mobile overlay */}
        <div 
          className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
          onClick={closeSidebar}
          aria-hidden="true"
        />
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

