/**
 * @chunk 7.19 - MarkerOverlay + Marker
 * Cluster nearby markers to avoid visual overlap
 */
import { Issue } from '../../../types/qa';

export interface MarkerCluster {
  id: string;
  position: { x: number; y: number };
  issues: Issue[];
}

export interface ClusterResult {
  standalone: Issue[];
  clusters: MarkerCluster[];
}

const CLUSTER_DISTANCE = 40; // pixels

/**
 * Calculate distance between two points
 */
function distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * Cluster markers that are close together to avoid visual overlap
 */
export function clusterMarkers(issues: Issue[]): ClusterResult {
  if (issues.length === 0) {
    return { standalone: [], clusters: [] };
  }

  const used = new Set<string>();
  const clusters: MarkerCluster[] = [];
  const standalone: Issue[] = [];

  for (const issue of issues) {
    if (used.has(issue.id)) continue;

    // Find all issues within cluster distance
    const nearbyIssues = issues.filter(
      (other) =>
        !used.has(other.id) &&
        distance(issue.marker, other.marker) <= CLUSTER_DISTANCE
    );

    if (nearbyIssues.length > 1) {
      // Create a cluster
      const avgX = nearbyIssues.reduce((sum, i) => sum + i.marker.x, 0) / nearbyIssues.length;
      const avgY = nearbyIssues.reduce((sum, i) => sum + i.marker.y, 0) / nearbyIssues.length;

      clusters.push({
        id: `cluster-${issue.id}`,
        position: { x: avgX, y: avgY },
        issues: nearbyIssues,
      });

      nearbyIssues.forEach((i) => used.add(i.id));
    } else {
      // Standalone marker
      standalone.push(issue);
      used.add(issue.id);
    }
  }

  return { standalone, clusters };
}
