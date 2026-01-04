/**
 * @chunk 2.03 - CreateThemeModal
 * 
 * Modal for creating new themes with options for blank or import.
 * Two creation paths: "Start from Scratch" or "Import from JSON"
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { themeService } from '../../services/themeService';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { Sparkles, Upload } from 'lucide-react';
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
      
      toast.success('Theme created successfully');
      handleClose();
      
      if (mode === 'import') {
        navigate(`/themes/import?themeId=${theme.id}`);
      } else {
        navigate(`/themes/${theme.id}/edit`);
      }
    } catch (error) {
      console.error('Failed to create theme:', error);
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
        icon={Sparkles}
        title="Start from Scratch"
        description="Create a blank theme and add tokens manually"
        onClick={() => onSelect('scratch')}
      />
      <ModeCard
        icon={Upload}
        title="Import from JSON"
        description="Import tokens from Figma Variables export"
        onClick={() => onSelect('import')}
      />
    </div>
  );
}

function ModeCard({ icon: Icon, title, description, onClick }) {
  return (
    <button type="button" className="mode-card" onClick={onClick}>
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


