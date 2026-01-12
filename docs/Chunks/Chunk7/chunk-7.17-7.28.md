# Phase 7 UI + Comparison — Chunks 7.17-7.28

## Overview
Build the annotation-first viewer UI with bidirectional sync between markers and issue log.

---

## Chunk 7.17 — QA Page Shell

### Purpose
Main page layout with mode toggle and state management.

### Requirements
- Full-height layout with header
- Mode toggle: single / compare
- Single mode: Input OR Viewer + IssueLog
- Zustand store for QA state

### Implementation

```typescript
// src/stores/qaStore.ts
import { create } from 'zustand';
import { CapturedAsset, Issue } from '../types/qa';

interface QAState {
  mode: 'single' | 'compare';
  setMode: (mode: 'single' | 'compare') => void;
  
  // Single mode
  asset: CapturedAsset | null;
  setAsset: (asset: CapturedAsset | null) => void;
  
  issues: Issue[];
  setIssues: (issues: Issue[]) => void;
  
  activeIssueId: string | null;
  setActiveIssue: (id: string | null) => void;
  
  // Handler registration for cross-component sync
  panToIssueHandler: ((issueId: string) => void) | null;
  setPanToIssueHandler: (handler: ((issueId: string) => void) | null) => void;
  
  scrollToIssueHandler: ((issueId: string) => void) | null;
  setScrollToIssueHandler: (handler: ((issueId: string) => void) | null) => void;
  
  // Compare mode
  sourceAsset: CapturedAsset | null;
  targetAsset: CapturedAsset | null;
  setSourceAsset: (asset: CapturedAsset | null) => void;
  setTargetAsset: (asset: CapturedAsset | null) => void;
  
  // Analysis state
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

export const useQAStore = create<QAState>((set) => ({
  mode: 'single',
  setMode: (mode) => set({ mode }),
  
  asset: null,
  setAsset: (asset) => set({ asset }),
  
  issues: [],
  setIssues: (issues) => set({ issues }),
  
  activeIssueId: null,
  setActiveIssue: (id) => set({ activeIssueId: id }),
  
  panToIssueHandler: null,
  setPanToIssueHandler: (handler) => set({ panToIssueHandler: handler }),
  
  scrollToIssueHandler: null,
  setScrollToIssueHandler: (handler) => set({ scrollToIssueHandler: handler }),
  
  sourceAsset: null,
  targetAsset: null,
  setSourceAsset: (asset) => set({ sourceAsset: asset }),
  setTargetAsset: (asset) => set({ targetAsset: asset }),
  
  isAnalyzing: false,
  setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
}));
```

```jsx
// src/pages/QAPage.jsx
import { useQAStore } from '../stores/qaStore';
import { QAHeader } from '../components/qa/QAHeader';
import { InputPanel } from '../components/qa/InputPanel';
import { AnnotatedImageViewer } from '../components/qa/viewer/AnnotatedImageViewer';
import { IssueLog } from '../components/qa/issues/IssueLog';
import { ComparisonWorkspace } from '../components/qa/comparison/ComparisonWorkspace';

export function QAPage() {
  const { mode, asset, issues } = useQAStore();
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <QAHeader />
      
      {mode === 'single' ? (
        <div className="flex-1 flex overflow-hidden">
          {!asset ? (
            <div className="flex-1 flex items-center justify-center">
              <InputPanel />
            </div>
          ) : (
            <>
              <div className="flex-1 p-4">
                <AnnotatedImageViewer />
              </div>
              <div className="w-96 border-l bg-white overflow-hidden">
                <IssueLog issues={issues} />
              </div>
            </>
          )}
        </div>
      ) : (
        <ComparisonWorkspace />
      )}
    </div>
  );
}
```

