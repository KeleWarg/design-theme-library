/**
 * @chunk 7.17 - QA Page Shell
 * Placeholder IssueLog component
 * Full implementation in chunk 7.22
 */

export function IssueLog({ issues }) {
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

      <div className="flex-1 overflow-y-auto p-2">
        {issues.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No issues found
          </div>
        ) : (
          <div className="space-y-2">
            {issues.map(issue => (
              <div
                key={issue.id}
                className="p-3 rounded-lg border bg-gray-50"
              >
                <span className="font-medium">#{issue.number}</span>
                <span className="ml-2 text-sm text-gray-600">{issue.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
