/**
 * @chunk 6.06 - Empty States
 * 
 * Component-related empty state components.
 */

import { Box, Code, Search, Filter, Plus } from 'lucide-react';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import AddComponentDropdown from '../components/AddComponentDropdown';

export function NoComponentsEmpty({ onAddClick }) {
  return (
    <EmptyState
      icon={Box}
      title="No components yet"
      description="Add components manually, with AI, or from Figma"
      action={
        onAddClick ? (
          <Button onClick={onAddClick}>
            <Plus size={16} />
            Add Component
          </Button>
        ) : (
          <AddComponentDropdown />
        )
      }
    />
  );
}

export function NoExamplesEmpty({ onAddClick }) {
  return (
    <EmptyState
      icon={Code}
      title="No examples yet"
      description="Add usage examples to help others understand how to use this component"
      action={
        onAddClick && (
          <Button variant="ghost" onClick={onAddClick}>
            <Plus size={16} />
            Add Example
          </Button>
        )
      }
    />
  );
}

export function NoSearchResults({ query, onClear }) {
  return (
    <EmptyState
      icon={Search}
      title={`No results for '${query}'`}
      description="Try a different search term"
      action={
        onClear && (
          <Button variant="ghost" onClick={onClear}>
            Clear Search
          </Button>
        )
      }
    />
  );
}

export function NoFilterResults({ onClear }) {
  return (
    <EmptyState
      icon={Filter}
      title="No matching items"
      description="No items match the current filters. Try adjusting your filters."
      action={
        onClear && (
          <Button variant="ghost" onClick={onClear}>
            Clear Filters
          </Button>
        )
      }
    />
  );
}





