/**
 * @chunk 7.22 - IssueItem
 * Individual issue item with status-based styling
 */
import { cn } from '../../../lib/utils';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

const STATUS_CONFIG = {
  fail: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 border-red-200' },
  warn: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50 border-yellow-200' },
  pass: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 border-green-200' },
};

export function IssueItem({ issue, isActive, onClick }) {
  const config = STATUS_CONFIG[issue.status];
  const Icon = config.icon;

  return (
    <div
      id={`issue-${issue.id}`}
      onClick={onClick}
      className={cn(
        'p-3 rounded-lg border cursor-pointer transition-all',
        config.bg,
        isActive && 'ring-2 ring-blue-500'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('flex-shrink-0 mt-0.5', config.color)}>
          <Icon size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">#{issue.number}</span>
            <span className="text-sm text-gray-500 capitalize">{issue.type}</span>
          </div>

          <p className="text-sm text-gray-700 mt-1">
            {issue.message}
          </p>

          {issue.suggestion && (
            <div className="mt-2 flex items-center gap-2">
              {issue.type === 'color' && (
                <>
                  <div
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: issue.source.value }}
                  />
                  <span className="text-gray-400">→</span>
                  <div
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: issue.suggestion.value }}
                  />
                </>
              )}
              <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                {issue.suggestion.cssVariable}
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
