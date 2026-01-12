# Chunk 5.04 — FormatTabs

## Purpose
Tab navigation for different export format groups.

---

## Inputs
- Active format

## Outputs
- Format tab UI

---

## Dependencies
- Chunk 5.01 must be complete

---

## Implementation Notes

```jsx
// src/components/export/FormatTabs.jsx
import { cn } from '../../lib/utils';
import { CodeIcon, SparklesIcon, ServerIcon, PackageIcon } from 'lucide-react';

const FORMAT_TABS = [
  { 
    id: 'tokens', 
    label: 'Tokens', 
    icon: CodeIcon, 
    description: 'CSS, JSON, Tailwind, SCSS' 
  },
  { 
    id: 'ai', 
    label: 'AI Platforms', 
    icon: SparklesIcon, 
    description: 'LLMS.txt, Cursor, Claude' 
  },
  { 
    id: 'mcp', 
    label: 'MCP Server', 
    icon: ServerIcon, 
    description: 'Model Context Protocol server' 
  },
  { 
    id: 'full', 
    label: 'Full Package', 
    icon: PackageIcon, 
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

// Format options components
export function TokenFormatOptions() {
  return (
    <div className="format-options">
      <h4>Token Formats</h4>
      <ul>
        <li><strong>CSS</strong> — Custom properties in :root</li>
        <li><strong>JSON</strong> — Nested or flat structure</li>
        <li><strong>Tailwind</strong> — tailwind.config.js extend</li>
        <li><strong>SCSS</strong> — Variables or maps</li>
      </ul>
    </div>
  );
}

export function AIFormatOptions() {
  return (
    <div className="format-options">
      <h4>AI Platform Formats</h4>
      <ul>
        <li><strong>LLMS.txt</strong> — Comprehensive documentation</li>
        <li><strong>Cursor Rules</strong> — .cursor/rules/design-system.mdc</li>
        <li><strong>Claude Files</strong> — CLAUDE.md + .claude/rules/</li>
        <li><strong>Project Knowledge</strong> — Condensed for Bolt/Lovable</li>
      </ul>
    </div>
  );
}

export function MCPServerOptions() {
  return (
    <div className="format-options">
      <h4>MCP Server</h4>
      <p>
        Generate a complete Model Context Protocol server with tools for 
        querying tokens and components. Ready to use with Claude Desktop.
      </p>
      <ul>
        <li>get_token, list_tokens, search_tokens</li>
        <li>get_component, list_components</li>
        <li>TypeScript project with build scripts</li>
      </ul>
    </div>
  );
}

export function FullPackageOptions() {
  return (
    <div className="format-options">
      <h4>Full Package</h4>
      <p>Download everything in a single ZIP file:</p>
      <ul>
        <li>All token formats (CSS, JSON, Tailwind, SCSS)</li>
        <li>All AI platform files</li>
        <li>MCP server package</li>
        <li>Component code files</li>
        <li>Font files (if custom fonts used)</li>
      </ul>
    </div>
  );
}
```

---

## Files Created
- `src/components/export/FormatTabs.jsx` — Format tab navigation

---

## Tests

### Unit Tests
- [ ] All tabs render
- [ ] Active state works
- [ ] Click changes active
- [ ] Options content shows correctly

---

## Time Estimate
2 hours
