/**
 * @chunk 7.19 - MarkerOverlay + Marker
 * Clickable marker component for issues on the image
 */
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
