/**
 * @chunk 1.11 - App Shell & Routing
 * @chunk 2.05 - ThemeSelector (Header)
 * 
 * Application header with logo, theme selector, and export button
 */
import { Link } from 'react-router-dom'
import { Layers, Menu, Download } from 'lucide-react'
import ThemeSelector from './ThemeSelector'

export default function Header({ onMenuToggle }) {
  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="menu-toggle" 
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <Menu size={24} />
        </button>
        <Link to="/" className="header-logo">
          <div className="header-logo-icon">
            <Layers size={20} />
          </div>
          <span>Design System</span>
        </Link>
      </div>
      
      <div className="header-right">
        <ThemeSelector />
        
        <button className="btn btn-primary">
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>
    </header>
  )
}
