/**
 * @chunk 5.04 - FormatTabs
 * 
 * Full package options component
 */

export default function FullPackageOptions() {
  return (
    <div className="format-options">
      <h4>Full Package</h4>
      <p className="format-options-description">
        Download everything in a single ZIP file:
      </p>
      <ul className="format-options-list">
        <li>All token formats (CSS, JSON, Tailwind, SCSS)</li>
        <li>All AI platform files</li>
        <li>MCP server package</li>
        <li>Component code files</li>
        <li>Font files (if custom fonts used)</li>
      </ul>
    </div>
  );
}



