/**
 * @chunk 3.10 - AIGenerationFlow
 * 
 * Loading state component for AI generation process.
 * Shows animated progress and helpful messages.
 */

import { useState, useEffect } from 'react';
import { Sparkles, Code, Palette, Wand2 } from 'lucide-react';

const PROGRESS_MESSAGES = [
  { icon: Sparkles, text: 'Analyzing your description...' },
  { icon: Palette, text: 'Selecting design tokens...' },
  { icon: Code, text: 'Generating component code...' },
  { icon: Wand2, text: 'Optimizing accessibility...' }
];

/**
 * Generation progress component
 * Shows animated loading state during AI generation
 */
export default function GenerationProgress() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % PROGRESS_MESSAGES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentMessage = PROGRESS_MESSAGES[messageIndex];
  const IconComponent = currentMessage.icon;

  return (
    <div className="generation-progress">
      <div className="generation-progress-spinner">
        <div className="generation-spinner-ring" />
        <div className="generation-spinner-icon">
          <Sparkles size={32} />
        </div>
      </div>

      <div className="generation-progress-content">
        <h2 className="generation-progress-title">Generating Component</h2>
        
        <div className="generation-progress-message">
          <IconComponent size={16} />
          <span>{currentMessage.text}</span>
        </div>

        <p className="generation-progress-hint">
          This may take up to 30 seconds
        </p>
      </div>

      <div className="generation-progress-dots">
        {PROGRESS_MESSAGES.map((_, index) => (
          <span
            key={index}
            className={`generation-progress-dot ${index === messageIndex ? 'generation-progress-dot--active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}


