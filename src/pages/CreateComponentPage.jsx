/**
 * @chunk 3.05 - ManualCreationWizard Shell
 * @chunk 3.10 - AIGenerationFlow
 * 
 * Page wrapper for component creation.
 * Routes to appropriate wizard based on ?mode= query parameter.
 * 
 * Modes:
 * - manual: ManualCreationWizard (chunks 3.05-3.09)
 * - ai: AIGenerationFlow (chunk 3.10)
 * - figma: Redirect to /figma-import (chunk 4.06)
 */

import { useSearchParams, Navigate } from 'react-router-dom';
import { ManualCreationWizard } from '../components/components/wizard';
import { AIGenerationFlow } from '../components/components/ai';
import '../styles/component-wizard.css';

export default function CreateComponentPage() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'manual';

  // Route to appropriate wizard based on mode
  switch (mode) {
    case 'manual':
      return <ManualCreationWizard />;
    
    case 'ai':
      return <AIGenerationFlow />;
    
    case 'figma':
      // Redirect to Figma import page (chunk 4.06)
      return <Navigate to="/figma-import" replace />;
    
    default:
      // Default to manual creation
      return <ManualCreationWizard />;
  }
}

