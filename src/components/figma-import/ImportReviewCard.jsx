/**
 * @chunk 4.07 - ImportReviewCard
 * 
 * Card component for displaying a single Figma import record (file-level import),
 * with stats and review/import actions.
 */

import { Figma, Layers2, Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import Button from '../ui/Button';
import { formatDate } from '../../lib/utils';

function getStatusMeta(status) {
  switch (status) {
    case 'imported':
      return { label: 'Imported', icon: CheckCircle2 };
    case 'partial':
      return { label: 'Partial', icon: AlertCircle };
    case 'failed':
      return { label: 'Failed', icon: AlertCircle };
    case 'pending':
    default:
      return { label: 'Pending', icon: Clock };
  }
}

export default function ImportReviewCard({
  import: importRecord,
  onReview,
  onImport,
  onRetry,
  onReset,
}) {
  if (!importRecord) return null;

  const fileName =
    importRecord.metadata?.fileName ||
    importRecord.file_name ||
    'Untitled Import';

  const exportedAt =
    importRecord.metadata?.exportedAt ||
    importRecord.exported_at ||
    null;

  const componentCount = importRecord.componentCount ?? importRecord.component_count ?? 0;

  const statusMeta = getStatusMeta(importRecord.status);
  const StatusIcon = statusMeta.icon;

  const status = importRecord.status || 'pending';
  const canReset = status !== 'pending';
  const canRetry = status === 'failed' || status === 'partial';
  const canReimport = status === 'imported';

  return (
    <div className="import-review-card">
      <div className="card-preview">
        <div className="no-preview" aria-label="Figma import">
          <Figma size={32} />
        </div>
      </div>

      <div className="card-content">
        <h3 className="card-title">{fileName}</h3>
        <p className="card-description">
          {importRecord.file_key ? `Figma file key: ${importRecord.file_key}` : 'Imported from Figma plugin'}
        </p>
        
        <div className="card-stats">
          <span title="Components">
            <Layers2 size={14} />
            {componentCount} component{componentCount === 1 ? '' : 's'}
          </span>
          <span title="Status">
            <StatusIcon size={14} />
            {statusMeta.label}
          </span>
          <span title="Exported at">
            <Calendar size={14} />
            {exportedAt ? formatDate(exportedAt, { dateStyle: 'medium' }) : 'Unknown date'}
          </span>
        </div>
      </div>

      <div className="card-actions">
        <Button variant="ghost" onClick={() => onReview?.(importRecord)}>
          Review
        </Button>
        {canReset && (
          <Button variant="ghost" onClick={() => onReset?.(importRecord)}>
            Reset
          </Button>
        )}
        {(canRetry || canReimport) ? (
          <Button onClick={() => onRetry?.(importRecord)}>
            {canRetry ? 'Retry Import' : 'Re-import'}
          </Button>
        ) : (
          <Button onClick={() => onImport?.(importRecord)}>
            Import All
          </Button>
        )}
      </div>
    </div>
  );
}
