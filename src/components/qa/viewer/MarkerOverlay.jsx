/**
 * @chunk 7.19 - MarkerOverlay + Marker
 * Overlay container for rendering markers on the image
 */
import { useMemo } from 'react';
import { Marker } from './Marker';
import { MarkerCluster } from './MarkerCluster';
import { useQAStore } from '../../../stores/qaStore';
import { clusterMarkers } from '../../../lib/qa/issues/markerClusterer';

export function MarkerOverlay({ issues, onMarkerClick }) {
  const { activeIssueId } = useQAStore();

  const { standalone, clusters } = useMemo(
    () => clusterMarkers(issues),
    [issues]
  );

  return (
    <div className="absolute inset-0 pointer-events-none">
      {standalone.map((issue) => (
        <div key={issue.id} className="pointer-events-auto">
          <Marker
            issue={issue}
            isActive={activeIssueId === issue.id}
            onClick={onMarkerClick}
          />
        </div>
      ))}

      {clusters.map((cluster) => (
        <div key={cluster.id} className="pointer-events-auto">
          <MarkerCluster
            cluster={cluster}
            isActive={cluster.issues.some((i) => i.id === activeIssueId)}
            onClick={() => onMarkerClick(cluster.issues[0].id)}
          />
        </div>
      ))}
    </div>
  );
}
