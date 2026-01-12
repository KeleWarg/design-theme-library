// src/components/qa/InputPanel.jsx
// This is the input selection panel shown before analysis

import { useState } from 'react';
import { ImageDropzone } from './input/ImageDropzone';
import { UrlInput } from './input/UrlInput';
import { useQAStore } from '../../stores/qaStore';
import { captureInput } from '../../lib/qa/inputRouter';
import { extractAll } from '../../lib/qa/extraction/orchestrator';
import { matchColors } from '../../lib/qa/matching/colorMatcher';
import { matchFonts } from '../../lib/qa/matching/fontMatcher';
import { generateIssues } from '../../lib/qa/issues/issueGenerator';
import { Image, Globe, Figma } from 'lucide-react';

export function InputPanel() {
  const [inputType, setInputType] = useState('image');
  const [isLoading, setIsLoading] = useState(false);
  const { setAsset, setIssues, setIsAnalyzing } = useQAStore();
  
  const handleImageSelect = async (imageData) => {
    if (!imageData) return;
    
    setIsLoading(true);
    setIsAnalyzing(true);
    
    try {
      const asset = await captureInput({
        type: 'image',
        file: imageData.file,
        preview: imageData.preview,
        width: imageData.width,
        height: imageData.height,
      });
      
      setAsset(asset);
      
      // Run analysis
      const { colors, fonts } = await extractAll(asset);
      
      // For now, use a default theme - you'd get this from context
      const themeId = 'default';
      const colorMatches = await matchColors(colors, themeId);
      const fontMatches = await matchFonts(fonts, themeId);
      
      const issues = generateIssues(colorMatches, fontMatches);
      setIssues(issues);
      
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  };
  
  const handleUrlSubmit = async (url) => {
    setIsLoading(true);
    setIsAnalyzing(true);
    
    try {
      const asset = await captureInput({ type: 'url', url });
      setAsset(asset);
      
      const { colors, fonts } = await extractAll(asset);
      const themeId = 'default';
      const colorMatches = await matchColors(colors, themeId);
      const fontMatches = await matchFonts(fonts, themeId);
      
      const issues = generateIssues(colorMatches, fontMatches);
      setIssues(issues);
      
    } catch (error) {
      console.error('Capture failed:', error);
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  };
  
  return (
    <div className="w-full max-w-xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Visual QA Analysis</h2>
        <p className="text-gray-600 mt-2">
          Upload an image or enter a URL to check against your design tokens
        </p>
      </div>
      
      {/* Input type tabs */}
      <div className="flex justify-center gap-2 mb-6">
        {[
          { id: 'image', icon: Image, label: 'Image' },
          { id: 'url', icon: Globe, label: 'URL' },
          { id: 'figma', icon: Figma, label: 'Figma' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setInputType(id)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors
              ${inputType === id 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>
      
      {/* Input component */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        {inputType === 'image' && (
          <ImageDropzone onSelect={handleImageSelect} />
        )}
        
        {inputType === 'url' && (
          <UrlInput onSubmit={handleUrlSubmit} isLoading={isLoading} />
        )}
        
        {inputType === 'figma' && (
          <div className="text-center text-gray-500 py-8">
            Figma integration coming soon
          </div>
        )}
      </div>
    </div>
  );
}
