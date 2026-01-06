/**
 * @chunk 1.11 - App Shell & Routing
 * @chunk 5.01 - ExportModal Shell
 * 
 * Application header with logo and export button
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Layers, Menu, Download } from 'lucide-react'
import { ExportModal } from '../export'

export default function Header({ onMenuToggle }) {
  const [exportModalOpen, setExportModalOpen] = useState(false)

  return (
    <>
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
          <button 
            className="btn btn-primary"
            onClick={() => setExportModalOpen(true)}
          >
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </header>

      <ExportModal 
        open={exportModalOpen} 
        onClose={() => setExportModalOpen(false)} 
      />
    </>
  )
}
