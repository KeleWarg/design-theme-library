# Config Reference

## Overview

All tunable values are externalized to config files. This enables adjustment without code changes and documents the provenance of each value.

---

## Config Files

| File | Purpose | Format |
|------|---------|--------|
| `config/theme-defaults.json` | Default values for new themes | JSON |
| `config/parser.json` | Token parser settings | JSON |
| `config/editor.json` | Editor behavior settings | JSON |
| `config/export.json` | Export format options | JSON |
| `config/ai.json` | AI generation settings | JSON |
| `config/mcp.json` | MCP server configuration | JSON |

---

## Theme Defaults

**File:** `config/theme-defaults.json`

| Key | Value | Type | Provenance | Notes |
|-----|-------|------|------------|-------|
| `maxNameLength` | 100 | number | Engineering | Reasonable display length |
| `maxDescriptionLength` | 500 | number | Engineering | Fits in UI card |
| `slugPrefix` | "" | string | Engineering | Clean URLs |
| `defaultStatus` | "draft" | string | Engineering | Safe default |
| `defaultSource` | "manual" | string | Engineering | Default creation type |

### Schema

```json
{
  "maxNameLength": {
    "type": "number",
    "description": "Maximum characters for theme name",
    "default": 100,
    "validRange": "1-255"
  },
  "maxDescriptionLength": {
    "type": "number",
    "description": "Maximum characters for theme description",
    "default": 500,
    "validRange": "1-2000"
  },
  "slugPrefix": {
    "type": "string",
    "description": "Prefix for generated slugs",
    "default": "",
    "validValues": ["", "theme-", "t-"]
  },
  "defaultStatus": {
    "type": "string",
    "description": "Status for newly created themes",
    "default": "draft",
    "validValues": ["draft", "published", "archived"]
  },
  "defaultSource": {
    "type": "string",
    "description": "Source type for manually created themes",
    "default": "manual",
    "validValues": ["manual", "import", "figma"]
  }
}
```

---

## Parser Settings

**File:** `config/parser.json`

| Key | Value | Type | Provenance | Notes |
|-----|-------|------|------------|-------|
| `maxFileSizeMB` | 5 | number | Engineering | UX + performance balance |
| `categoryPatterns.color` | `^color` | regex | Research | Figma naming convention |
| `categoryPatterns.typography` | `^(font\|typography\|type\|text)` | regex | Research | Common prefixes |
| `categoryPatterns.spacing` | `^(spacing\|space\|gap\|margin\|padding)` | regex | Research | Common prefixes |
| `categoryPatterns.shadow` | `^(shadow\|elevation)` | regex | Research | Common prefixes |
| `categoryPatterns.radius` | `^(radius\|corner\|border-radius)` | regex | Research | Common prefixes |
| `categoryPatterns.grid` | `^(grid\|column\|gutter\|breakpoint)` | regex | Research | Common prefixes |
| `defaultCategory` | "other" | string | Engineering | Fallback for unmatched |
| `preserveFigmaIds` | true | boolean | Research | Round-trip compatibility |

### Schema

```json
{
  "maxFileSizeMB": {
    "type": "number",
    "description": "Maximum upload file size in megabytes",
    "default": 5,
    "validRange": "1-50"
  },
  "categoryPatterns": {
    "type": "object",
    "description": "Regex patterns for category detection (case-insensitive)",
    "properties": {
      "color": { "type": "string", "default": "^color" },
      "typography": { "type": "string", "default": "^(font|typography|type|text)" },
      "spacing": { "type": "string", "default": "^(spacing|space|gap|margin|padding)" },
      "shadow": { "type": "string", "default": "^(shadow|elevation)" },
      "radius": { "type": "string", "default": "^(radius|corner|border-radius)" },
      "grid": { "type": "string", "default": "^(grid|column|gutter|breakpoint)" }
    }
  },
  "defaultCategory": {
    "type": "string",
    "description": "Category for tokens that don't match any pattern",
    "default": "other"
  },
  "preserveFigmaIds": {
    "type": "boolean",
    "description": "Preserve Figma variable IDs in metadata",
    "default": true
  }
}
```

