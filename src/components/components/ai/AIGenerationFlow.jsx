/**
 * @chunk 3.10 - AIGenerationFlow
 * 
 * AI-powered component generation flow.
 * Handles description input, AI generation, and result review.
 * 
 * States:
 * 1. describe — User enters component description
 * 2. generating — AI is processing the request
 * 3. review — User reviews/edits generated code
 */

import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useThemeContext } from '../../../contexts/ThemeContext';
import { aiService } from '../../../services/aiService';
import { componentService } from '../../../services/componentService';
import { Button } from '../../ui';
import PromptInput from './PromptInput';
import GenerationProgress from './GenerationProgress';
import ResultPreview from './ResultPreview';
import TokenSelector from './TokenSelector';
import { Sparkles, Settings, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import '../../../styles/ai-generation.css';

/**
 * Extract component name from generated code
 * @param {string} code - Component code
 * @returns {string} Component name or fallback
 */
function extractComponentName(code) {
  // Try to match: export default function ComponentName
  const exportMatch = code.match(/export\s+default\s+function\s+(\w+)/);
  if (exportMatch) return exportMatch[1];

  // Try to match: function ComponentName
  const funcMatch = code.match(/function\s+(\w+)/);
  if (funcMatch) return funcMatch[1];

  // Try to match: const ComponentName = 
  const constMatch = code.match(/const\s+(\w+)\s*=/);
  if (constMatch) return constMatch[1];

  return 'GeneratedComponent';
}

/**
 * AI Generation Flow Component
 * Main component for AI-powered component creation
 */
export default function AIGenerationFlow() {
  const navigate = useNavigate();
  const { tokens } = useThemeContext();
  
  // Form state
  const [step, setStep] = useState('describe');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('buttons');
  const [linkedTokens, setLinkedTokens] = useState([]);
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  
  // Generation state
  const [generatedCode, setGeneratedCode] = useState('');
  const [generatedProps, setGeneratedProps] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  
  // Feedback state
  const [feedback, setFeedback] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Check if AI is configured
  const isConfigured = aiService.isConfigured();

  // Get selected token objects for the prompt
  const getSelectedTokens = useCallback(() => {
    const allTokens = [];
    Object.values(tokens).forEach(categoryTokens => {
      if (Array.isArray(categoryTokens)) {
        allTokens.push(...categoryTokens);
      }
    });
    // linkedTokens now stores paths, filter by path
    return allTokens.filter(t => linkedTokens.includes(t.path));
  }, [tokens, linkedTokens]);

  /**
   * Handle generate button click
   */
  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error('Please enter a component description');
      return;
    }

    setStep('generating');
    
    try {
      const result = await aiService.generateComponent({
        description,
        category,
        linkedTokens: getSelectedTokens(),
        themeTokens: tokens
      });
      
      setGeneratedCode(result.code);
      setGeneratedProps(result.props || []);
      
      // Validate the generated code
      const validation = aiService.validateCode(result.code);
      setValidationErrors(validation.errors);
      
      setStep('review');
      toast.success('Component generated successfully');
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error(error.message || 'Failed to generate component');
      setStep('describe');
    }
  };

  /**
   * Handle regenerate with feedback
   */
  const handleRegenerate = async () => {
    if (!feedback.trim()) {
      toast.error('Please provide feedback for regeneration');
      return;
    }

    setIsRegenerating(true);
    
    try {
      const result = await aiService.regenerateWithFeedback({
        originalCode: generatedCode,
        feedback,
        description,
        themeTokens: tokens
      });
      
      setGeneratedCode(result.code);
      setGeneratedProps(result.props || []);
      
      // Validate the regenerated code
      const validation = aiService.validateCode(result.code);
      setValidationErrors(validation.errors);
      
      setFeedback('');
      toast.success('Component regenerated');
    } catch (error) {
      console.error('Regeneration failed:', error);
      toast.error(error.message || 'Failed to regenerate component');
    } finally {
      setIsRegenerating(false);
    }
  };

  /**
   * Handle accept and create component
   */
  const handleAccept = async () => {
    try {
      const componentName = extractComponentName(generatedCode);
      
      const component = await componentService.createComponent({
        name: componentName,
        description,
        category,
        code: generatedCode,
        props: generatedProps,
        linked_tokens: linkedTokens,
        status: 'draft'
      });
      
      toast.success('Component created successfully');
      navigate(`/components/${component.id}`);
    } catch (error) {
      console.error('Failed to create component:', error);
      toast.error('Failed to save component');
    }
  };

  /**
   * Handle start over
   */
  const handleStartOver = () => {
    setStep('describe');
    setGeneratedCode('');
    setGeneratedProps([]);
    setValidationErrors([]);
    setFeedback('');
  };

  // Not configured state
  if (!isConfigured) {
    return (
      <div className="ai-generation">
        <div className="ai-generation-header">
          <Button variant="ghost" onClick={() => navigate('/components')}>
            <ArrowLeft size={16} />
            Back
          </Button>
          <h1>AI Component Generation</h1>
        </div>
        
        <div className="ai-generation-not-configured">
          <div className="ai-not-configured-icon">
            <Settings size={48} />
          </div>
          <h2>API Key Required</h2>
          <p>
            To use AI generation, you need to configure your Claude API key in Settings.
          </p>
          <Link to="/settings">
            <Button>
              <Settings size={16} />
              Go to Settings
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Generating state
  if (step === 'generating') {
    return (
      <div className="ai-generation">
        <GenerationProgress />
      </div>
    );
  }

  // Review state
  if (step === 'review') {
    return (
      <div className="ai-generation">
        <div className="ai-generation-header">
          <Button variant="ghost" onClick={handleStartOver}>
            <ArrowLeft size={16} />
            Back
          </Button>
          <h1>Review Generated Component</h1>
        </div>
        
        <ResultPreview
          code={generatedCode}
          onCodeChange={setGeneratedCode}
          generatedProps={generatedProps}
          validationErrors={validationErrors}
          feedback={feedback}
          onFeedbackChange={setFeedback}
          onRegenerate={handleRegenerate}
          onAccept={handleAccept}
          onStartOver={handleStartOver}
          isRegenerating={isRegenerating}
        />
      </div>
    );
  }

  // Describe state (default)
  return (
    <div className="ai-generation">
      <div className="ai-generation-header">
        <Button variant="ghost" onClick={() => navigate('/components')}>
          <ArrowLeft size={16} />
          Back
        </Button>
        <h1>Generate Component with AI</h1>
      </div>

      <div className="ai-generation-content">
        <PromptInput
          description={description}
          onDescriptionChange={setDescription}
          category={category}
          onCategoryChange={setCategory}
        />

        {/* Token Selector Toggle */}
        <div className="ai-generation-tokens">
          <button
            type="button"
            className="ai-generation-tokens-toggle"
            onClick={() => setShowTokenSelector(!showTokenSelector)}
          >
            <span>
              Link Design Tokens
              {linkedTokens.length > 0 && (
                <span className="ai-generation-tokens-count">
                  {linkedTokens.length} selected
                </span>
              )}
            </span>
            <span className={`ai-generation-tokens-arrow ${showTokenSelector ? 'ai-generation-tokens-arrow--open' : ''}`}>
              ▼
            </span>
          </button>

          {showTokenSelector && (
            <TokenSelector
              selected={linkedTokens}
              onChange={setLinkedTokens}
              tokens={tokens}
            />
          )}
        </div>
      </div>

      <div className="ai-generation-actions">
        <Button variant="ghost" onClick={() => navigate('/components')}>
          Cancel
        </Button>
        <Button onClick={handleGenerate} disabled={!description.trim()}>
          <Sparkles size={16} />
          Generate Component
        </Button>
      </div>
    </div>
  );
}


