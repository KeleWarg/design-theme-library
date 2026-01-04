/**
 * @chunk 1.11 - App Shell & Routing
 * Root component with React Router configuration
 * Updated in @chunk 2.04 to include ThemeProvider
 * Updated in @chunk 2.06 to include CssVariableDebugger
 * Updated in @chunk 6.05 to include ErrorBoundary
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ThemeProvider } from './contexts'
import { Layout } from './components/layout'
import { CssVariableDebugger } from './components/dev'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import {
  Dashboard,
  ThemesPage,
  ThemeEditorPage,
  TypographyPage,
  ImportWizardPage,
  ComponentsPage,
  CreateComponentPage,
  ComponentDetailPage,
  FigmaImportPage,
  SettingsPage,
} from './pages'

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
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
              <Route path="/themes/import" element={<ImportWizardPage />} />
              <Route path="/themes/:id" element={<ThemeEditorPage />} />
              <Route path="/themes/:id/typography" element={<TypographyPage />} />
              
              {/* Components */}
              <Route path="/components" element={<ComponentsPage />} />
              <Route path="/components/new" element={<CreateComponentPage />} />
              <Route path="/components/:id" element={<ComponentDetailPage />} />
              
              {/* Figma Import */}
              <Route path="/figma-import" element={<FigmaImportPage />} />
              
              {/* Settings */}
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        
        {/* Development-only CSS variable debugger */}
        <CssVariableDebugger />
      </ThemeProvider>
    </ErrorBoundary>
  )
}

