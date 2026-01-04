/**
 * @chunk 2.22 - TypefaceForm
 * 
 * Google Fonts search component with autocomplete.
 */

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { searchGoogleFonts, loadGoogleFont, getAvailableWeights } from '../../../lib/googleFonts';

/**
 * GoogleFontSearch component
 * @param {Object} props
 * @param {string} props.value - Current font family value
 * @param {function} props.onChange - Callback (family, weights) => void
 * @param {boolean} props.disabled - Whether search is disabled
 */
export default function GoogleFontSearch({ value, onChange, disabled = false }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loadingFont, setLoadingFont] = useState(null);
  
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query || query.length < 2) {
      setResults(searchGoogleFonts(''));
      return;
    }

    setIsSearching(true);
    
    debounceRef.current = setTimeout(() => {
      const fonts = searchGoogleFonts(query);
      setResults(fonts);
      setIsSearching(false);
      setSelectedIndex(-1);
    }, 150);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Load font preview on hover
  const handleFontHover = async (family) => {
    if (loadingFont === family) return;
    setLoadingFont(family);
    try {
      await loadGoogleFont(family, [400, 700]);
    } catch (err) {
      console.warn('Failed to load font preview:', err);
    }
    setLoadingFont(null);
  };

  // Select a font
  const handleSelectFont = async (font) => {
    setQuery(font.family);
    setShowDropdown(false);
    
    // Load the font
    try {
      await loadGoogleFont(font.family, font.variants);
    } catch (err) {
      console.warn('Failed to load font:', err);
    }
    
    // Get available weights
    const weights = getAvailableWeights(font.family) || [400];
    onChange(font.family, weights);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelectFont(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear button
  const handleClear = () => {
    setQuery('');
    onChange('', [400]);
    inputRef.current?.focus();
  };

  return (
    <div className="google-font-search">
      <label className="form-label">Font Family</label>
      
      <div className="google-font-search-input-wrapper">
        <Search size={16} className="google-font-search-icon" />
        <input
          ref={inputRef}
          type="text"
          className="google-font-search-input"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search Google Fonts..."
          disabled={disabled}
          autoComplete="off"
        />
        {isSearching && (
          <Loader2 size={16} className="google-font-search-spinner spin" />
        )}
        {query && !isSearching && (
          <button 
            type="button"
            className="google-font-search-clear"
            onClick={handleClear}
            disabled={disabled}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div ref={dropdownRef} className="google-font-search-dropdown">
          {results.map((font, index) => (
            <button
              key={font.family}
              type="button"
              className={`google-font-search-result ${selectedIndex === index ? 'google-font-search-result--selected' : ''}`}
              onClick={() => handleSelectFont(font)}
              onMouseEnter={() => handleFontHover(font.family)}
            >
              <span 
                className="google-font-search-result-family"
                style={{ fontFamily: `"${font.family}", ${font.category}` }}
              >
                {font.family}
              </span>
              <span className="google-font-search-result-meta">
                {font.variants.length} weights · {font.category}
              </span>
            </button>
          ))}
        </div>
      )}
      
      {showDropdown && query.length >= 2 && results.length === 0 && !isSearching && (
        <div className="google-font-search-dropdown">
          <div className="google-font-search-empty">
            No fonts found for "{query}"
          </div>
        </div>
      )}
    </div>
  );
}


