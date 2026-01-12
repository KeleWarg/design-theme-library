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
