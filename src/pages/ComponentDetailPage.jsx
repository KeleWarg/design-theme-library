/**
 * @chunk 3.12 - ComponentDetail Layout
 * 
 * Main component detail/edit page with tabbed interface.
 * Provides preview, code editing, props management, token linking, and examples.
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useComponent } from '../hooks/useComponent';
import { componentService } from '../services/componentService';
import { Tabs, Button, StatusBadge, DropdownMenu, DetailSkeleton } from '../components/ui';
import { PreviewTab, CodeTab, PropsTab, TokensTab, ExamplesTab } from '../components/components/detail';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

export default function ComponentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: component, isLoading, error, mutate } = useComponent(id);
  const [activeTab, setActiveTab] = useState('preview');
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = async (updates) => {
    try {
      await componentService.updateComponent(id, updates);
      setHasChanges(false);
      mutate();
      toast.success('Component saved');
    } catch (error) {
      console.error('Failed to save component:', error);
      toast.error('Failed to save component');
    }
  };

  const handlePublish = async () => {
    try {
      await componentService.updateComponent(id, { status: 'published' });
      mutate();
      toast.success('Component published');
    } catch (error) {
      console.error('Failed to publish component:', error);
      toast.error('Failed to publish component');
    }
  };

  const handleDuplicate = async () => {
    try {
      const newComponent = await componentService.duplicateComponent(id);
      toast.success('Component duplicated');
      navigate(`/components/${newComponent.id}`);
    } catch (error) {
      console.error('Failed to duplicate component:', error);
      toast.error('Failed to duplicate component');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this component? This cannot be undone.')) return;
    
    try {
      await componentService.deleteComponent(id);
      toast.success('Component deleted');
      navigate('/components');
    } catch (error) {
      console.error('Failed to delete component:', error);
      toast.error('Failed to delete component');
    }
  };

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error || !component) {
    return (
      <div className="page">
        <div className="error-state">
          <p>Failed to load component</p>
          <Button onClick={() => navigate('/components')}>Back to Components</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page component-detail-page">
      <div className="component-detail">
        <div className="detail-header">
          <div className="header-left">
            <Link to="/components" className="back-link">
              <ArrowLeft size={16} /> Components
            </Link>
            <h1>{component.name}</h1>
            <StatusBadge status={component.status} />
          </div>
          <div className="header-actions">
            {hasChanges && (
              <Button onClick={() => handleSave({})}>
                Save Changes
              </Button>
            )}
            {component.status === 'draft' && (
              <Button variant="primary" onClick={handlePublish}>
                Publish
              </Button>
            )}
            <DropdownMenu
              trigger={
                <Button variant="ghost" size="small">
                  <MoreVertical size={16} />
                </Button>
              }
            >
              <DropdownMenu.Item onClick={handleDuplicate}>
                Duplicate
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item danger onClick={handleDelete}>
                Delete
              </DropdownMenu.Item>
            </DropdownMenu>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
            <Tabs.Trigger value="code">Code</Tabs.Trigger>
            <Tabs.Trigger value="props">Props</Tabs.Trigger>
            <Tabs.Trigger value="tokens">Tokens</Tabs.Trigger>
            <Tabs.Trigger value="examples">Examples</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="preview">
            <PreviewTab component={component} />
          </Tabs.Content>
          <Tabs.Content value="code">
            <CodeTab 
              component={component} 
              onSave={(code) => handleSave({ code })}
              onChangesMade={() => setHasChanges(true)}
            />
          </Tabs.Content>
          <Tabs.Content value="props">
            <PropsTab 
              component={component}
              onSave={(props) => handleSave({ props })}
            />
          </Tabs.Content>
          <Tabs.Content value="tokens">
            <TokensTab 
              component={component}
              onSave={(linked_tokens) => handleSave({ linked_tokens })}
            />
          </Tabs.Content>
          <Tabs.Content value="examples">
            <ExamplesTab component={component} onUpdate={mutate} />
          </Tabs.Content>
        </Tabs>
      </div>

      <style>{`
        .component-detail-page {
          padding: var(--spacing-lg);
        }

        .component-detail {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--spacing-md);
          padding-bottom: var(--spacing-md);
          border-bottom: 1px solid var(--color-border);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          flex: 1;
        }

        .back-link {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          color: var(--color-muted-foreground);
          text-decoration: none;
          font-size: var(--font-size-sm);
          transition: color 0.2s;
        }

        .back-link:hover {
          color: var(--color-foreground);
        }

        .detail-header h1 {
          margin: 0;
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-semibold);
          color: var(--color-foreground);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        /* Tabs Styles */
        .tabs {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .tabs-list {
          display: flex;
          gap: var(--spacing-xs);
          border-bottom: 1px solid var(--color-border);
          padding: 0 var(--spacing-sm);
        }

        .tabs-trigger {
          padding: var(--spacing-sm) var(--spacing-md);
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--color-muted-foreground);
          transition: all 0.2s;
          margin-bottom: -1px;
        }

        .tabs-trigger:hover {
          color: var(--color-foreground);
        }

        .tabs-trigger.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
          background: var(--color-primary-light, #eff6ff);
        }

        .tabs-content {
          padding: var(--spacing-lg);
          background: var(--color-background);
          border-radius: var(--radius-lg);
        }

        /* Tab placeholder styles */
        .preview-tab-placeholder,
        .code-tab-placeholder,
        .props-tab-placeholder,
        .tokens-tab-placeholder,
        .examples-tab-placeholder {
          padding: var(--spacing-xl);
          text-align: center;
          color: var(--color-muted-foreground);
        }

        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-md);
          padding: var(--spacing-xl);
          min-height: 400px;
        }
      `}</style>
    </div>
  );
}
