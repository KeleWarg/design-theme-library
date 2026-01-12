/**
 * @chunk 5.04 - FormatTabs
 * 
 * MCP Server options component
 */

export default function MCPServerOptions() {
  return (
    <div className="format-options">
      <h4>MCP Server</h4>
      <p className="format-options-description">
        Generate a complete Model Context Protocol server with tools for 
        querying tokens and components. Ready to use with Claude Desktop.
      </p>
      <ul className="format-options-list">
        <li>get_token, list_tokens, search_tokens</li>
        <li>get_component, list_components</li>
        <li>TypeScript project with build scripts</li>
      </ul>
    </div>
  );
}




