/**
 * @chunk 3.11 - AI Service & Prompt Builder
 * 
 * AI service for generating React components using Claude API.
 * Handles component generation, regeneration with feedback, and code parsing.
 */

import { 
  buildComponentPrompt, 
  buildRegenerationPrompt, 
  parseGeneratedComponent 
} from '../lib/promptBuilder';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

const AI_CONFIG = {
  model: 'claude-sonnet-4-20250514',
  maxTokens: 4096,
  temperature: 0.7
};

/**
 * Get the Claude API key from environment or localStorage
 * @returns {string|null} API key or null if not found
 */
function getApiKey() {
  // Try environment variable first (Vite)
  if (import.meta.env.VITE_CLAUDE_API_KEY) {
    return import.meta.env.VITE_CLAUDE_API_KEY;
  }
  
  // Fall back to localStorage for user-configured keys
  return localStorage.getItem('claude_api_key');
}

export const aiService = {
  /**
   * Check if AI service is configured
   * @returns {boolean} True if API key is available
   */
  isConfigured() {
    return Boolean(getApiKey());
  },

  /**
   * Generate a new component using AI
   * @param {Object} params - Generation parameters
   * @param {string} params.description - Component description
   * @param {string} params.category - Component category
   * @param {Array} params.linkedTokens - Tokens to use in component
   * @param {Object} params.themeTokens - All theme tokens grouped by category
   * @returns {Promise<Object>} Generated component with code and props
   */
  async generateComponent({ description, category, linkedTokens = [], themeTokens = {} }) {
    const apiKey = getApiKey();
    
    if (!apiKey) {
      throw new Error('Claude API key not configured. Please add your API key in Settings.');
    }

    const prompt = buildComponentPrompt({
      description,
      category,
      linkedTokens,
      themeTokens
    });

    try {
      const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: AI_CONFIG.model,
          max_tokens: AI_CONFIG.maxTokens,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const content = data.content?.[0]?.text || '';
      
      return parseGeneratedComponent(content);
    } catch (error) {
      console.error('AI generation failed:', error);
      throw error;
    }
  },

  /**
   * Regenerate a component with user feedback
   * @param {Object} params - Regeneration parameters
   * @param {string} params.originalCode - Current component code
   * @param {string} params.feedback - User feedback for improvement
   * @param {string} params.description - Original component description
   * @param {Object} params.themeTokens - All theme tokens grouped by category
   * @returns {Promise<Object>} Regenerated component with code and props
   */
  async regenerateWithFeedback({ originalCode, feedback, description, themeTokens = {} }) {
    const apiKey = getApiKey();
    
    if (!apiKey) {
      throw new Error('Claude API key not configured. Please add your API key in Settings.');
    }

    const prompt = buildRegenerationPrompt({
      originalCode,
      feedback,
      description,
      themeTokens
    });

    try {
      const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: AI_CONFIG.model,
          max_tokens: AI_CONFIG.maxTokens,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const content = data.content?.[0]?.text || '';
      
      return parseGeneratedComponent(content);
    } catch (error) {
      console.error('AI regeneration failed:', error);
      throw error;
    }
  },

  /**
   * Validate generated code
   * @param {string} code - Component code to validate
   * @returns {Object} Validation result with isValid and errors
   */
  validateCode(code) {
    const errors = [];
    
    // Check for required patterns
    if (!code.includes('export default')) {
      errors.push('Missing default export');
    }
    
    if (!code.includes('function') && !code.includes('=>')) {
      errors.push('No function component found');
    }
    
    // Check for hardcoded values (basic check)
    const hardcodedColorPattern = /#[0-9a-fA-F]{3,6}\b/g;
    const hardcodedColors = code.match(hardcodedColorPattern) || [];
    if (hardcodedColors.length > 0) {
      errors.push(`Found hardcoded colors: ${hardcodedColors.join(', ')}`);
    }
    
    // Check for CSS variable usage
    if (!code.includes('var(--')) {
      errors.push('No CSS variables used - component should use design tokens');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export default aiService;


