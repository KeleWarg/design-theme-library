/**
 * @chunk B.4 - IconsPage
 * 
 * Main icon library page with grid view, search, upload, and delete.
 */

import { useState, useMemo } from 'react';
import { Plus, Search, Image as ImageIcon, Trash2, Download } from 'lucide-react';
import { useIcons } from '../hooks/useIcons';
import { iconService } from '../services/iconService';
import { PageHeader, Input, EmptyState, ErrorMessage, Button } from '../components/ui';
import { ComponentGridSkeleton } from '../components/ui/Skeleton';
import { IconGrid, UploadIconModal, ImportIconModal } from '../components/icons';
import { toast } from 'sonner';

export default function IconsPage() {
  const [search, setSearch] = useState('');
  const [styleFilter, setStyleFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const filters = useMemo(() => {
    const f = {};
    if (search.trim()) f.search = search.trim();
    if (styleFilter !== 'all') f.style = styleFilter;
    return f;
  }, [search, styleFilter]);

  const { data: icons, isLoading, error, refetch } = useIcons(filters);

  const handleDelete = async (id) => {
    try {
      await iconService.deleteIcon(id);
      toast.success('Icon deleted');
      refetch();
    } catch (err) {
      console.error('Failed to delete icon:', err);
      toast.error('Failed to delete icon');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    if (!confirm(`Delete ${selectedIds.size} icon(s)?`)) return;
    
    try {
      await iconService.bulkDelete(Array.from(selectedIds));
      toast.success(`${selectedIds.size} icon(s) deleted`);
      setSelectedIds(new Set());
      refetch();
    } catch (err) {
      console.error('Failed to delete icons:', err);
      toast.error('Failed to delete icons');
    }
  };

  const toggleSelect = (icon) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(icon.id)) {
      newSet.delete(icon.id);
    } else {
      newSet.add(icon.id);
    }
    setSelectedIds(newSet);
  };

  const uniqueStyles = useMemo(() => {
    if (!icons) return [];
    return [...new Set(icons.map(i => i.style).filter(Boolean))];
  }, [icons]);

  return (
    <div className="page icons-page">
      <PageHeader
        title="Icon Library"
        description="Manage icons for your design system components"
        action={
          <div className="icons-page-actions">
            {selectedIds.size > 0 && (
              <Button variant="danger" onClick={handleBulkDelete}>
                <Trash2 size={16} />
                Delete ({selectedIds.size})
              </Button>
            )}
            <Button variant="secondary" onClick={() => setShowImportModal(true)}>
              <Download size={16} />
              Import
            </Button>
            <Button variant="primary" onClick={() => setShowUploadModal(true)}>
              <Plus size={16} />
              Upload
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="icons-filters">
        <div className="icons-search">
          <Search size={16} className="icons-search-icon" />
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="icons-search-input"
          />
        </div>

        <div className="icons-style-filter">
          <button
            className={`icons-filter-btn ${styleFilter === 'all' ? 'icons-filter-btn--active' : ''}`}
            onClick={() => setStyleFilter('all')}
          >
            All
          </button>
          {uniqueStyles.map(style => (
            <button
              key={style}
              className={`icons-filter-btn ${styleFilter === style ? 'icons-filter-btn--active' : ''}`}
              onClick={() => setStyleFilter(style)}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="page-content">
        {isLoading ? (
          <ComponentGridSkeleton count={12} />
        ) : error ? (
          <ErrorMessage 
            error={error}
            title="Failed to load icons"
            onRetry={refetch}
          />
        ) : icons?.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title={search ? 'No icons found' : 'No icons yet'}
            description={
              search
                ? `No icons match "${search}". Try a different search term.`
                : 'Upload your first icon to build your icon library.'
            }
            action={
              !search && (
                <Button variant="primary" onClick={() => setShowUploadModal(true)}>
                  <Plus size={16} />
                  Upload Icon
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="icons-count">
              {icons.length} icon{icons.length !== 1 ? 's' : ''}
              {search && ` matching "${search}"`}
            </div>
            <IconGrid
              icons={icons}
              onDelete={handleDelete}
              onSelect={toggleSelect}
              selectedIds={selectedIds}
            />
          </>
        )}
      </main>

      {/* Upload Modal */}
      <UploadIconModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={refetch}
      />

      {/* Import Modal */}
      <ImportIconModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={refetch}
      />

      <style>{`
        .icons-page {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg, 24px);
        }

        .icons-page-actions {
          display: flex;
          gap: var(--spacing-sm, 8px);
        }

        .icons-filters {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-md, 16px);
          align-items: center;
          padding: var(--spacing-md, 16px);
          background: var(--color-background, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-lg, 8px);
        }

        .icons-search {
          position: relative;
          flex: 1;
          min-width: 200px;
          max-width: 400px;
        }

        .icons-search-icon {
          position: absolute;
          left: var(--spacing-sm, 8px);
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-muted-foreground, #6b7280);
          pointer-events: none;
          z-index: 1;
        }

        .icons-search-input .form-input {
          padding-left: calc(var(--spacing-sm, 8px) + 16px + var(--spacing-sm, 8px));
        }

        .icons-style-filter {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs, 4px);
        }

        .icons-filter-btn {
          padding: var(--spacing-xs, 4px) var(--spacing-md, 16px);
          background: var(--color-background, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-md, 6px);
          font-size: var(--font-size-sm, 14px);
          color: var(--color-muted-foreground, #6b7280);
          cursor: pointer;
          text-transform: capitalize;
          transition: all 0.15s;
        }

        .icons-filter-btn:hover {
          border-color: var(--color-primary, #3b82f6);
          color: var(--color-foreground, #1a1a1a);
        }

        .icons-filter-btn--active {
          background: var(--color-primary, #3b82f6);
          border-color: var(--color-primary, #3b82f6);
          color: var(--color-primary-foreground, #ffffff);
        }

        .icons-count {
          font-size: var(--font-size-sm, 14px);
          color: var(--color-muted-foreground, #6b7280);
          margin-bottom: var(--spacing-sm, 8px);
        }

        @media (max-width: 640px) {
          .icons-filters {
            flex-direction: column;
            align-items: stretch;
          }

          .icons-search {
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
}

