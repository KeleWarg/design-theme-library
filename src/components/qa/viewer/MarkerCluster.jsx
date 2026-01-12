/**
 * @chunk 7.19 - MarkerOverlay + Marker
 * Cluster marker for grouped issues
 */
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
