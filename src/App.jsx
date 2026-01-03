/**
 * @chunk 1.11 - App Shell & Routing
 * Root component with React Router configuration
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Layout } from './components/layout'
import {
  Dashboard,
  ThemesPage,
  ThemeEditorPage,
  TypographyPage,
  ComponentsPage,
  ComponentDetailPage,
  FigmaImportPage,
  SettingsPage,
} from './pages'

export default function App() {
  return (
    <BrowserRouter>
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--color-background)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-foreground)',
          },
        }}
      />
      
      <Routes>
        <Route element={<Layout />}>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Themes */}
          <Route path="/themes" element={<ThemesPage />} />
          <Route path="/themes/:id" element={<ThemeEditorPage />} />
          <Route path="/themes/:id/typography" element={<TypographyPage />} />
          
          {/* Components */}
          <Route path="/components" element={<ComponentsPage />} />
          <Route path="/components/:id" element={<ComponentDetailPage />} />
          
          {/* Figma Import */}
          <Route path="/figma-import" element={<FigmaImportPage />} />
          
          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

