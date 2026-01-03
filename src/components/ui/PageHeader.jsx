/**
 * @chunk 2.01 - ThemesPage Layout
 * 
 * Reusable page header component with title and action slot.
 */

export default function PageHeader({ title, description, action, children }) {
  return (
    <header className="page-header">
      <div className="page-header-content">
        <h1 className="page-title">{title}</h1>
        {description && (
          <p className="page-description">{description}</p>
        )}
        {children}
      </div>
      {action && (
        <div className="page-header-actions">
          {action}
        </div>
      )}
    </header>
  );
}

