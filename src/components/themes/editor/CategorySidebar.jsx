/**
 * @chunk 2.13 - CategorySidebar
 * 
 * Navigation sidebar for switching between token categories.
 * Shows category icons with token counts and highlights active category.
 */

import { 
  Palette, 
  Type, 
  Move, 
  Square, 
  Circle, 
  Grid3X3,
  Package
} from 'lucide-react';

const CATEGORY_CONFIG = {
  color: { icon: Palette, label: 'Colors' },
  typography: { icon: Type, label: 'Typography' },
  spacing: { icon: Move, label: 'Spacing' },
  shadow: { icon: Square, label: 'Shadows' },
  radius: { icon: Circle, label: 'Radius' },
  grid: { icon: Grid3X3, label: 'Grid' },
  other: { icon: Package, label: 'Other' }
};

const CATEGORY_ORDER = ['color', 'typography', 'spacing', 'shadow', 'radius', 'grid', 'other'];

/**
 * Count tokens by category
 * Unknown categories are counted as 'other'
 */
function getTokenCounts(tokens = []) {
  const validCategories = new Set(CATEGORY_ORDER);
  return tokens.reduce((acc, token) => {
    const rawCat = token.category || 'other';
    // If category is not in our known categories, count it as 'other'
    const cat = validCategories.has(rawCat) ? rawCat : 'other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Category sidebar for navigating token types
 * @param {Object} props
 * @param {Array} props.tokens - All tokens for the theme
 * @param {string} props.activeCategory - Currently selected category
 * @param {Function} props.onCategoryChange - Category selection handler
 */
export default function CategorySidebar({ 
  tokens = [], 
  activeCategory, 
  onCategoryChange 
}) {
  const counts = getTokenCounts(tokens);
  
  // Only show categories that have tokens or are commonly used
  const visibleCategories = CATEGORY_ORDER.filter(cat => 
    counts[cat] > 0 || ['color', 'typography', 'spacing'].includes(cat)
  );

  return (
    <aside className="category-sidebar">
      <div className="category-sidebar-header">
        <h2 className="category-sidebar-title">Categories</h2>
      </div>
      
      <nav className="category-nav">
        {visibleCategories.map(category => {
          const config = CATEGORY_CONFIG[category];
          const Icon = config.icon;
          const count = counts[category] || 0;
          const isActive = activeCategory === category;

          return (
            <button
              key={category}
              className={`category-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onCategoryChange(category)}
              aria-current={isActive ? 'true' : undefined}
            >
              <Icon size={18} className="category-nav-icon" />
              <span className="category-nav-label">{config.label}</span>
              <span className="category-nav-count">{count}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

