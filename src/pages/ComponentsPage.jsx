/**
 * @chunk 3.01 - ComponentsPage Layout
 * 
 * Main components listing page with grid layout, filters, and add options.
 * Displays all design system components with filtering and search.
 */

import { useState } from 'react';
import { Box } from 'lucide-react';
import { useComponents } from '../hooks/useComponents';
import { ComponentCard, ComponentFilters, AddComponentDropdown } from '../components/components';
import { PageHeader, EmptyState, ErrorMessage } from '../components/ui';
import { ComponentGridSkeleton } from '../components/ui/Skeleton';
import '../styles/components-page.css';

export default function ComponentsPage() {
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    search: ''
  });

  const { data: components, isLoading, error, refresh } = useComponents(filters);

  return (
    <div className="components-page">
      <PageHeader
        title="Components"
        description="Manage your design system components"
        action={<AddComponentDropdown />}
      />

      <ComponentFilters filters={filters} onChange={setFilters} />

      {isLoading ? (
        <ComponentGridSkeleton />
      ) : error ? (
        <ErrorMessage error={error} onRetry={refresh} />
      ) : components?.length === 0 ? (
        <EmptyState
          icon={Box}
          title="No components yet"
          description={
            filters.status !== 'all' || filters.category !== 'all' || filters.search
              ? "No components match your filters. Try adjusting your search criteria."
              : "Create your first component to get started building your design system."
          }
          action={
            filters.status === 'all' && filters.category === 'all' && !filters.search
              ? <AddComponentDropdown />
              : null
          }
        />
      ) : (
        <div className="component-grid">
          {components.map(component => (
            <ComponentCard 
              key={component.id} 
              component={component} 
              onRefresh={refresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}
