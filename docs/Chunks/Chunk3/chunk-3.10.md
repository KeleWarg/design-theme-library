# Chunk 3.10 — AIGenerationFlow

## Purpose
AI-powered component generation from description.

---

## Inputs
- Route /components/new?mode=ai
- ThemeContext tokens

## Outputs
- Generated component code

---

## Dependencies
- Chunk 3.04 must be complete
- Chunk 2.04 must be complete

---

## Implementation Notes

### States
1. `describe` — User enters description
2. `generating` — AI is processing
3. `review` — User reviews/edits generated code

```jsx
// src/components/components/create/AIGenerationFlow.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../../contexts/ThemeContext';
import { aiService } from '../../../services/aiService';
import { componentService } from '../../../services/componentService';
import { Textarea, Select, Button, Spinner } from '../../ui';
import TokenSelector from './TokenSelector';
import CodeEditor from '../../ui/CodeEditor';
import { SparklesIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function AIGenerationFlow() {
  const { tokens } = useThemeContext();
  const [step, setStep] = useState('describe');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('buttons');
  const [linkedTokens, setLinkedTokens] = useState([]);
  const [generatedCode, setGeneratedCode] = useState('');
  const [generatedProps, setGeneratedProps] = useState([]);
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  const handleGenerate = async () => {
    setStep('generating');
    
    try {
      const result = await aiService.generateComponent({
        description,
        category,
        linkedTokens,
        themeTokens: tokens
      });
      
      setGeneratedCode(result.code);
      setGeneratedProps(result.props);
      setStep('review');
    } catch (error) {
      toast.error('Generation failed');
      setStep('describe');
    }
  };

  const handleRegenerate = async () => {
    setStep('generating');
    
    try {
      const result = await aiService.regenerateWithFeedback({
        originalCode: generatedCode,
        feedback,
        description,
        themeTokens: tokens
      });
      
      setGeneratedCode(result.code);
      setGeneratedProps(result.props);
      setFeedback('');
      setStep('review');
    } catch (error) {
      toast.error('Regeneration failed');
      setStep('review');
    }
  };

  const handleAccept = async () => {
    try {
      const component = await componentService.createComponent({
        name: extractComponentName(generatedCode),
        description,
        category,
        code: generatedCode,
        props: generatedProps,
        linked_tokens: linkedTokens,
        status: 'draft'
      });
      
      toast.success('Component created');
      navigate(`/components/${component.id}`);
    } catch (error) {
      toast.error('Failed to save component');
    }
  };

  // Generating state
  if (step === 'generating') {
    return (
      <div className="ai-generating">
        <Spinner size="lg" />
        <h2>Generating Component...</h2>
        <p>This may take up to 30 seconds</p>
      </div>
    );
  }

  // Review state
  if (step === 'review') {
    return (
      <div className="ai-review">
        <div className="review-header">
          <h2>Review Generated Component</h2>
        </div>

        <div className="code-preview">
          <CodeEditor
            value={generatedCode}
            onChange={setGeneratedCode}
            language="jsx"
          />
        </div>

        <div className="feedback-section">
          <Textarea
            label="Feedback for regeneration (optional)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="e.g., Make the hover state more subtle, add a loading state..."
          />
          <Button 
            variant="secondary" 
            onClick={handleRegenerate}
            disabled={!feedback}
          >
            Regenerate with Feedback
          </Button>
        </div>

        <div className="review-actions">
          <Button variant="ghost" onClick={() => setStep('describe')}>
            Start Over
          </Button>
          <Button onClick={handleAccept}>
            Accept & Create
          </Button>
        </div>
      </div>
    );
  }

  // Describe state (default)
  return (
    <div className="ai-describe">
      <div className="describe-header">
        <h2>Generate Component with AI</h2>
        <p>Describe the component you want to create</p>
      </div>

      <Textarea
        label="Component Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="e.g., A primary button with hover and active states, supporting an optional icon on the left. Should have variants for different sizes (small, medium, large)."
        rows={4}
      />

      <Select
        label="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        options={[
          { value: 'buttons', label: 'Buttons' },
          { value: 'forms', label: 'Forms' },
          { value: 'layout', label: 'Layout' },
          { value: 'navigation', label: 'Navigation' },
          { value: 'feedback', label: 'Feedback' },
          { value: 'data-display', label: 'Data Display' },
          { value: 'overlay', label: 'Overlay' },
        ]}
      />

      <TokenSelector
        selected={linkedTokens}
        onChange={setLinkedTokens}
        tokens={tokens}
      />

      <div className="describe-actions">
        <Button variant="ghost" onClick={() => navigate('/components')}>
          Cancel
        </Button>
        <Button onClick={handleGenerate} disabled={!description.trim()}>
          <SparklesIcon size={16} /> Generate Component
        </Button>
      </div>
    </div>
  );
}

function extractComponentName(code) {
  const match = code.match(/(?:function|const)\s+(\w+)/);
  return match ? match[1] : 'GeneratedComponent';
}
```

---

## Files Created
- `src/components/components/create/AIGenerationFlow.jsx` — AI generation UI
- `src/components/components/create/TokenSelector.jsx` — Mini token selector

---

## Tests

### Unit Tests
- [ ] Description input works
- [ ] Category selector works
- [ ] Token selection works
- [ ] Generate calls AI service
- [ ] Loading state shows
- [ ] Code preview works
- [ ] Feedback regeneration works
- [ ] Accept creates component

---

## Time Estimate
3 hours
