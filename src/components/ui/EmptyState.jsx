/**
 * @chunk 2.01 - ThemesPage Layout
 * 
 * Empty state component for when lists have no items.
 */

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}) {
  return (
    <div className="empty-state">
      {Icon && <Icon size={48} className="empty-state-icon" />}
      <h3 className="empty-state-title">{title}</h3>
      {description && (
        <p className="empty-state-description">{description}</p>
      )}
      {action && (
        <div className="empty-state-action">
          {action}
        </div>
      )}
    </div>
  );
}