---

## Editor Settings

**File:** `config/editor.json`

| Key | Value | Type | Provenance | Notes |
|-----|-------|------|------------|-------|
| `autoSaveIntervalMs` | 0 | number | Engineering | Manual save only |
| `undoHistoryLimit` | 50 | number | Engineering | Memory vs. usability |
| `colorPickerFormats` | ["hex", "rgb", "hsl"] | array | Engineering | Common formats |
| `previewViewports.desktop` | 1440 | number | Research | Common breakpoint |
| `previewViewports.tablet` | 768 | number | Research | Common breakpoint |
| `previewViewports.mobile` | 375 | number | Research | iPhone viewport |
| `monacoTheme` | "vs-dark" | string | Engineering | Dark theme default |
| `monacoLanguage` | "javascript" | string | Engineering | JSX highlighting |

### Schema

```json
{
  "autoSaveIntervalMs": {
    "type": "number",
    "description": "Milliseconds between auto-saves (0 to disable)",
    "default": 0,
    "validRange": "0-300000"
  },
  "undoHistoryLimit": {
    "type": "number",
    "description": "Maximum undo steps to retain",
    "default": 50,
    "validRange": "10-200"
  },
  "colorPickerFormats": {
    "type": "array",
    "description": "Color formats available in picker",
    "default": ["hex", "rgb", "hsl"],
    "validValues": ["hex", "rgb", "hsl", "hsb"]
  },
  "previewViewports": {
    "type": "object",
    "description": "Viewport widths for preview toggle",
    "properties": {
      "desktop": { "type": "number", "default": 1440 },
      "tablet": { "type": "number", "default": 768 },
      "mobile": { "type": "number", "default": 375 }
    }
  },
  "monacoTheme": {
    "type": "string",
    "description": "Monaco editor theme",
    "default": "vs-dark",
    "validValues": ["vs", "vs-dark", "hc-black"]
  },
  "monacoLanguage": {
    "type": "string",
    "description": "Default language for code editor",
    "default": "javascript",
    "validValues": ["javascript", "typescript", "css", "json"]
  }
}
```

---

## Export Settings

**File:** `config/export.json`

| Key | Value | Type | Provenance | Notes |
|-----|-------|------|------------|-------|
| `css.includeReset` | false | boolean | Engineering | Optional CSS reset |
| `css.scopeSelector` | ":root" | string | Engineering | Default scope |
| `css.minify` | false | boolean | Engineering | Readability default |
| `json.prettyPrint` | true | boolean | Engineering | Readability default |
| `json.includeFigmaMetadata` | true | boolean | Research | Round-trip compatibility |
| `json.format` | "nested" | string | Engineering | Default structure |
| `tailwind.version` | "3.x" | string | Research | Current major version |
| `tailwind.prefix` | "" | string | Engineering | No prefix default |
| `scss.useVariables` | true | boolean | Engineering | Variables vs. maps |

### Schema

```json
{
  "css": {
    "type": "object",
    "properties": {
      "includeReset": {
        "type": "boolean",
        "description": "Include CSS reset in export",
        "default": false
      },
      "scopeSelector": {
        "type": "string",
        "description": "CSS selector to scope variables under",
        "default": ":root"
      },
      "minify": {
        "type": "boolean",
        "description": "Minify CSS output",
        "default": false
      }
    }
  },
  "json": {
    "type": "object",
    "properties": {
      "prettyPrint": {
        "type": "boolean",
        "description": "Format JSON with indentation",
        "default": true
      },
      "includeFigmaMetadata": {
        "type": "boolean",
        "description": "Include $extensions with Figma variable IDs",
        "default": true
      },
      "format": {
        "type": "string",
        "description": "JSON structure format",
        "default": "nested",
        "validValues": ["nested", "flat", "style-dictionary"]
      }
    }
  },
  "tailwind": {
    "type": "object",
    "properties": {
      "version": {
        "type": "string",
        "description": "Target Tailwind CSS version",
        "default": "3.x",
        "validValues": ["2.x", "3.x", "4.x"]
      },
      "prefix": {
        "type": "string",
        "description": "Prefix for generated utilities",
        "default": ""
      }
    }
  },
  "scss": {
    "type": "object",
    "properties": {
      "useVariables": {
        "type": "boolean",
        "description": "Use $variables (true) or maps (false)",
        "default": true
      }
    }
  }
}
```