```jsx
// src/components/qa/QAHeader.jsx
import { useQAStore } from '../../stores/qaStore';
import { Scan, GitCompare } from 'lucide-react';

export function QAHeader() {
  const { mode, setMode, asset, setAsset, setIssues } = useQAStore();
  
  const handleReset = () => {
    setAsset(null);
    setIssues([]);
  };
  
  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <h1 className="font-semibold">Visual QA</h1>
        
        {asset && (
          <button
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            New Analysis
          </button>
        )}
      </div>
      
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setMode('single')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm transition-colors
            ${mode === 'single' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <Scan size={16} />
          Single
        </button>
        <button
          onClick={() => setMode('compare')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm transition-colors
            ${mode === 'compare' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <GitCompare size={16} />
          Compare
        </button>
      </div>
    </header>
  );
}
```

### Files
- `src/stores/qaStore.ts`
- `src/pages/QAPage.jsx`
- `src/components/qa/QAHeader.jsx`

---

## Chunk 7.18 — ZoomPanContainer

### Purpose
Controlled zoom and pan with focal point math.

### Requirements
- Mouse wheel → zoom toward cursor position
- Click + drag → pan
- Apply CSS transform to children
- Cursor: grab/grabbing

### Implementation

```jsx
// src/components/qa/viewer/ZoomPanContainer.jsx
import { useRef, useState, useCallback } from 'react';

export function ZoomPanContainer({
  scale,
  position,
  onScaleChange,
  onPositionChange,
  minScale = 0.1,
  maxScale = 5,
  children,
}) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Zoom toward cursor position
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const focalPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    
    const delta = -e.deltaY * 0.001;
    const newScale = Math.min(maxScale, Math.max(minScale, scale * (1 + delta)));
    const scaleChange = newScale / scale;
    
    // Adjust position to zoom toward focal point
    const newPosition = {
      x: focalPoint.x - (focalPoint.x - position.x) * scaleChange,
      y: focalPoint.y - (focalPoint.y - position.y) * scaleChange,
    };
    
    onScaleChange(newScale);
    onPositionChange(newPosition);
  }, [scale, position, minScale, maxScale, onScaleChange, onPositionChange]);
  
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);
  
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    onPositionChange({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart, onPositionChange]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden relative"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: '0 0',
        }}
      >
        {children}
      </div>
    </div>
  );
}
```

### Files
- `src/components/qa/viewer/ZoomPanContainer.jsx`

---

## Chunk 7.19 — MarkerOverlay + Marker

### Purpose
Render clickable markers on the image.

### Requirements
- Numbered circle badge
- Color by status: red (fail), yellow (warn), green (pass)
- Pointer triangle below badge
- Active state: pulse animation + ring
- onClick calls handler

### Implementation

```jsx
// src/components/qa/viewer/Marker.jsx
import { cn } from '../../../lib/utils';

const STATUS_COLORS = {
  fail: 'bg-red-500 text-white',
  warn: 'bg-yellow-500 text-black',
  pass: 'bg-green-500 text-white',
};

export function Marker({ issue, isActive, onClick }) {
  return (
    <div
      className="absolute cursor-pointer"
      style={{
        left: issue.marker.x,
        top: issue.marker.y,
        transform: 'translate(-50%, -100%)',
      }}
      onClick={() => onClick(issue.id)}
    >
      {/* Pulse animation when active */}
      {isActive && (
        <div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-75" />
      )}
      
      {/* Badge */}
      <div
        className={cn(
          'relative w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg',
          STATUS_COLORS[issue.status],
          isActive && 'ring-2 ring-blue-500 ring-offset-2'
        )}
      >
        {issue.number}
      </div>
      
      {/* Pointer triangle */}
      <div
        className={cn(
          'w-0 h-0 mx-auto',
          'border-l-4 border-r-4 border-t-4',
          'border-l-transparent border-r-transparent',
          issue.status === 'fail' ? 'border-t-red-500' :
          issue.status === 'warn' ? 'border-t-yellow-500' : 'border-t-green-500'
        )}
      />
    </div>
  );
}
```

