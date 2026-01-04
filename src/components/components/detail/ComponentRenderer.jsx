/**
 * @chunk 3.13 - PreviewTab
 * 
 * Safe component renderer that evaluates component code and renders it.
 * Uses Babel to transpile JSX and Function constructor for code evaluation.
 */

import { useState, useEffect } from 'react';
import React from 'react';
import * as Babel from '@babel/standalone';

/**
 * Prepares component code for preview by stripping ES module syntax.
 * Removes export/import statements that would cause syntax errors in Function constructor.
 */
function prepareCodeForPreview(code) {
  let prepared = code
    // Remove import statements
    .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*/gm, '')
    .replace(/import\s+['"][^'"]+['"];?\s*/gm, '')
    // Convert export default function ComponentName to function ComponentName
    .replace(/export\s+default\s+function\s+(\w+)/g, 'function $1')
    // Convert export default const/let/var to const/let/var
    .replace(/export\s+default\s+(const|let|var)\s+/g, '$1 ')
    // Convert export function to function
    .replace(/export\s+function\s+(\w+)/g, 'function $1')
    // Convert export const/let/var to const/let/var
    .replace(/export\s+(const|let|var)\s+/g, '$1 ')
    // Remove standalone export default
    .replace(/export\s+default\s+/g, '');
  
  return prepared;
}

/**
 * Extracts the component name from code for returning.
 */
function findComponentName(code) {
  // Look for function declarations
  const funcMatch = code.match(/function\s+([A-Z]\w*)\s*\(/);
  if (funcMatch) return funcMatch[1];
  
  // Look for const/let/var component definitions (arrow functions)
  const varMatch = code.match(/(?:const|let|var)\s+([A-Z]\w*)\s*=/);
  if (varMatch) return varMatch[1];
  
  return null;
}

/**
 * Transpiles JSX code to plain JavaScript using Babel
 */
function transpileJSX(code) {
  try {
    const result = Babel.transform(code, {
      presets: ['react'],
      plugins: [],
    });
    return result.code;
  } catch (e) {
    throw new Error(`JSX transpilation failed: ${e.message}`);
  }
}

export default function ComponentRenderer({ code, props }) {
  const [error, setError] = useState(null);
  const [Component, setComponent] = useState(null);

  useEffect(() => {
    if (!code) {
      setComponent(null);
      return;
    }

    try {
      // Strip export/import statements to make code evaluable
      const cleanCode = prepareCodeForPreview(code);
      const componentName = findComponentName(cleanCode);
      
      if (!componentName) {
        setError('Could not find a React component in the code');
        setComponent(null);
        return;
      }
      
      // Transpile JSX to plain JavaScript
      const transpiledCode = transpileJSX(cleanCode);
      
      // Create component from transpiled code string
      const fn = new Function('React', `
        const { useState, useEffect, useRef, useMemo, useCallback, useContext, useReducer, useLayoutEffect, memo, forwardRef, createContext, Fragment } = React;
        ${transpiledCode}
        return ${componentName};
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

