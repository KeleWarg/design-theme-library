/**
 * @chunk 7.25 - SplitImageViewer
 * Side-by-side viewer for comparison mode with zoom/pan support.
 */
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