```jsx
// src/components/qa/viewer/MarkerCluster.jsx
import { cn } from '../../../lib/utils';

export function MarkerCluster({ cluster, isActive, onClick }) {
  const worstStatus = cluster.issues.reduce((worst, issue) => {
    if (issue.status === 'fail') return 'fail';
    if (issue.status === 'warn' && worst !== 'fail') return 'warn';
    return worst;
  }, 'pass');
  
  return (
    <div
      className="absolute cursor-pointer"
      style={{
        left: cluster.position.x,
        top: cluster.position.y,
        transform: 'translate(-50%, -100%)',
      }}
      onClick={() => onClick(cluster.id)}
    >
      <div
        className={cn(
          'relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg',
          worstStatus === 'fail' ? 'bg-red-500 text-white' :
          worstStatus === 'warn' ? 'bg-yellow-500 text-black' : 'bg-green-500 text-white',
          isActive && 'ring-2 ring-blue-500 ring-offset-2'
        )}
      >
        {cluster.issues.length}
      </div>
    </div>
  );
}
```

```jsx
// src/components/qa/viewer/MarkerOverlay.jsx
import { Marker } from './Marker';
import { MarkerCluster } from './MarkerCluster';
import { useQAStore } from '../../../stores/qaStore';
import { clusterMarkers } from '../../../lib/qa/issues/markerClusterer';
import { useMemo } from 'react';

export function MarkerOverlay({ issues, onMarkerClick }) {
  const { activeIssueId } = useQAStore();
  
  const { standalone, clusters } = useMemo(
    () => clusterMarkers(issues),
    [issues]
  );
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {standalone.map(issue => (
        <div key={issue.id} className="pointer-events-auto">
          <Marker
            issue={issue}
            isActive={activeIssueId === issue.id}
            onClick={onMarkerClick}
          />
        </div>
      ))}
      
      {clusters.map(cluster => (
        <div key={cluster.id} className="pointer-events-auto">
          <MarkerCluster
            cluster={cluster}
            isActive={cluster.issues.some(i => i.id === activeIssueId)}
            onClick={() => onMarkerClick(cluster.issues[0].id)}
          />
        </div>
      ))}
    </div>
  );
}
```

### Files
- `src/components/qa/viewer/Marker.jsx`
- `src/components/qa/viewer/MarkerCluster.jsx`
- `src/components/qa/viewer/MarkerOverlay.jsx`

---

## Chunk 7.20 — AnnotatedImageViewer ★ CRITICAL

### Purpose
Main viewer combining zoom/pan, markers, and tooltip.

### Requirements
- Initial fit: scale to container, centered
- Register panToIssue handler in store
- Toolbar: zoom controls

### Implementation

