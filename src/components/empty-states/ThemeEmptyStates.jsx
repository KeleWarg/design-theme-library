/**
 * @chunk 6.06 - Empty States
 * 
 * Theme-related empty state components.
 */

import { Palette, Type, Ruler, Layers, Circle, Grid, Box } from 'lucide-react';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import { Plus } from 'lucide-react';

export function NoThemesEmpty({ onCreateClick }) {
  return (
    <EmptyState
      icon={Palette}
      title="No themes yet"
      description="Create your first theme to get started"
      action={
        <Button onClick={onCreateClick}>
          <Plus size={16} />
          Create Theme
        </Button>
      }
    />
  );
}

export function NoTokensEmpty({ category, onAddClick }) {
  const categoryIcons = {
    color: Palette,
    typography: Type,
    spacing: Ruler,
    shadow: Layers,
    radius: Circle,
    grid: Grid,
  };
  
  const Icon = categoryIcons[category] || Box;
  
  return (
    <EmptyState
      icon={Icon}
      title={`No ${category} tokens`}
      description="Add tokens or import from design file"
      action={
        onAddClick && (
          <Button variant="ghost" onClick={onAddClick}>
            <Plus size={16} />
            Add Token
          </Button>
        )
      }
    />
  );
}



