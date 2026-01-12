/**
 * @chunk 7.28 - ComparisonWorkspace
 * Full comparison mode UI with synchronized side-by-side viewers.
 * Features:
 * - Two SplitImageViewers for source and target
 * - Sync toggle to link/unlink zoom and pan
 * - Uses useViewSync hook for state synchronization
 */
import { useState } from 'react';
import { SplitImageViewer } from './SplitImageViewer';
import { useQAStore } from '../../../stores/qaStore';
import { useViewSync } from '../../../hooks/useViewSync';
import { Link2, Link2Off } from 'lucide-react';

export function ComparisonWorkspace() {
  const { sourceAsset, targetAsset } = useQAStore();
  const [syncEnabled, setSyncEnabled] = useState(true);
  const {
    leftView,
    rightView,
    setLeftScale,
    setLeftPosition,
    setRightScale,
    setRightPosition,
  } = useViewSync(syncEnabled);

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
