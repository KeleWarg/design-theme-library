/**
 * @chunk 2.01 - ThemesPage Layout
 * @chunk 2.02 - ThemeCard Component
 * @chunk 2.03 - CreateThemeModal
 * 
 * Main themes listing page with grid layout and filter controls.
 * Displays all themes with loading, empty, and error states.
 */

import { useState } from 'react';
import { Plus, Palette } from 'lucide-react';
import { useThemes } from '../hooks/useThemes';
import { PageHeader, FilterBar, FilterButton, EmptyState, ErrorMessage } from '../components/ui';
import { ThemeGridSkeleton } from '../components/ui/Skeleton';
import ThemeCard from '../components/themes/ThemeCard';
import CreateThemeModal from '../components/themes/CreateThemeModal';

export default function ThemesPage() {
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const { data: themes, isLoading, error, refetch } = useThemes(filter);

  const handleCreateClick = () => {
    setShowCreateModal(true);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
  };

  const handleThemeCreated = () => {
    setShowCreateModal(false);
    refetch();
  };

  return (
    <div className="page themes-page">
      <PageHeader
        title="Themes"
        description="Manage your design system themes and tokens"
        action={
          <button className="btn btn-primary" onClick={handleCreateClick}>
            <Plus size={16} />
            Create Theme
          </button>
        }
      />
      
      <FilterBar>
        <FilterButton 
          active={filter === 'all'} 
          onClick={() => setFilter('all')}
        >
          All
        </FilterButton>
        <FilterButton 
          active={filter === 'draft'} 
          onClick={() => setFilter('draft')}
        >
          Drafts
        </FilterButton>
        <FilterButton 
          active={filter === 'published'} 
          onClick={() => setFilter('published')}
        >
          Published
        </FilterButton>
      </FilterBar>

      <main className="page-content">
        {isLoading ? (
          <ThemeGridSkeleton count={6} />
        ) : error ? (
          <ErrorMessage 
            error={error} 
            title="Failed to load themes"
            onRetry={refetch}
          />
        ) : themes?.length === 0 ? (
          <EmptyState
            icon={Palette}
            title="No themes yet"
            description={
              filter === 'all' 
                ? "Create your first theme to start building your design system."
                : `No ${filter} themes found. Try a different filter.`
            }
            action={
              filter === 'all' && (
                <button className="btn btn-primary" onClick={handleCreateClick}>
                  <Plus size={16} />
                  Create Theme
                </button>
              )
            }
          />
        ) : (
          <div className="theme-grid">
            {themes.map(theme => (
              <ThemeCard key={theme.id} theme={theme} onRefresh={refetch} />
            ))}
          </div>
        )}
      </main>

      <CreateThemeModal 
        open={showCreateModal} 
        onClose={handleModalClose} 
      />
    </div>
  );
}
