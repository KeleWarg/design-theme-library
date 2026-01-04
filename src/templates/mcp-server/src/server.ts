import { McpServer, StdioServerTransport } from "@modelcontextprotocol/sdk/server/index.js";
import { registerTokenTools } from './tools/tokenTools.js';
import { registerComponentTools } from './tools/componentTools.js';
import designSystem from '../design-system.json' assert { type: 'json' };

const server = new McpServer({
  name: "design-system-mcp",
  version: "1.0.0",
});

// Register tools
registerTokenTools(server, designSystem);
registerComponentTools(server, designSystem);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Design System MCP server running");
}

main().catch(console.error);





