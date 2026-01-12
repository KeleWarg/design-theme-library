/**
 * @chunk 7.17 - QA Page Shell
 * InputPanel component for image upload and URL capture with analysis trigger
 */
import { useCallback, useState, useEffect } from 'react';
import { FileDropzone } from './input/FileDropzone';
import { UrlInput } from './input/UrlInput';
import { useQAStore } from '../../stores/qaStore';
import { captureInput } from '../../lib/qa/inputRouter';
import { extractAll } from '../../lib/qa/extraction/orchestrator';
import { matchColors } from '../../lib/qa/matching/colorMatcher';
import { matchFonts } from '../../lib/qa/matching/fontMatcher';
import { generateIssues } from '../../lib/qa/issues/issueGenerator';
import { themeService } from '../../services/themeService';
import { Loader2, Image, Globe } from 'lucide-react';
import '../../styles/qa.css';

export function InputPanel() {
  const { setAsset, setIssues, setIsAnalyzing, isAnalyzing } = useQAStore();
  const [error, setError] = useState(null);
  const [defaultThemeId, setDefaultThemeId] = useState(null);
  const [activeTab, setActiveTab] = useState('image');

  // Fetch default theme on mount
  useEffect(() => {
    async function loadDefaultTheme() {
      try {
        const defaultTheme = await themeService.getDefaultTheme();
        if (defaultTheme) {
          setDefaultThemeId(defaultTheme.id);
        } else {
          // Fallback: get first available theme
          const themes = await themeService.getThemes();
          if (themes?.length > 0) {
            setDefaultThemeId(themes[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load default theme:', err);
      }
    }
    loadDefaultTheme();
  }, []);

  const runAnalysis = useCallback(async (asset) => {
    if (!defaultThemeId) {
      setError('No theme available for color matching. Please create a theme first.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      // Run extraction
      const { colors, fonts } = await extractAll(asset);

      // Match colors against design tokens (with themeId)
      const colorMatches = await matchColors(colors, defaultThemeId);

      // Match fonts against typography tokens
      const fontMatches = await matchFonts(fonts, defaultThemeId);

      // Generate issues with marker positions
      const issues = generateIssues(colorMatches, fontMatches);

      // Update store
      setAsset(asset);
      setIssues(issues);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err.message || 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [setAsset, setIssues, setIsAnalyzing, defaultThemeId]);

  const handleImageSelect = useCallback(async (fileData) => {
    if (!fileData) {
      setAsset(null);
      setIssues([]);
      return;
    }

    const asset = {
      id: `qa-${Date.now()}`,
      inputType: 'image',
      image: {
        url: fileData.preview,
        blob: fileData.file,
        width: fileData.width,
        height: fileData.height,
      },
      domElements: null,
      capturedAt: new Date(),
    };

    await runAnalysis(asset);
  }, [runAnalysis, setAsset, setIssues]);

  const handleUrlCapture = useCallback(async (url) => {
    if (!defaultThemeId) {
      setError('No theme available for color matching. Please create a theme first.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      // Use captureInput to capture URL via Edge Function
      const asset = await captureInput({
        type: 'url',
        url,
        viewport: { width: 1440, height: 900 },
      });

      await runAnalysis(asset);
    } catch (err) {
      console.error('URL capture failed:', err);
      setError(err.message || 'Failed to capture URL');
      setIsAnalyzing(false);
    }
  }, [runAnalysis, defaultThemeId, setIsAnalyzing]);

  if (isAnalyzing) {
    return (
      <div className="qa-input-panel">
        <div className="card qa-analyzing-card">
          <div className="qa-analyzing-content">
            <Loader2 className="qa-analyzing-spinner animate-spin" />
            <div>
              <h2 className="qa-analyzing-title">Analyzing...</h2>
              <p className="qa-analyzing-subtitle">
                {activeTab === 'url' ? 'Capturing page and extracting styles' : 'Extracting colors and detecting issues'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="qa-input-panel">
      {/* Tabs */}
      <div className="qa-tabs" role="tablist" aria-label="QA input type">
        <button
          onClick={() => setActiveTab('image')}
          className={`qa-tab ${activeTab === 'image' ? 'qa-tab--active' : ''}`}
          type="button"
          role="tab"
          aria-selected={activeTab === 'image'}
        >
          <Image size={18} />
          <span>Image</span>
        </button>
        <button
          onClick={() => setActiveTab('url')}
          className={`qa-tab ${activeTab === 'url' ? 'qa-tab--active' : ''}`}
          type="button"
          role="tab"
          aria-selected={activeTab === 'url'}
        >
          <Globe size={18} />
          <span>URL</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'image' ? (
        <FileDropzone onSelect={handleImageSelect} />
      ) : (
        <div>
          <p className="qa-help-text">
            Enter a URL to capture a screenshot and analyze the page's design tokens.
          </p>
          <UrlInput onCapture={handleUrlCapture} isLoading={isAnalyzing} />
        </div>
      )}

      {error && (
        <div className="qa-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
