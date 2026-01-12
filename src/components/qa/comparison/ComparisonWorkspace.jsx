/**
 * @chunk 7.17 - QA Page Shell
 * Placeholder ComparisonWorkspace component
 * Full implementation in chunk 7.28
 */
import { useQAStore } from '../../../stores/qaStore';
import { ImageIcon } from 'lucide-react';

export function ComparisonWorkspace() {
  const { sourceAsset, targetAsset } = useQAStore();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-2 border-b bg-white flex items-center justify-center gap-2">
        <span className="text-sm text-gray-500">Compare Mode</span>
      </div>

      <div className="flex-1 flex gap-2 p-2">
        <div className="flex-1 flex flex-col border rounded-lg overflow-hidden bg-gray-100">
          <div className="px-3 py-2 bg-white border-b text-sm font-medium">
            Source
          </div>
          <div className="flex-1 flex items-center justify-center">
            {sourceAsset ? (
              <img
                src={sourceAsset.image.url}
                alt="Source"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-gray-400 flex flex-col items-center gap-2">
                <ImageIcon className="w-8 h-8" />
                <span className="text-sm">No image selected</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col border rounded-lg overflow-hidden bg-gray-100">
          <div className="px-3 py-2 bg-white border-b text-sm font-medium">
            Target
          </div>
          <div className="flex-1 flex items-center justify-center">
            {targetAsset ? (
              <img
                src={targetAsset.image.url}
                alt="Target"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-gray-400 flex flex-col items-center gap-2">
                <ImageIcon className="w-8 h-8" />
                <span className="text-sm">No image selected</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
