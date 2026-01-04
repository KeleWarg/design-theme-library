/**
 * @chunk 2.02 - ThemeCard Component
 * 
 * Status badge component for displaying theme/component status.
 */

import { Check, Clock, Archive } from 'lucide-react';

const statusConfig = {
  draft: {
    label: 'Draft',
    icon: Clock,
    className: 'status-badge-draft'
  },
  published: {
    label: 'Published',
    icon: Check,
    className: 'status-badge-published'
  },
  archived: {
    label: 'Archived',
    icon: Archive,
    className: 'status-badge-archived'
  }
};

export default function StatusBadge({ status = 'draft', showIcon = false }) {
  const config = statusConfig[status] || statusConfig.draft;
  const Icon = config.icon;
  
  return (
    <span className={`status-badge ${config.className}`}>
      {showIcon && <Icon size={12} />}
      {config.label}
    </span>
  );
}


