/**
 * @chunk 3.13 - PreviewTab
 * @chunk B.8 - Icon Component Injection
 * 
 * Safe component renderer that evaluates component code and renders it.
 * Uses Function constructor for code evaluation (can be upgraded to iframe sandbox in production).
 * 
 * Injects an Icon component into the evaluation scope for icon prop support.
 */

import { useState, useEffect, useMemo } from 'react';
import React from 'react';
import { prepareComponentCodeForEval } from '../../../lib/codeSanitizer';
import * as Babel from '@babel/standalone';

/**
 * Create an Icon component for use within evaluated component code.
 * Looks up icons by name/slug and renders inline SVG.
 * 
 * @param {Array} icons - Array of icon objects from the icon library
 * @returns {Function} - Icon React component
 */
function createIconComponent(icons) {
  return function Icon({ name, size = 24, color = 'currentColor', className = '', ...rest }) {
    // Find icon by name or slug
    const icon = icons?.find(i => 
      i.slug === name || 
      i.name === name || 
      i.name.toLowerCase().replace(/\s+/g, '-') === name
    );

    if (!icon || !icon.svg_text) {
      // Return empty placeholder when icon not found
      return React.createElement('span', {
        className: `icon icon-placeholder ${className}`,
        style: { 
          display: 'inline-flex',
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
          color: color
        },
        title: `Icon "${name}" not found`,
        ...rest
      }, '?');
    }

    // Process SVG to make it more flexible
    let svgContent = icon.svg_text;
    
    // Add currentColor support if not present
    if (!svgContent.includes('currentColor')) {
      svgContent = svgContent
        .replace(/fill="[^"]*"/gi, 'fill="currentColor"')
        .replace(/stroke="[^"]*"/gi, 'stroke="currentColor"');
    }

    // Return div with dangerouslySetInnerHTML
    return React.createElement('span', {
      className: `icon icon-${icon.slug} ${className}`,
      style: { 
        display: 'inline-flex',
        width: size,
        height: size,
        color: color
      },
      dangerouslySetInnerHTML: { __html: svgContent },
      ...rest
    });
  };
}

export default function ComponentRenderer({ code, props, icons = [] }) {
  const [error, setError] = useState(null);
  const [Component, setComponent] = useState(null);

  // Memoize the Icon component creation
  const IconComponent = useMemo(() => createIconComponent(icons), [icons]);

  useEffect(() => {
    if (!code) {
      setComponent(null);
      return;
    }

    try {
      const preparedCode = prepareComponentCodeForEval(code);
      const compiled = Babel.transform(preparedCode, {
        // Classic runtime so React.createElement is used (React is in scope)
        presets: [['react', { runtime: 'classic' }]],
        // Ensure output is plain JS that can be `new Function`'d
        sourceType: 'script',
        babelrc: false,
        configFile: false,
      }).code;

      // Create component from code string using Function constructor
      // In production, use react-live or iframe sandbox for safer evaluation
      // Icon component is passed in alongside React hooks
      const fn = new Function('React', 'Icon', `
        const { useState, useEffect, useRef, useMemo, useCallback, forwardRef, createContext, useContext } = React;
        let __defaultExport = null;
        ${compiled}
        return __defaultExport;
      `);
      
      const ComponentFn = fn(React, IconComponent);
      if (typeof ComponentFn === 'function') {
        setComponent(() => ComponentFn);
        setError(null);
      } else {
        setError('Code does not export a valid React component');
        setComponent(null);
      }
    } catch (e) {
      setError(e.message);
      setComponent(null);
    }
  }, [code, IconComponent]);

  if (error) {
    return (
      <div className="render-error">
        <strong>Render Error:</strong>
        <pre>{error}</pre>
      </div>
    );
  }

  if (!Component) {
    return <div className="render-loading">No component to render</div>;
  }

  try {
    return <Component {...props} />;
  } catch (e) {
    return (
      <div className="render-error">
        <strong>Runtime Error:</strong>
        <pre>{e.message}</pre>
      </div>
    );
  }
}
