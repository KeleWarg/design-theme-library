/**
 * @chunk 3.13 - PreviewTab
 * 
 * Safe component renderer that evaluates component code and renders it.
 * Uses Function constructor for code evaluation (can be upgraded to iframe sandbox in production).
 */

import { useState, useEffect } from 'react';
import React from 'react';

export default function ComponentRenderer({ code, props }) {
  const [error, setError] = useState(null);
  const [Component, setComponent] = useState(null);

  useEffect(() => {
    if (!code) {
      setComponent(null);
      return;
    }

    try {
      // Create component from code string using Function constructor
      // In production, use react-live or iframe sandbox for safer evaluation
      const fn = new Function('React', `
        const { useState, useEffect, useRef, useMemo, useCallback } = React;
        ${code}
        return typeof exports !== 'undefined' ? exports.default : 
               typeof module !== 'undefined' ? module.exports : 
               (() => {
                 const match = \`${code}\`.match(/(?:function|const|export\\s+(?:default\\s+)?function)\\s+(\\w+)/);
                 return match ? eval(match[1]) : null;
               })();
      `);
      
      const ComponentFn = fn(React);
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
  }, [code]);

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

