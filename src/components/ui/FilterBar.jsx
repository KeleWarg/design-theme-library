/**
 * @chunk 2.01 - ThemesPage Layout
 * 
 * Filter bar with button group for filtering lists.
 */

export function FilterBar({ children }) {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        {children}
      </div>
    </div>
  );
}

export function FilterButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      className={`filter-btn ${active ? 'filter-btn-active' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default FilterBar;