```jsx
// src/components/qa/viewer/AnnotatedImageViewer.jsx
import { useState, useCallback, useEffect, useRef } from 'react';
import { ZoomPanContainer } from './ZoomPanContainer';
import { MarkerOverlay } from './MarkerOverlay';
import { HoverTooltip } from './HoverTooltip';
import { ViewerToolbar } from './ViewerToolbar';
import { useQAStore } from '../../../stores/qaStore';

export function AnnotatedImageViewer() {
  const containerRef = useRef(null);
  const { asset, issues, setActiveIssue, setPanToIssueHandler, scrollToIssueHandler } = useQAStore();
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hoveredIssue, setHoveredIssue] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  
  // Calculate initial fit
  useEffect(() => {
    if (!asset || !containerRef.current) return;
    
    const container = containerRef.current;
    const containerW = container.clientWidth;
    const containerH = container.clientHeight;
    const imageW = asset.image.width;
    const imageH = asset.image.height;
    
    const scaleX = containerW / imageW;
    const scaleY = containerH / imageH;
    const fitScale = Math.min(scaleX, scaleY) * 0.9; // 90% fit with padding
    
    const offsetX = (containerW - imageW * fitScale) / 2;
    const offsetY = (containerH - imageH * fitScale) / 2;
    
    setScale(fitScale);
    setPosition({ x: offsetX, y: offsetY });
  }, [asset]);
  
  // Register pan handler for bidirectional sync
  useEffect(() => {
    const panToIssue = (issueId) => {
      const issue = issues.find(i => i.id === issueId);
      if (!issue || !containerRef.current) return;
      
      const container = containerRef.current;
      const containerW = container.clientWidth;
      const containerH = container.clientHeight;
      
      // Center the issue marker in view
      const targetX = containerW / 2 - issue.marker.x * scale;
      const targetY = containerH / 2 - issue.marker.y * scale;
      
      setPosition({ x: targetX, y: targetY });
    };
    
    setPanToIssueHandler(panToIssue);
    return () => setPanToIssueHandler(null);
  }, [issues, scale, setPanToIssueHandler]);
  
  const handleMarkerClick = useCallback((issueId) => {
    setActiveIssue(issueId);
    // Scroll to issue in log
    scrollToIssueHandler?.(issueId);
  }, [setActiveIssue, scrollToIssueHandler]);
  
  const handleFitToView = useCallback(() => {
    if (!asset || !containerRef.current) return;
    
    const container = containerRef.current;
    const scaleX = container.clientWidth / asset.image.width;
    const scaleY = container.clientHeight / asset.image.height;
    const fitScale = Math.min(scaleX, scaleY) * 0.9;
    
    setScale(fitScale);
    setPosition({
      x: (container.clientWidth - asset.image.width * fitScale) / 2,
      y: (container.clientHeight - asset.image.height * fitScale) / 2,
    });
  }, [asset]);
  
  if (!asset) return null;
  
  return (
    <div ref={containerRef} className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      <ZoomPanContainer
        scale={scale}
        position={position}
        onScaleChange={setScale}
        onPositionChange={setPosition}
      >
        <div className="relative">
          <img
            src={asset.image.url}
            alt="Analysis target"
            style={{ width: asset.image.width, height: asset.image.height }}
            draggable={false}
          />
          <MarkerOverlay
            issues={issues}
            onMarkerClick={handleMarkerClick}
          />
        </div>
      </ZoomPanContainer>
      
      <ViewerToolbar
        scale={scale}
        onZoomIn={() => setScale(s => Math.min(5, s * 1.2))}
        onZoomOut={() => setScale(s => Math.max(0.1, s / 1.2))}
        onFitToView={handleFitToView}
        onActualSize={() => setScale(1)}
      />
      
      {hoveredIssue && (
        <HoverTooltip
          issue={hoveredIssue}
          position={hoverPosition}
        />
      )}
    </div>
  );
}
```

```jsx
// src/components/qa/viewer/ViewerToolbar.jsx
import { ZoomIn, ZoomOut, Maximize, Square } from 'lucide-react';

export function ViewerToolbar({ scale, onZoomIn, onZoomOut, onFitToView, onActualSize }) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white rounded-lg shadow-lg p-1">
      <button
        onClick={onZoomOut}
        className="p-2 hover:bg-gray-100 rounded"
        title="Zoom out"
      >
        <ZoomOut size={18} />
      </button>
      
      <span className="px-2 text-sm font-medium min-w-[4rem] text-center">
        {Math.round(scale * 100)}%
      </span>
      
      <button
        onClick={onZoomIn}
        className="p-2 hover:bg-gray-100 rounded"
        title="Zoom in"
      >
        <ZoomIn size={18} />
      </button>
      
      <div className="w-px h-6 bg-gray-200 mx-1" />
      
      <button
        onClick={onFitToView}
        className="p-2 hover:bg-gray-100 rounded"
        title="Fit to view"
      >
        <Maximize size={18} />
      </button>
      
      <button
        onClick={onActualSize}
        className="p-2 hover:bg-gray-100 rounded"
        title="Actual size (100%)"
      >
        <Square size={18} />
      </button>
    </div>
  );
}
```

