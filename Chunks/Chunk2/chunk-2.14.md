# Chunk 2.14 — TokenList

## Purpose
Scrollable list of tokens within the active category.

---

## Inputs
- Filtered tokens by category
- Selected token state

## Outputs
- TokenList component
- Token selection handling
- Add/delete token actions

---

## Dependencies
- Chunk 2.12 must be complete

---

## Implementation Notes

### Component Structure

```jsx
// src/components/themes/editor/TokenList.jsx
import { useState } from 'react';
import { PlusIcon, TrashIcon, SearchIcon } from 'lucide-react';
import { Input, Button, DropdownMenu } from '../../ui';
import TokenListItem from './TokenListItem';
import AddTokenModal from './AddTokenModal';
import { cn } from '../../../lib/utils';

export default function TokenList({ 
  tokens, 
  category, 
  selectedToken, 
  onSelectToken,
  onAddToken,
  onDeleteToken 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredTokens = tokens.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="token-list-container">
      <div className="token-list-header">
        <Input
          placeholder="Search tokens..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<SearchIcon size={16} />}
          size="sm"
        />
        <Button 
          size="sm" 
          variant="ghost"
          onClick={() => setShowAddModal(true)}
        >
          <PlusIcon size={16} />
        </Button>
      </div>

      <div className="token-list">
        {filteredTokens.length === 0 ? (
          <div className="empty-list">
            {searchQuery ? (
              <p>No tokens match "{searchQuery}"</p>
            ) : (
              <>
                <p>No {category} tokens yet</p>
                <Button size="sm" onClick={() => setShowAddModal(true)}>
                  Add Token
                </Button>
              </>
            )}
          </div>
        ) : (
          filteredTokens.map(token => (
            <TokenListItem
              key={token.id}
              token={token}
              isSelected={selectedToken?.id === token.id}
              onSelect={() => onSelectToken(token)}
              onDelete={() => onDeleteToken(token.id)}
            />
          ))
        )}
      </div>

      <AddTokenModal
        open={showAddModal}
        category={category}
        onClose={() => setShowAddModal(false)}
        onAdd={onAddToken}
      />
    </div>
  );
}

function TokenListItem({ token, isSelected, onSelect, onDelete }) {
  return (
    <div 
      className={cn('token-list-item', { selected: isSelected })}
      onClick={onSelect}
    >
      <TokenPreview token={token} size="sm" />
      <div className="token-info">
        <span className="token-name">{token.name}</span>
        <span className="token-path">{token.path}</span>
      </div>
      <DropdownMenu>
        <DropdownMenu.Item danger onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <TrashIcon size={14} /> Delete
        </DropdownMenu.Item>
      </DropdownMenu>
    </div>
  );
}
```

---

## Files Created
- `src/components/themes/editor/TokenList.jsx` — Token list
- `src/components/themes/editor/TokenListItem.jsx` — Individual item
- `src/components/themes/editor/AddTokenModal.jsx` — Add token modal

---

## Tests

### Unit Tests
- [ ] Renders all tokens
- [ ] Search filters tokens
- [ ] Empty state shows add button
- [ ] Click selects token
- [ ] Delete removes token

---

## Time Estimate
2 hours

---

## Notes
The token list provides search and CRUD operations for tokens within a category. The compact preview helps users identify tokens quickly.
