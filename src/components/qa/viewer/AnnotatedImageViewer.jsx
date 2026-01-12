/**
 * @chunk 7.17 - QA Page Shell
 * Placeholder AnnotatedImageViewer component
 * Full implementation in chunk 7.20
 */
import { useQAStore } from '../../../stores/qaStore';

export function AnnotatedImageViewer() {
  const { asset } = useQAStore();

  if (!asset) return null;

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
      <img
        src={asset.image.url}
        alt="Analysis target"
        className="max-w-full max-h-full object-contain"
        draggable={false}
      />
    </div>
  );
}
