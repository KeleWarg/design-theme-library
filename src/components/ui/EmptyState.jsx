/**
 * @chunk 2.01 - ThemesPage Layout
 * @chunk 6.06 - Empty States
 * 
 * Base empty state component for when lists have no items.
 */

import { cn } from '../../lib/utils';
import '../../styles/empty-states.css';

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  children,
  className 
}) {
  return (
    <div className={cn('empty-state', className)}>
      {Icon && (
        <div className="empty-state-icon">
          <Icon size={48} strokeWidth={1.5} />
        </div>
      )}
      <h3 className="empty-state-title">{title}</h3>
      {description && (
        <p className="empty-state-description">{description}</p>
      )}
      {children}
      {action && (
        <div className="empty-state-action">
          {action}
        </div>
      )}
    </div>
  );
}