---

## AI Settings

**File:** `config/ai.json`

| Key | Value | Type | Provenance | Notes |
|-----|-------|------|------------|-------|
| `model` | "claude-sonnet-4-20250514" | string | Research | Best quality/speed balance |
| `maxTokens` | 4096 | number | Research | Sufficient for components |
| `temperature` | 0.3 | number | Engineering | Lower = more consistent |
| `maxRetries` | 2 | number | Engineering | Retry on failure |
| `timeoutMs` | 60000 | number | Engineering | 60 second timeout |
| `componentPromptVersion` | "v1" | string | Engineering | Prompt versioning |

### Schema

```json
{
  "model": {
    "type": "string",
    "description": "Claude model identifier",
    "default": "claude-sonnet-4-20250514",
    "validValues": ["claude-sonnet-4-20250514", "claude-opus-4-20250514"]
  },
  "maxTokens": {
    "type": "number",
    "description": "Maximum tokens in response",
    "default": 4096,
    "validRange": "1024-8192"
  },
  "temperature": {
    "type": "number",
    "description": "Response randomness (0-1)",
    "default": 0.3,
    "validRange": "0-1"
  },
  "maxRetries": {
    "type": "number",
    "description": "Retry attempts on failure",
    "default": 2,
    "validRange": "0-5"
  },
  "timeoutMs": {
    "type": "number",
    "description": "Request timeout in milliseconds",
    "default": 60000,
    "validRange": "10000-120000"
  },
  "componentPromptVersion": {
    "type": "string",
    "description": "Version of component generation prompt",
    "default": "v1"
  }
}
```

---

## AI Export Settings

**File:** `config/ai-export.json`

| Key | Value | Type | Provenance | Notes |
|-----|-------|------|------------|-------|
| `llmsTxt.maxSizeKB` | 50 | number | Research | Context window limits |
| `llmsTxt.includeExamples` | true | boolean | Engineering | Better AI understanding |
| `cursorRules.maxSizeKB` | 3 | number | Research | Cursor loading behavior |
| `cursorRules.globs` | ["**/*.jsx", "**/*.tsx"] | array | Engineering | React files default |
| `claudeMd.maxSizeKB` | 3 | number | Research | Project file limits |
| `projectKnowledge.maxSizeKB` | 3 | number | Research | Similar to Claude MD |
| `skill.includeTests` | false | boolean | Engineering | Optional test examples |

### Schema

```json
{
  "llmsTxt": {
    "type": "object",
    "properties": {
      "maxSizeKB": {
        "type": "number",
        "description": "Maximum file size in KB",
        "default": 50
      },
      "includeExamples": {
        "type": "boolean",
        "description": "Include usage examples",
        "default": true
      }
    }
  },
  "cursorRules": {
    "type": "object",
    "properties": {
      "maxSizeKB": {
        "type": "number",
        "description": "Maximum file size in KB",
        "default": 3
      },
      "globs": {
        "type": "array",
        "description": "File patterns to apply rules to",
        "default": ["**/*.jsx", "**/*.tsx"]
      }
    }
  },
  "claudeMd": {
    "type": "object",
    "properties": {
      "maxSizeKB": {
        "type": "number",
        "description": "Maximum file size in KB",
        "default": 3
      }
    }
  },
  "projectKnowledge": {
    "type": "object",
    "properties": {
      "maxSizeKB": {
        "type": "number",
        "description": "Maximum file size in KB",
        "default": 3
      }
    }
  },
  "skill": {
    "type": "object",
    "properties": {
      "includeTests": {
        "type": "boolean",
        "description": "Include test file examples",
        "default": false
      }
    }
  }
}
```

---

## MCP Server Settings

**File:** `config/mcp.json`

