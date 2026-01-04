/**
 * @chunk 3.01 - ComponentsPage Layout
 * 
 * Main components listing page with grid layout, filters, and add options.
 * Displays all design system components with filtering and search.
 */

import { useState } from 'react';
import { useComponents } from '../hooks/useComponents';
import { ComponentCard, ComponentFilters, AddComponentDropdown } from '../components/components';
import { PageHeader, ErrorMessage } from '../components/ui';
import { ComponentGridSkeleton } from '../components/ui/Skeleton';
import { NoComponentsEmpty, NoSearchResults, NoFilterResults } from '../components/empty-states';
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
        filters.search ? (
          <NoSearchResults 
            query={filters.search} 
            onClear={() => setFilters({ ...filters, search: '' })} 
          />
        ) : filters.status !== 'all' || filters.category !== 'all' ? (
          <NoFilterResults 
            onClear={() => setFilters({ status: 'all', category: 'all', search: '' })} 
          />
        ) : (
          <NoComponentsEmpty />
        )
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
