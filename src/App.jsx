/**
 * @chunk 1.11 - App Shell & Routing
 * Root component with React Router configuration
 * Updated in @chunk 2.04 to include ThemeProvider
 * Updated in @chunk 2.06 to include CssVariableDebugger
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ThemeProvider } from './contexts'
import { Layout } from './components/layout'
import { CssVariableDebugger } from './components/dev'
import { MissingSupabaseConfig } from './components/ui'
import { getSupabaseEnvStatus } from './lib/requiredEnv'
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
  IconsPage,
  QAPage,
} from './pages'

export default function App() {
  const { isMissing, missingKeys } = getSupabaseEnvStatus(import.meta.env)

  // If Supabase isn't configured in production, the app can't function.
  // Render a clear error screen instead of crashing at import-time.
  if (import.meta.env.MODE === 'production' && isMissing) {
    return <MissingSupabaseConfig missingKeys={missingKeys} />
  }

  return (
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
            
            {/* Icons */}
            <Route path="/icons" element={<IconsPage />} />
            
            {/* Settings */}
            <Route path="/settings" element={<SettingsPage />} />

            {/* Visual QA */}
            <Route path="/qa" element={<QAPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      
      {/* Development-only CSS variable debugger */}
      <CssVariableDebugger />
    </ThemeProvider>
  )
}

