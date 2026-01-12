/**
 * @chunk 1.11 - App Shell & Routing
 * Navigation sidebar with links to main sections
 */
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard,
  Palette, 
  Box,
  Settings 
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/themes', icon: Palette, label: 'Themes' },
  { to: '/components', icon: Box, label: 'Components' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) => 
              `nav-link ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}


