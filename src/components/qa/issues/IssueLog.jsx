/**
 * @chunk 7.22 - IssueLog
 * Scrollable list of issues with bidirectional sync to markers
 */
import { useRef, useEffect } from 'react';
import { IssueItem } from './IssueItem';
import { useQAStore } from '../../../stores/qaStore';

export function IssueLog({ issues }) {
  const listRef = useRef(null);
  const { activeIssueId, setActiveIssue, panToIssueHandler, setScrollToIssueHandler } = useQAStore();

  // Register scroll handler
  useEffect(() => {
    const scrollToIssue = (issueId) => {
      const element = document.getElementById(`issue-${issueId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    setScrollToIssueHandler(scrollToIssue);
    return () => setScrollToIssueHandler(null);
  }, [setScrollToIssueHandler]);

  const handleIssueClick = (issueId) => {
    setActiveIssue(issueId);
    // Pan to marker
    panToIssueHandler?.(issueId);
  };

  const failCount = issues.filter(i => i.status === 'fail').length;
  const warnCount = issues.filter(i => i.status === 'warn').length;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Issues</h2>
        <div className="flex gap-4 mt-2 text-sm">
          <span className="text-red-600">{failCount} errors</span>
          <span className="text-yellow-600">{warnCount} warnings</span>
        </div>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-2">
        {issues.map(issue => (
          <IssueItem
            key={issue.id}
            issue={issue}
            isActive={activeIssueId === issue.id}
            onClick={() => handleIssueClick(issue.id)}
          />
        ))}

        {issues.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No issues found
          </div>
        )}
      </div>
    </div>
  );
}