### Files
- `src/components/qa/viewer/AnnotatedImageViewer.jsx`
- `src/components/qa/viewer/ViewerToolbar.jsx`

---

## Chunk 7.21 — HoverTooltip

### Purpose
Show color/font info on hover.

### Implementation

```jsx
// src/components/qa/viewer/HoverTooltip.jsx
export function HoverTooltip({ issue, position }) {
  return (
    <div
      className="absolute z-50 bg-gray-900 text-white text-sm rounded-lg shadow-xl p-3 pointer-events-none"
      style={{
        left: position.x + 10,
        top: position.y + 10,
        maxWidth: 280,
      }}
    >
      <div className="flex items-start gap-3">
        {issue.type === 'color' && (
          <div
            className="w-8 h-8 rounded border border-white/20 flex-shrink-0"
            style={{ backgroundColor: issue.source.value }}
          />
        )}
        
        <div className="flex-1 min-w-0">
          <div className="font-medium">
            Issue #{issue.number}
          </div>
          <div className="text-gray-300 text-xs mt-1">
            {issue.message}
          </div>
          
          {issue.suggestion && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <div className="text-xs text-gray-400">Suggested fix:</div>
              <code className="text-xs text-green-400 block mt-1">
                {issue.suggestion.cssVariable}
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Files
- `src/components/qa/viewer/HoverTooltip.jsx`

---

## Chunk 7.22 — IssueLog

### Purpose
Scrollable list of issues.

### Implementation

```jsx
// src/components/qa/issues/IssueLog.jsx
import { useRef, useEffect } from 'react';
import { IssueItem } from './IssueItem';
import { useQAStore } from '../../../stores/qaStore';

