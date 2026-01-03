# Chunk 2.12 — ThemeEditor Layout

## Purpose
Create the main theme editor page layout with sidebar and editor areas.

---

## Inputs
- Theme data from themeService
- Route /themes/:id/edit

## Outputs
- ThemeEditor page layout (consumed by chunk 2.13-2.20)
- Token selection state

---

## Dependencies
- Chunk 2.01 must be complete
- Chunk 1.08 must be complete

---

## Implementation Notes

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ Header: Theme Name | Status | Save | Preview Toggle     │
├────────────┬────────────────────────────────────────────┤
│ Category   │ Token List          │ Editor Panel        │
│ Sidebar    │                     │                     │
│            │                     │                     │
│ - Color    │ [Token items]       │ [Token editor]      │
│ - Type     │                     │                     │
│ - Spacing  │                     │                     │
│ - Shadow   │                     │                     │
│ - Radius   │                     │                     │
│ - Grid     │                     │                     │
├────────────┴─────────────────────┴─────────────────────┤
│ Preview Panel (collapsible)                             │
└─────────────────────────────────────────────────────────┘
```

### Component Structure

```jsx
// src/pages/ThemeEditorPage.jsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { tokenService } from '../services/tokenService';
import { useThemeContext } from '../contexts/ThemeContext';
import EditorHeader from '../components/themes/editor/EditorHeader';
import CategorySidebar from '../components/themes/editor/CategorySidebar';
import TokenList from '../components/themes/editor/TokenList';
import TokenEditorPanel from '../components/themes/editor/TokenEditorPanel';
import ThemePreview from '../components/themes/preview/ThemePreview';
import { EditorSkeleton } from '../components/ui/Skeleton';

export default function ThemeEditorPage() {
  const { id } = useParams();
  const { data: theme, isLoading, mutate } = useTheme(id);
  const { refreshTheme } = useThemeContext();
  
  const [activeCategory, setActiveCategory] = useState('color');
  const [selectedToken, setSelectedToken] = useState(null);
  const [showPreview, setShowPreview] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  const handleTokenUpdate = async (tokenId, updates) => {
    try {
      await tokenService.updateToken(tokenId, updates);
      setHasChanges(true);
      
      // Optimistic update
      mutate(prev => ({
        ...prev,
        tokens: prev.tokens.map(t => 
          t.id === tokenId ? { ...t, ...updates } : t
        )
      }), false);
      
      // Refresh context to update CSS variables
      await refreshTheme();
    } catch (error) {
      toast.error('Failed to update token');
    }
  };

  const handleAddToken = async (tokenData) => {
    try {
      const newToken = await tokenService.createToken({
        ...tokenData,
        theme_id: id
      });
      mutate();
      setSelectedToken(newToken);
      setHasChanges(true);
    } catch (error) {
      toast.error('Failed to add token');
    }
  };

  const handleDeleteToken = async (tokenId) => {
    try {
      await tokenService.deleteToken(tokenId);
      if (selectedToken?.id === tokenId) {
        setSelectedToken(null);
      }
      mutate();
      setHasChanges(true);
    } catch (error) {
      toast.error('Failed to delete token');
    }
  };

  if (isLoading) return <EditorSkeleton />;

  const categoryTokens = theme.tokens?.filter(t => t.category === activeCategory) || [];

  return (
    <div className="theme-editor">
      <EditorHeader 
        theme={theme}
        hasChanges={hasChanges}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview(!showPreview)}
      />

      <div className="editor-body">
        <CategorySidebar
          tokens={theme.tokens}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        <div className="editor-main">
          <TokenList
            tokens={categoryTokens}
            category={activeCategory}
            selectedToken={selectedToken}
            onSelectToken={setSelectedToken}
            onAddToken={handleAddToken}
            onDeleteToken={handleDeleteToken}
          />

          <TokenEditorPanel
            token={selectedToken}
            category={activeCategory}
            onUpdate={(updates) => handleTokenUpdate(selectedToken.id, updates)}
          />
        </div>
      </div>

      {showPreview && (
        <ThemePreview theme={theme} />
      )}
    </div>
  );
}
```

---

## Files Created
- `src/pages/ThemeEditorPage.jsx` — Main editor page
- `src/components/themes/editor/EditorHeader.jsx` — Editor header
- `src/styles/theme-editor.css` — Editor layout styles

---

## Tests

### Unit Tests
- [ ] Renders loading skeleton
- [ ] Shows category sidebar
- [ ] Shows token list for active category
- [ ] Shows editor panel when token selected
- [ ] Category change updates token list
- [ ] Token update refreshes context
- [ ] Preview toggle works

---

## Time Estimate
3 hours

---

## Notes
This is the main editor layout that hosts all category-specific editors. The three-column layout (sidebar/list/editor) provides clear navigation while keeping the editor panel visible.
