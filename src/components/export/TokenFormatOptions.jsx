/**
 * @chunk 5.04 - FormatTabs
 * 
 * Token format options component
 */

export default function TokenFormatOptions() {
  return (
    <div className="format-options">
      <h4>Token Formats</h4>
      <ul className="format-options-list">
        <li>
          <strong>CSS</strong> — Custom properties in :root
        </li>
        <li>
          <strong>JSON</strong> — Nested or flat structure
        </li>
        <li>
          <strong>Tailwind</strong> — tailwind.config.js extend
        </li>
        <li>
          <strong>SCSS</strong> — Variables or maps
        </li>
      </ul>
    </div>
  );
}

