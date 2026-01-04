/**
 * @chunk 3.04 - AddComponentDropdown
 * 
 * Dropdown menu for different component creation methods.
 * Provides options for manual creation, AI generation, and Figma import.
 */

import { Plus, PenTool, Sparkles, Figma } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import DropdownMenu from '../ui/DropdownMenu';
import './AddComponentDropdown.css';

export default function AddComponentDropdown() {
  const navigate = useNavigate();

  const handleManualCreate = () => {
    navigate('/components/new?mode=manual');
  };

  const handleAIGenerate = () => {
    navigate('/components/new?mode=ai');
  };

  const handleFigmaExtract = () => {
    navigate('/components/new?mode=figma');
  };

  return (
    <DropdownMenu
      trigger={
        <Button variant="primary">
          <Plus size={16} />
          Add Component
        </Button>
      }
      align="right"
    >
      <DropdownMenu.Item onClick={handleManualCreate}>
        <PenTool size={16} className="dropdown-item-icon" />
        <div className="dropdown-item-content">
          <span className="dropdown-item-title">Create Manually</span>
          <span className="dropdown-item-description">Define props and code by hand</span>
        </div>
      </DropdownMenu.Item>
      
      <DropdownMenu.Item onClick={handleAIGenerate}>
        <Sparkles size={16} className="dropdown-item-icon" />
        <div className="dropdown-item-content">
          <span className="dropdown-item-title">Generate with AI</span>
          <span className="dropdown-item-description">Describe your component</span>
        </div>
      </DropdownMenu.Item>
      
      <DropdownMenu.Separator />
      
      <DropdownMenu.Item onClick={handleFigmaExtract}>
        <Figma size={16} className="dropdown-item-icon" />
        <div className="dropdown-item-content">
          <span className="dropdown-item-title">Extract from Figma</span>
          <span className="dropdown-item-description">Import via Figma plugin</span>
        </div>
      </DropdownMenu.Item>
    </DropdownMenu>
  );
}
