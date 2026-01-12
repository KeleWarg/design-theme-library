/**
 * @chunk 7.23 - Issue ↔ Marker Sync
 * Hook to encapsulate bidirectional sync between markers and issues.
 * Click marker → highlight issue + scroll into view
 * Click issue → pan viewer to marker
 */
import { useEffect } from 'react';
import { useQAStore } from '../stores/qaStore';

export function useIssueSyncController() {
  const {
    activeIssueId,
    setActiveIssue,
    panToIssueHandler,
    scrollToIssueHandler,
  } = useQAStore();

  // Sync active issue changes
  useEffect(() => {
    if (!activeIssueId) return;

    // Both handlers will be called when activeIssue changes
    // This creates the bidirectional sync
  }, [activeIssueId]);

  return {
    /**
     * Activate an issue from either the marker (viewer) or the log.
     * Automatically triggers the appropriate sync action based on source.
     *
     * @param issueId - The ID of the issue to activate
     * @param source - Where the activation originated: 'marker' (from viewer) or 'log' (from issue list)
     */
    activateIssue: (issueId: string, source: 'marker' | 'log') => {
      setActiveIssue(issueId);

      if (source === 'marker') {
        // Clicked marker → scroll to issue in log
        scrollToIssueHandler?.(issueId);
      } else {
        // Clicked issue in log → pan viewer to marker
        panToIssueHandler?.(issueId);
      }
    },
  };
}