export function IssueLog({ issues }) {
  const listRef = useRef(null);
  const { activeIssueId, setActiveIssue, panToIssueHandler, setScrollToIssueHandler } = useQAStore();
  
  // Register scroll handler
  useEffect(() => {
    const scrollToIssue = (issueId) => {
      const element = document.getElementById(`issue-${issueId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    
    setScrollToIssueHandler(scrollToIssue);
    return () => setScrollToIssueHandler(null);
  }, [setScrollToIssueHandler]);
  
  const handleIssueClick = (issueId) => {
    setActiveIssue(issueId);
    // Pan to marker
    panToIssueHandler?.(issueId);
  };
  
  const failCount = issues.filter(i => i.status === 'fail').length;
  const warnCount = issues.filter(i => i.status === 'warn').length;
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Issues</h2>
        <div className="flex gap-4 mt-2 text-sm">
          <span className="text-red-600">{failCount} errors</span>
          <span className="text-yellow-600">{warnCount} warnings</span>
        </div>
      </div>
      
      <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-2">
        {issues.map(issue => (
          <IssueItem
            key={issue.id}
            issue={issue}
            isActive={activeIssueId === issue.id}
            onClick={() => handleIssueClick(issue.id)}
          />
        ))}
        
        {issues.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No issues found
          </div>
        )}
      </div>
    </div>
  );
}
```

```jsx
// src/components/qa/issues/IssueItem.jsx
import { cn } from '../../../lib/utils';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

const STATUS_CONFIG = {
  fail: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 border-red-200' },
  warn: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50 border-yellow-200' },
  pass: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 border-green-200' },
};

export function IssueItem({ issue, isActive, onClick }) {
  const config = STATUS_CONFIG[issue.status];
  const Icon = config.icon;
  
  return (
    <div
      id={`issue-${issue.id}`}
      onClick={onClick}
      className={cn(
        'p-3 rounded-lg border cursor-pointer transition-all',
        config.bg,
        isActive && 'ring-2 ring-blue-500'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('flex-shrink-0 mt-0.5', config.color)}>
          <Icon size={18} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">#{issue.number}</span>
            <span className="text-sm text-gray-500 capitalize">{issue.type}</span>
          </div>
          
          <p className="text-sm text-gray-700 mt-1">
            {issue.message}
          </p>
          
          {issue.suggestion && (
            <div className="mt-2 flex items-center gap-2">
              {issue.type === 'color' && (
                <>
                  <div
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: issue.source.value }}
                  />
                  <span className="text-gray-400">→</span>
                  <div
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: issue.suggestion.value }}
                  />
                </>
              )}
              <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                {issue.suggestion.cssVariable}
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Files
- `src/components/qa/issues/IssueLog.jsx`
- `src/components/qa/issues/IssueItem.jsx`

---

## Chunk 7.23 — Issue ↔ Marker Sync ★ CRITICAL

### Purpose
Bidirectional sync: click marker → highlight issue, click issue → pan to marker.

### Implementation

Already implemented in chunks 7.20 and 7.22. The key pattern:

```jsx
// In AnnotatedImageViewer (7.20):
// 1. Register panToIssue handler
useEffect(() => {
  setPanToIssueHandler((issueId) => {
    // Pan viewer to center issue marker
  });
}, []);

// 2. On marker click, set active and trigger scroll
const handleMarkerClick = (issueId) => {
  setActiveIssue(issueId);
  scrollToIssueHandler?.(issueId);  // Call log's scroll handler
};

// In IssueLog (7.22):
// 1. Register scrollToIssue handler
useEffect(() => {
  setScrollToIssueHandler((issueId) => {
    // Scroll issue into view
  });
}, []);

// 2. On issue click, set active and trigger pan
const handleIssueClick = (issueId) => {
  setActiveIssue(issueId);
  panToIssueHandler?.(issueId);  // Call viewer's pan handler
};
```

Create a hook to encapsulate the sync logic:

```typescript
// src/hooks/useIssueSyncController.ts
import { useEffect } from 'react';
import { useQAStore } from '../stores/qaStore';

export function useIssueSyncController() {
  const { 
    activeIssueId, 
    setActiveIssue,
    panToIssueHandler,
    scrollToIssueHandler,
  } = useQAStore();
  
  // Sync active issue changes
  useEffect(() => {
    if (!activeIssueId) return;
    
    // Both handlers will be called when activeIssue changes
    // This creates the bidirectional sync
  }, [activeIssueId]);
  
  return {
    activateIssue: (issueId: string, source: 'marker' | 'log') => {
      setActiveIssue(issueId);
      
      if (source === 'marker') {
        scrollToIssueHandler?.(issueId);
      } else {
        panToIssueHandler?.(issueId);
      }
    },
  };
}
```

### Files
- `src/hooks/useIssueSyncController.ts`

---

## Chunk 7.24 — Export PDF

### Purpose
Export annotated image as PDF.

### Implementation

```jsx
// src/components/qa/export/ExportButton.jsx
import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { exportToPdf } from '../../../lib/qa/export/pdfExport';
import { useQAStore } from '../../../stores/qaStore';

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);
  const { asset, issues } = useQAStore();
  
  const handleExport = async () => {
    if (!asset) return;
    
    setIsExporting(true);
    try {
      await exportToPdf(asset, issues);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <button
      onClick={handleExport}
      disabled={!asset || isExporting}
      className="px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
    >
      {isExporting ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
      Export PDF
    </button>
  );
}
```

```typescript
// src/lib/qa/export/pdfExport.ts
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CapturedAsset, Issue } from '../../../types/qa';

export async function exportToPdf(asset: CapturedAsset, issues: Issue[]) {
  // Capture the viewer element
  const viewer = document.querySelector('[data-qa-viewer]');
  if (!viewer) throw new Error('Viewer not found');
  
  const canvas = await html2canvas(viewer as HTMLElement, {
    scale: 2,
    useCORS: true,
  });
  
  const imgData = canvas.toDataURL('image/png');
  
  // Create PDF
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height],
  });
  
  // Add annotated image
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  
  // Add issue summary page
  pdf.addPage();
  pdf.setFontSize(24);
  pdf.text('Visual QA Report', 40, 60);
  
  pdf.setFontSize(12);
  let y = 100;
  
  for (const issue of issues) {
    if (y > pdf.internal.pageSize.height - 60) {
      pdf.addPage();
      y = 60;
    }
    
    const statusColor = issue.status === 'fail' ? '#ef4444' : issue.status === 'warn' ? '#eab308' : '#22c55e';
    pdf.setTextColor(statusColor);
    pdf.text(`#${issue.number} [${issue.status.toUpperCase()}]`, 40, y);
    
    pdf.setTextColor('#000000');
    pdf.text(issue.message, 40, y + 16);
    
    if (issue.suggestion) {
      pdf.setTextColor('#666666');
      pdf.text(`Fix: ${issue.suggestion.cssVariable}`, 40, y + 32);
    }
    
    y += 60;
  }
  
  pdf.save(`qa-report-${Date.now()}.pdf`);
}
```

### Files
- `src/components/qa/export/ExportButton.jsx`
- `src/lib/qa/export/pdfExport.ts`

---

## Chunk 7.25 — SplitImageViewer

### Purpose
Side-by-side viewer for comparison mode.

### Implementation

```jsx
// src/components/qa/comparison/SplitImageViewer.jsx
import { ZoomPanContainer } from '../viewer/ZoomPanContainer';

export function SplitImageViewer({ 
  asset, 
  label,
  scale,
  position,
  onScaleChange,
  onPositionChange,
  syncEnabled,
}) {
  return (
    <div className="flex-1 flex flex-col border rounded-lg overflow-hidden bg-gray-100">
      <div className="px-3 py-2 bg-white border-b text-sm font-medium">
        {label}
      </div>
      
      <div className="flex-1 relative">
        {asset ? (
          <ZoomPanContainer
            scale={scale}
            position={position}
            onScaleChange={onScaleChange}
            onPositionChange={onPositionChange}
          >
            <img
              src={asset.image.url}
              alt={label}
              style={{ width: asset.image.width, height: asset.image.height }}
              draggable={false}
            />
          </ZoomPanContainer>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            No image selected
          </div>
        )}
      </div>
    </div>
  );
}
```

### Files
- `src/components/qa/comparison/SplitImageViewer.jsx`

---

## Chunk 7.26 — ViewSync

### Purpose
Sync zoom/pan between two viewers.

### Implementation

```typescript
// src/hooks/useViewSync.ts
import { useState, useCallback } from 'react';

interface ViewState {
  scale: number;
  position: { x: number; y: number };
}

export function useViewSync(syncEnabled: boolean) {
  const [leftView, setLeftView] = useState<ViewState>({ scale: 1, position: { x: 0, y: 0 } });
  const [rightView, setRightView] = useState<ViewState>({ scale: 1, position: { x: 0, y: 0 } });
  
  const setLeftScale = useCallback((scale: number) => {
    setLeftView(prev => ({ ...prev, scale }));
    if (syncEnabled) {
      setRightView(prev => ({ ...prev, scale }));
    }
  }, [syncEnabled]);
  
  const setLeftPosition = useCallback((position: { x: number; y: number }) => {
    setLeftView(prev => ({ ...prev, position }));
    if (syncEnabled) {
      setRightView(prev => ({ ...prev, position }));
    }
  }, [syncEnabled]);
  
  const setRightScale = useCallback((scale: number) => {
    setRightView(prev => ({ ...prev, scale }));
    if (syncEnabled) {
      setLeftView(prev => ({ ...prev, scale }));
    }
  }, [syncEnabled]);
  
  const setRightPosition = useCallback((position: { x: number; y: number }) => {
    setRightView(prev => ({ ...prev, position }));
    if (syncEnabled) {
      setLeftView(prev => ({ ...prev, position }));
    }
  }, [syncEnabled]);
  
  return {
    leftView,
    rightView,
    setLeftScale,
    setLeftPosition,
    setRightScale,
    setRightPosition,
  };
}
```

### Files
- `src/hooks/useViewSync.ts`

---

## Chunk 7.27 — Delta Calculator

### Purpose
Compare colors between source and target.

### Implementation

```typescript
// src/lib/qa/comparison/deltaCalculator.ts
import { LocatedColor } from '../extraction/regionDetector';
import { deltaE2000, rgbToLab } from '../matching/deltaE';

export interface ColorDelta {
  sourceColor: LocatedColor;
  targetColor: LocatedColor | null;
  deltaE: number;
  status: 'match' | 'similar' | 'different' | 'missing';
}

export function calculateDeltas(
  sourceColors: LocatedColor[],
  targetColors: LocatedColor[]
): ColorDelta[] {
  return sourceColors.map(source => {
    const sourceLab = rgbToLab(source.rgb);
    
    let bestMatch: LocatedColor | null = null;
    let bestDeltaE = Infinity;
    
    for (const target of targetColors) {
      const targetLab = rgbToLab(target.rgb);
      const dE = deltaE2000(sourceLab, targetLab);
      
      if (dE < bestDeltaE) {
        bestDeltaE = dE;
        bestMatch = target;
      }
    }
    
    let status: ColorDelta['status'];
    if (!bestMatch || bestDeltaE > 30) {
      status = 'missing';
    } else if (bestDeltaE <= 1) {
      status = 'match';
    } else if (bestDeltaE <= 5) {
      status = 'similar';
    } else {
      status = 'different';
    }
    
    return {
      sourceColor: source,
      targetColor: bestMatch,
      deltaE: bestDeltaE,
      status,
    };
  });
}
```

### Files
- `src/lib/qa/comparison/deltaCalculator.ts`

---

## Chunk 7.28 — ComparisonWorkspace

### Purpose
Full comparison mode UI.

### Implementation

```jsx
// src/components/qa/comparison/ComparisonWorkspace.jsx
import { useState } from 'react';
import { SplitImageViewer } from './SplitImageViewer';
import { DeltaLog } from './DeltaLog';
import { useQAStore } from '../../../stores/qaStore';
import { useViewSync } from '../../../hooks/useViewSync';
import { Link2, Link2Off } from 'lucide-react';

export function ComparisonWorkspace() {
  const { sourceAsset, targetAsset } = useQAStore();
  const [syncEnabled, setSyncEnabled] = useState(true);
  const { leftView, rightView, setLeftScale, setLeftPosition, setRightScale, setRightPosition } = useViewSync(syncEnabled);
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-2 border-b bg-white flex items-center justify-center gap-2">
        <button
          onClick={() => setSyncEnabled(!syncEnabled)}
          className={`px-3 py-1.5 rounded flex items-center gap-2 text-sm
            ${syncEnabled ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
        >
          {syncEnabled ? <Link2 size={16} /> : <Link2Off size={16} />}
          {syncEnabled ? 'Sync On' : 'Sync Off'}
        </button>
      </div>
      
      <div className="flex-1 flex gap-2 p-2">
        <SplitImageViewer
          asset={sourceAsset}
          label="Source"
          scale={leftView.scale}
          position={leftView.position}
          onScaleChange={setLeftScale}
          onPositionChange={setLeftPosition}
          syncEnabled={syncEnabled}
        />
        
        <SplitImageViewer
          asset={targetAsset}
          label="Target"
          scale={rightView.scale}
          position={rightView.position}
          onScaleChange={setRightScale}
          onPositionChange={setRightPosition}
          syncEnabled={syncEnabled}
        />
      </div>
    </div>
  );
}
```

### Files
- `src/components/qa/comparison/ComparisonWorkspace.jsx`

---

## Gate 7D/7E Verification

```bash
npm run build
```

Manual test:
1. Upload image → markers appear
2. Click marker → issue highlights + scrolls into view
3. Click issue → viewer pans to marker
4. Compare mode → two images side by side
5. Toggle sync → zoom/pan syncs or doesn't
