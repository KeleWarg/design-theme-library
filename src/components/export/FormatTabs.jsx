/**
 * @chunk 5.04 - FormatTabs
 * 
 * Tab navigation for different export format groups
 */

import { Code, Sparkles, Server, Package } from 'lucide-react';
import { cn } from '../../lib/utils';
import './FormatTabs.css';

const FORMAT_TABS = [
  { 
    id: 'tokens', 
    label: 'Tokens', 
    icon: Code, 
    description: 'CSS, JSON, Tailwind, SCSS' 
  },
  { 
    id: 'ai', 
    label: 'AI Platforms', 
    icon: Sparkles, 
    description: 'LLMS.txt, Cursor, Claude' 
  },
  { 
    id: 'mcp', 
    label: 'MCP Server', 
    icon: Server, 
    description: 'Model Context Protocol server' 
  },
  { 
    id: 'full', 
    label: 'Full Package', 
    icon: Package, 
    description: 'Complete ZIP with everything' 
  },
];

export default function FormatTabs({ activeFormat, onChange }) {
  return (
    <div className="format-tabs">
      {FORMAT_TABS.map(tab => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            className={cn('format-tab', { active: activeFormat === tab.id })}
            onClick={() => onChange(tab.id)}
          >
            <Icon className="tab-icon" size={20} />
            <div className="tab-content">
              <span className="tab-label">{tab.label}</span>
              <span className="tab-description">{tab.description}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