| Key | Value | Type | Provenance | Notes |
|-----|-------|------|------------|-------|
| `serverName` | "design-system-mcp" | string | Engineering | Package name |
| `version` | "1.0.0" | string | Engineering | Semver |
| `port` | 3100 | number | Engineering | Default port |
| `tools.getToken` | true | boolean | Engineering | Enable token lookup |
| `tools.listTokens` | true | boolean | Engineering | Enable token listing |
| `tools.searchTokens` | true | boolean | Engineering | Enable token search |
| `tools.getComponent` | true | boolean | Engineering | Enable component lookup |
| `tools.listComponents` | true | boolean | Engineering | Enable component listing |
| `tools.searchComponents` | true | boolean | Engineering | Enable component search |

### Schema

```json
{
  "serverName": {
    "type": "string",
    "description": "MCP server package name",
    "default": "design-system-mcp"
  },
  "version": {
    "type": "string",
    "description": "Server version (semver)",
    "default": "1.0.0"
  },
  "port": {
    "type": "number",
    "description": "Default server port",
    "default": 3100,
    "validRange": "1024-65535"
  },
  "tools": {
    "type": "object",
    "description": "Enable/disable individual MCP tools",
    "properties": {
      "getToken": { "type": "boolean", "default": true },
      "listTokens": { "type": "boolean", "default": true },
      "searchTokens": { "type": "boolean", "default": true },
      "getComponent": { "type": "boolean", "default": true },
      "listComponents": { "type": "boolean", "default": true },
      "searchComponents": { "type": "boolean", "default": true }
    }
  }
}
```

---

## Component Settings

**File:** `config/components.json`

| Key | Value | Type | Provenance | Notes |
|-----|-------|------|------------|-------|
| `maxNameLength` | 100 | number | Engineering | Reasonable length |
| `maxDescriptionLength` | 1000 | number | Engineering | Detailed descriptions |
| `maxCodeLength` | 50000 | number | Engineering | ~50KB code limit |
| `maxExamples` | 10 | number | Engineering | UI limit |
| `categories` | [...] | array | Engineering | Predefined categories |
| `defaultStatus` | "draft" | string | Engineering | Safe default |

### Schema

```json
{
  "maxNameLength": {
    "type": "number",
    "description": "Maximum characters for component name",
    "default": 100
  },
  "maxDescriptionLength": {
    "type": "number",
    "description": "Maximum characters for description",
    "default": 1000
  },
  "maxCodeLength": {
    "type": "number",
    "description": "Maximum characters for component code",
    "default": 50000
  },
  "maxExamples": {
    "type": "number",
    "description": "Maximum examples per component",
    "default": 10
  },
  "categories": {
    "type": "array",
    "description": "Predefined component categories",
    "default": [
      "buttons",
      "inputs",
      "navigation",
      "layout",
      "feedback",
      "data-display",
      "overlays",
      "typography",
      "other"
    ]
  },
  "defaultStatus": {
    "type": "string",
    "description": "Status for new components",
    "default": "draft",
    "validValues": ["draft", "published", "archived"]
  }
}
```

---

## Provenance Legend

- **Research** — Value derived from Figma documentation, industry standards, or analyzed data
- **Engineering** — Value chosen based on engineering judgment, documented rationale
- **Provisional** — Educated guess requiring empirical validation

---

## Calibration Backlog

Values requiring empirical validation:

| Config Key | Current Value | Validation Method | Priority |
|------------|---------------|-------------------|----------|
| `ai.temperature` | 0.3 | Compare output quality at 0.2, 0.3, 0.5 | High |
| `ai.maxTokens` | 4096 | Analyze typical component code length | Medium |
| `llmsTxt.maxSizeKB` | 50 | Test with various AI tools | High |
| `cursorRules.maxSizeKB` | 3 | Test Cursor rule loading | High |
| `maxFileSizeMB` | 5 | Test with real Figma exports | Medium |
| `categoryPatterns.*` | See above | Accuracy test on 100+ tokens | High |

---

## Updating Config Values

When updating a value:

1. Document the reason for change in commit message
2. Update provenance if confidence level changed
3. If changing from Provisional → Research/Engineering, document the evidence
4. Test affected functionality
5. Update this reference document
