# Chunk 2.03 — CreateThemeModal

## Purpose
Modal for creating new themes with options for blank or import.

---

## Inputs
- themeService (from chunk 1.07)
- ThemesPage container (from chunk 2.01)

## Outputs
- CreateThemeModal component (consumed by ThemesPage)
- Theme creation flow

---

## Dependencies
- Chunk 2.01 must be complete
- Chunk 1.07 must be complete

---

## Implementation Notes

### Key Considerations
- Two creation paths: "Start from Scratch" or "Import from JSON"
- Name validation (required, max 50 chars)
- Description optional (max 200 chars)
- Navigate to editor after creation

### Component Structure

```jsx
// src/components/themes/CreateThemeModal.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { themeService } from '../../services/themeService';
import { Modal, Input, Textarea, Button } from '../ui';
import { SparklesIcon, UploadIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateThemeModal({ open, onClose }) {
  const [mode, setMode] = useState(null); // null, 'scratch', 'import'
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const resetForm = () => {
    setMode(null);
    setName('');
    setDescription('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsCreating(true);
    try {
      const theme = await themeService.createTheme({
        name: name.trim(),
        description: description.trim() || null,
        source: mode === 'import' ? 'import' : 'manual'
      });
      
      handleClose();
      
      if (mode === 'import') {
        navigate(`/themes/import?themeId=${theme.id}`);
      } else {
        navigate(`/themes/${theme.id}/edit`);
      }
    } catch (error) {
      toast.error('Failed to create theme');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Create Theme">
      {!mode ? (
        <ModeSelection onSelect={setMode} />
      ) : (
        <ThemeForm
          mode={mode}
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          isCreating={isCreating}
          onBack={() => setMode(null)}
          onSubmit={handleCreate}
        />
      )}
    </Modal>
  );
}

function ModeSelection({ onSelect }) {
  return (
    <div className="mode-selection">
      <ModeCard
        icon={SparklesIcon}
        title="Start from Scratch"
        description="Create a blank theme and add tokens manually"
        onClick={() => onSelect('scratch')}
      />
      <ModeCard
        icon={UploadIcon}
        title="Import from JSON"
        description="Import tokens from Figma Variables export"
        onClick={() => onSelect('import')}
      />
    </div>
  );
}

function ModeCard({ icon: Icon, title, description, onClick }) {
  return (
    <button className="mode-card" onClick={onClick}>
      <div className="mode-icon">
        <Icon size={24} />
      </div>
      <div className="mode-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </button>
  );
}

function ThemeForm({ 
  mode, 
  name, 
  setName, 
  description, 
  setDescription, 
  isCreating,
  onBack,
  onSubmit 
}) {
  return (
    <form onSubmit={onSubmit} className="theme-form">
      <Input
        label="Theme Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={50}
        required
        autoFocus
        placeholder="e.g., Brand Dark"
      />
      <Textarea
        label="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={200}
        placeholder="A brief description of this theme"
        rows={3}
      />
      <div className="modal-actions">
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button 
          type="submit" 
          loading={isCreating} 
          disabled={!name.trim()}
        >
          {mode === 'import' ? 'Continue to Import' : 'Create Theme'}
        </Button>
      </div>
    </form>
  );
}
```

### Styling
```css
/* src/styles/create-theme-modal.css */
.mode-selection {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mode-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s, background 0.2s;
}

.mode-card:hover {
  border-color: var(--color-primary);
  background: #f1f5f9;
}

.mode-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  color: var(--color-primary);
}

.mode-content h3 {
  margin: 0 0 0.25rem;
  font-size: 0.9375rem;
  font-weight: 600;
}

.mode-content p {
  margin: 0;
  font-size: 0.8125rem;
  color: #64748b;
}

.theme-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}
```

---

## Files Created
- `src/components/themes/CreateThemeModal.jsx` — Creation modal
- `src/components/ui/Modal.jsx` — Base modal component
- `src/components/ui/Input.jsx` — Form input
- `src/components/ui/Textarea.jsx` — Form textarea
- `src/styles/create-theme-modal.css` — Modal styles

---

## Tests

### Unit Tests
- [ ] Modal opens/closes correctly
- [ ] Mode selection renders two options
- [ ] Selecting mode shows form
- [ ] Back button returns to mode selection
- [ ] Name validation prevents empty submission
- [ ] Character limits enforced
- [ ] Submit calls themeService.createTheme
- [ ] Navigates to editor for 'scratch' mode
- [ ] Navigates to import for 'import' mode
- [ ] Form resets on close

---

## Time Estimate
2 hours

---

## Notes
The two-step flow (mode selection → form) keeps the modal clean while supporting multiple creation paths. The import flow continues in chunk 2.07.
