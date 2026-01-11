/**
 * @chunk 5.04 - FormatTabs
 * 
 * AI platform format options component
 */

export default function AIFormatOptions() {
  return (
    <div className="format-options">
      <h4>AI Platform Formats</h4>
      <ul className="format-options-list">
        <li>
          <strong>LLMS.txt</strong> — Comprehensive documentation
        </li>
        <li>
          <strong>Cursor Rules</strong> — .cursor/rules/design-system.mdc
        </li>
        <li>
          <strong>Claude Files</strong> — CLAUDE.md + .claude/rules/
        </li>
        <li>
          <strong>Project Knowledge</strong> — Condensed for Bolt/Lovable
        </li>
      </ul>
    </div>
  );
}




