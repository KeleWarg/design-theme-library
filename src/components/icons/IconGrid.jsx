/**
 * @chunk B.4 - IconGrid Component
 * 
 * Grid layout component for displaying icons.
 */

import IconCard from './IconCard';

export default function IconGrid({ icons, onDelete, onSelect, selectedIds }) {
  if (!icons || icons.length === 0) {
    return null;
  }

  return (
    <div className="icon-grid">
      {icons.map(icon => (
        <IconCard
          key={icon.id}
          icon={icon}
          onDelete={onDelete}
          onSelect={onSelect}
          selected={selectedIds?.has?.(icon.id) ?? false}
        />
      ))}

      <style>{`
        .icon-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: var(--spacing-md, 16px);
        }

        @media (max-width: 640px) {
          .icon-grid {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: var(--spacing-sm, 8px);
          }
        }
      `}</style>
    </div>
  );
}

