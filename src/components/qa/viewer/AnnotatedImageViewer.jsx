/**
 * @chunk 7.20 - AnnotatedImageViewer ★ CRITICAL
 * Main viewer combining zoom/pan, markers, and tooltip
 *
 * Requirements:
 * - Initial fit: scale to container, centered
 * - Register panToIssue handler in store
 * - Toolbar: zoom controls
 */
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
      const issue = issues.find((i) => i.id === issueId);
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

  const handleMarkerClick = useCallback(
    (issueId) => {
      setActiveIssue(issueId);
      // Scroll to issue in log
      scrollToIssueHandler?.(issueId);
    },
    [setActiveIssue, scrollToIssueHandler]
  );

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
    <div
      ref={containerRef}
      data-qa-viewer
      className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden"
    >
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
          <MarkerOverlay issues={issues} onMarkerClick={handleMarkerClick} />
        </div>
      </ZoomPanContainer>

      <ViewerToolbar
        scale={scale}
        onZoomIn={() => setScale((s) => Math.min(5, s * 1.2))}
        onZoomOut={() => setScale((s) => Math.max(0.1, s / 1.2))}
        onFitToView={handleFitToView}
        onActualSize={() => setScale(1)}
      />

      {hoveredIssue && <HoverTooltip issue={hoveredIssue} position={hoverPosition} />}
    </div>
  );
}
