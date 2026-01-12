/**
 * @chunk 7.20 - AnnotatedImageViewer
 * Toolbar with zoom controls for the viewer
 */
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
