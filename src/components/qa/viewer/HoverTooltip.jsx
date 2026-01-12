/**
 * @chunk 7.20 - AnnotatedImageViewer (dependency)
 * @chunk 7.21 - HoverTooltip
 * Tooltip showing color/font info on hover
 */
export function HoverTooltip({ issue, position }) {
  return (
    <div
      className="absolute z-50 bg-gray-900 text-white text-sm rounded-lg shadow-xl p-3 pointer-events-none"
      style={{
        left: position.x + 10,
        top: position.y + 10,
        maxWidth: 280,
      }}
    >
      <div className="flex items-start gap-3">
        {issue.type === 'color' && (
          <div
            className="w-8 h-8 rounded border border-white/20 flex-shrink-0"
            style={{ backgroundColor: issue.source.value }}
          />
        )}

        <div className="flex-1 min-w-0">
          <div className="font-medium">
            Issue #{issue.number}
          </div>
          <div className="text-gray-300 text-xs mt-1">
            {issue.message}
          </div>

          {issue.suggestion && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <div className="text-xs text-gray-400">Suggested fix:</div>
              <code className="text-xs text-green-400 block mt-1">
                {issue.suggestion.cssVariable}
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
