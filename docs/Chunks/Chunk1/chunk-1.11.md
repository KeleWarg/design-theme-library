# Chunk 1.11 — App Shell & Routing

## Purpose
Create application shell with navigation and route configuration.

---

## Inputs
- Vite + React project scaffold

## Outputs
- App shell with header/sidebar (consumed by all pages)
- Route configuration (consumed by all pages)
- Placeholder pages for each route

---

## Dependencies
- None (can run parallel with database work)

---

## Implementation Notes

### Key Considerations
- Use React Router v6
- Responsive sidebar (collapsible on mobile)
- Active state indicators
- ThemeSelector placeholder in header

### Routes
```
/                       → Dashboard
/themes                 → ThemesPage
/themes/new             → CreateThemePage
/themes/import          → ImportWizardPage
/themes/:id             → ThemeDetailPage
/themes/:id/edit        → ThemeEditorPage
/components             → ComponentsPage
/components/new         → CreateComponentPage
/components/:id         → ComponentDetailPage
/settings               → SettingsPage
```

### Layout Structure
```jsx
<Layout>
  <Header>
    <Logo />
    <ThemeSelector /> {/* placeholder */}
    <ExportButton />
  </Header>
  <div className="layout-body">
    <Sidebar>
      <NavLink to="/themes">Themes</NavLink>
      <NavLink to="/components">Components</NavLink>
      <NavLink to="/settings">Settings</NavLink>
    </Sidebar>
    <Main>
      <Outlet /> {/* Route content */}
    </Main>
  </div>
</Layout>
```

### App Component
```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import ThemesPage from './pages/ThemesPage';
import ThemeDetailPage from './pages/ThemeDetailPage';
import ThemeEditorPage from './pages/ThemeEditorPage';
import ComponentsPage from './pages/ComponentsPage';
import ComponentDetailPage from './pages/ComponentDetailPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/themes" element={<ThemesPage />} />
          <Route path="/themes/new" element={<ThemesPage />} />
          <Route path="/themes/import" element={<ThemesPage />} />
          <Route path="/themes/:id" element={<ThemeDetailPage />} />
          <Route path="/themes/:id/edit" element={<ThemeEditorPage />} />
          <Route path="/components" element={<ComponentsPage />} />
          <Route path="/components/new" element={<ComponentsPage />} />
          <Route path="/components/:id" element={<ComponentDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

### Sidebar Component
```jsx
// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { 
  PaletteIcon, 
  BoxIcon, 
  SettingsIcon 
} from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <NavLink 
          to="/themes" 
          className={({ isActive }) => 
            `nav-link ${isActive ? 'active' : ''}`
          }
        >
          <PaletteIcon size={20} />
          <span>Themes</span>
        </NavLink>
        <NavLink 
          to="/components"
          className={({ isActive }) => 
            `nav-link ${isActive ? 'active' : ''}`
          }
        >
          <BoxIcon size={20} />
          <span>Components</span>
        </NavLink>
        <NavLink 
          to="/settings"
          className={({ isActive }) => 
            `nav-link ${isActive ? 'active' : ''}`
          }
        >
          <SettingsIcon size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
}
```

### Placeholder Page
```jsx
// src/pages/ThemesPage.jsx
export default function ThemesPage() {
  return (
    <div className="page themes-page">
      <header className="page-header">
        <h1>Themes</h1>
        <button className="btn btn-primary">
          Create Theme
        </button>
      </header>
      <main className="page-content">
        {/* Theme list will go here */}
        <p>Theme list placeholder</p>
      </main>
    </div>
  );
}
```

### Base Styles
```css
/* src/styles/layout.css */
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.layout-body {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 240px;
  background: var(--color-muted);
  border-right: 1px solid var(--color-border);
  padding: 1rem 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--color-foreground);
  text-decoration: none;
  transition: background 0.15s;
}

.nav-link:hover {
  background: rgba(0,0,0,0.05);
}

.nav-link.active {
  background: var(--color-primary);
  color: white;
}

.main {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -240px;
    top: 60px;
    bottom: 0;
    z-index: 100;
    transition: left 0.3s;
  }
  
  .sidebar.open {
    left: 0;
  }
}
```

---

## Files Created
- `src/App.jsx` — Root component with router
- `src/components/layout/Layout.jsx` — Main layout wrapper
- `src/components/layout/Header.jsx` — App header
- `src/components/layout/Sidebar.jsx` — Navigation sidebar
- `src/pages/Dashboard.jsx` — Dashboard placeholder
- `src/pages/ThemesPage.jsx` — Themes list placeholder
- `src/pages/ThemeDetailPage.jsx` — Theme detail placeholder
- `src/pages/ThemeEditorPage.jsx` — Theme editor placeholder
- `src/pages/ComponentsPage.jsx` — Components list placeholder
- `src/pages/ComponentDetailPage.jsx` — Component detail placeholder
- `src/pages/SettingsPage.jsx` — Settings placeholder
- `src/styles/layout.css` — Layout styles

---

## Tests

### Verification
- [ ] All routes render without error
- [ ] Navigation links work
- [ ] Active state shows correctly
- [ ] Responsive layout works on mobile
- [ ] Sidebar collapses on small screens

---

## Time Estimate
3 hours

---

## Notes
This establishes the application structure. Placeholder pages will be replaced in Phase 2 and Phase 3. The ThemeSelector in the header will be implemented in chunk 2.05.
