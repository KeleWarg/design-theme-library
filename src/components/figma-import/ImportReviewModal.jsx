/**
 * @chunk 4.08 - ImportReviewModal
 * 
 * Detailed review modal with tabs for all component aspects.
 * Allows editing component name/description, props, token mappings, and images before import.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon } from 'lucide-react';
import { toast } from 'sonner';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Tabs } from '../ui/Tabs';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import PropsEditor from './PropsEditor';
import VariantsList from './VariantsList';
import TokenLinker from './TokenLinker';
import FigmaStructureView from './FigmaStructureView';
import ImageManager from './ImageManager';
import { handleImportAndGenerate } from './GenerateFromFigma';
import { useThemeContext } from '../../contexts/ThemeContext';

export default function ImportReviewModal({ 
  component, 
  images = [], 
  onClose, 
  onImport 
}) {
  const navigate = useNavigate();
  const { tokens } = useThemeContext();
  const [activeTab, setActiveTab] = useState('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editedComponent, setEditedComponent] = useState({
    name: component?.name || '',
    description: component?.description || '',
  });
  const [editedProps, setEditedProps] = useState(
    convertFigmaPropsToAppProps(component?.properties || [])
  );
  const [linkedTokens, setLinkedTokens] = useState(
    component?.bound_variables?.map(bv => bv.variableName) || []
  );
  const [selectedImages, setSelectedImages] = useState(images);

  const componentImages = images.filter(img => 
    img.node_id && component?.figma_id && img.node_id.startsWith(component.figma_id)
  );

  const handleImportDraft = async () => {
    const result = {
      ...component,
      name: editedComponent.name,
      description: editedComponent.description,
      props: editedProps,
      linked_tokens: linkedTokens,
      images: selectedImages,
      status: 'draft',
    };
    onImport(result);
  };

  const handleImportAndGenerateClick = async () => {
    setIsGenerating(true);
    try {
      // Prepare component data with edited values
      const componentData = {
        ...component,
        name: editedComponent.name,
        description: editedComponent.description,
        properties: editedProps,
        bound_variables: component?.bound_variables || [],
        file_key: component?.file_key,
        figma_id: component?.figma_id,
        structure: component?.structure,
        variants: component?.variants || [],
      };

      // Call the generation flow
      const createdComponent = await handleImportAndGenerate(
        componentData,
        selectedImages,
        tokens
      );

      toast.success('Component generated and imported successfully!');
      
      // Close modal and navigate to component detail page
      onClose();
      navigate(`/components/${createdComponent.id}`);
    } catch (error) {
      console.error('Failed to generate component:', error);
      toast.error(error.message || 'Failed to generate component. Please check your API key in Settings.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!component) {
    return null;
  }

  return (
    <Modal 
      open={true} 
      onClose={onClose} 
      size="large" 
      title={`Review: ${component.name || 'Unnamed Component'}`}
    >
      <div className="component-review-modal">
        {/* Overview Tab - Edit name and description */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="structure">Structure</Tabs.Trigger>
            <Tabs.Trigger value="props">Props ({editedProps.length})</Tabs.Trigger>
            <Tabs.Trigger value="variants">Variants ({component.variants?.length || 0})</Tabs.Trigger>
            <Tabs.Trigger value="tokens">Tokens ({linkedTokens.length})</Tabs.Trigger>
            <Tabs.Trigger value="images">Images ({componentImages.length})</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="overview">
            <div className="component-review-overview">
              <div className="review-section">
                <h4>Component Information</h4>
                <div className="review-fields">
                  <Input
                    label="Name"
                    value={editedComponent.name}
                    onChange={(e) => setEditedComponent(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Component name"
                  />
                  <Textarea
                    label="Description"
                    value={editedComponent.description}
                    onChange={(e) => setEditedComponent(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Component description"
                    rows={4}
                  />
                </div>
              </div>

              <div className="review-section">
                <h4>Component Type</h4>
                <p className="component-type-badge">
                  {component.component_type === 'COMPONENT_SET' 
                    ? 'Component Set' 
                    : 'Component'}
                </p>
              </div>

              <div className="review-section">
                <h4>Summary</h4>
                <div className="review-summary">
                  <div className="summary-item">
                    <span className="summary-label">Properties:</span>
                    <span className="summary-value">{component.properties?.length || 0}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Variants:</span>
                    <span className="summary-value">{component.variants?.length || 0}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Token Bindings:</span>
                    <span className="summary-value">{component.bound_variables?.length || 0}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Images:</span>
                    <span className="summary-value">{componentImages.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="structure">
            <FigmaStructureView 
              structure={component.structure} 
              boundVariables={component.bound_variables || []}
            />
          </Tabs.Content>
          
          <Tabs.Content value="props">
            <PropsEditor 
              props={editedProps} 
              onChange={setEditedProps}
            />
          </Tabs.Content>
          
          <Tabs.Content value="variants">
            <VariantsList variants={component.variants || []} />
          </Tabs.Content>
          
          <Tabs.Content value="tokens">
            <TokenLinker 
              boundVariables={component.bound_variables || []}
              linkedTokens={linkedTokens}
              onChange={setLinkedTokens}
            />
          </Tabs.Content>
          
          <Tabs.Content value="images">
            <ImageManager 
              images={componentImages} 
              onUpdate={setSelectedImages}
            />
          </Tabs.Content>
        </Tabs>

        <div className="modal-footer">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={handleImportDraft}>
            Import as Draft
          </Button>
          <Button onClick={handleImportAndGenerateClick} loading={isGenerating} disabled={isGenerating}>
            <SparklesIcon size={16} /> Import & Generate Code
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Convert Figma property format to app prop format
 */
function convertFigmaPropsToAppProps(figmaProps) {
  return (figmaProps || []).map(p => ({
    name: p.name || '',
    type: figmaTypeToAppType(p.type),
    default: p.defaultValue || '',
    required: false,
    description: '',
    options: p.options || [],
  }));
}

/**
 * Map Figma property types to app prop types
 */
function figmaTypeToAppType(figmaType) {
  const mapping = {
    'BOOLEAN': 'boolean',
    'TEXT': 'string',
    'INSTANCE_SWAP': 'node',
    'VARIANT': 'enum',
  };
  return mapping[figmaType] || 'string';
}
