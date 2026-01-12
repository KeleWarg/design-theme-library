# Chunk 6.04 — Integration Tests

## Purpose
Integration tests for service layer and data flow.

---

## Inputs
- Vitest framework
- Service modules

## Outputs
- Integration test suite

---

## Dependencies
- Phases 1-5 must be complete

---

## Implementation Notes

### Theme Service Tests

```typescript
// tests/integration/themeService.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { themeService } from '../../src/services/themeService';
import { tokenService } from '../../src/services/tokenService';

describe('Theme Service Integration', () => {
  let testThemeId: string;

  afterAll(async () => {
    if (testThemeId) {
      await themeService.deleteTheme(testThemeId);
    }
  });

  it('should create and retrieve theme', async () => {
    const theme = await themeService.createTheme({
      name: 'Integration Test Theme',
      description: 'Created by integration test',
      source: 'manual'
    });

    expect(theme.id).toBeDefined();
    expect(theme.slug).toBe('integration-test-theme');
    testThemeId = theme.id;

    const retrieved = await themeService.getTheme(theme.id);
    expect(retrieved.name).toBe('Integration Test Theme');
  });

  it('should update theme', async () => {
    const updated = await themeService.updateTheme(testThemeId, {
      description: 'Updated description'
    });

    expect(updated.description).toBe('Updated description');
  });

  it('should set default theme', async () => {
    await themeService.setDefaultTheme(testThemeId);
    
    const theme = await themeService.getTheme(testThemeId);
    expect(theme.is_default).toBe(true);
  });

  it('should duplicate theme with tokens', async () => {
    // First add some tokens
    await tokenService.bulkCreateTokens(testThemeId, [
      {
        name: 'Primary',
        path: 'color/primary',
        category: 'color',
        type: 'color',
        value: { hex: '#3B82F6' },
        css_variable: '--color-primary'
      }
    ]);

    const duplicate = await themeService.duplicateTheme(testThemeId, 'Duplicated Theme');
    
    expect(duplicate.name).toBe('Duplicated Theme');
    
    const duplicateTokens = await tokenService.getTokensByTheme(duplicate.id);
    expect(Object.keys(duplicateTokens).length).toBeGreaterThan(0);

    // Clean up
    await themeService.deleteTheme(duplicate.id);
  });

  it('should list all themes', async () => {
    const themes = await themeService.getThemes();
    
    expect(Array.isArray(themes)).toBe(true);
    expect(themes.length).toBeGreaterThan(0);
  });
});
```

### Token Service Tests

```typescript
// tests/integration/tokenService.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { themeService } from '../../src/services/themeService';
import { tokenService } from '../../src/services/tokenService';

describe('Token Service Integration', () => {
  let testThemeId: string;

  beforeAll(async () => {
    const theme = await themeService.createTheme({
      name: 'Token Test Theme',
      source: 'manual'
    });
    testThemeId = theme.id;
  });

  afterAll(async () => {
    await themeService.deleteTheme(testThemeId);
  });

  it('should bulk create tokens', async () => {
    const tokens = await tokenService.bulkCreateTokens(testThemeId, [
      { name: 'Red', path: 'color/red', category: 'color', type: 'color', value: { hex: '#FF0000' }, css_variable: '--color-red' },
      { name: 'Blue', path: 'color/blue', category: 'color', type: 'color', value: { hex: '#0000FF' }, css_variable: '--color-blue' },
      { name: 'Space SM', path: 'spacing/sm', category: 'spacing', type: 'dimension', value: { value: 8, unit: 'px' }, css_variable: '--space-sm' },
    ]);

    expect(tokens.length).toBe(3);
  });

  it('should get tokens grouped by category', async () => {
    const grouped = await tokenService.getTokensByTheme(testThemeId);
    
    expect(grouped.color).toBeDefined();
    expect(grouped.color.length).toBe(2);
    expect(grouped.spacing).toBeDefined();
    expect(grouped.spacing.length).toBe(1);
  });

  it('should search tokens', async () => {
    const results = await tokenService.searchTokens(testThemeId, 'red');
    
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Red');
  });

  it('should update token', async () => {
    const grouped = await tokenService.getTokensByTheme(testThemeId);
    const redToken = grouped.color.find(t => t.name === 'Red');
    
    const updated = await tokenService.updateToken(redToken.id, {
      value: { hex: '#FF5733' }
    });

    expect(updated.value.hex).toBe('#FF5733');
  });

  it('should delete token', async () => {
    const grouped = await tokenService.getTokensByTheme(testThemeId);
    const blueToken = grouped.color.find(t => t.name === 'Blue');
    
    await tokenService.deleteToken(blueToken.id);
    
    const updatedGrouped = await tokenService.getTokensByTheme(testThemeId);
    expect(updatedGrouped.color.length).toBe(1);
  });
});
```

### Component Service Tests

```typescript
// tests/integration/componentService.test.ts
import { describe, it, expect, afterAll } from 'vitest';
import { componentService } from '../../src/services/componentService';

describe('Component Service Integration', () => {
  let testComponentId: string;

  afterAll(async () => {
    if (testComponentId) {
      await componentService.deleteComponent(testComponentId);
    }
  });

  it('should create component', async () => {
    const component = await componentService.createComponent({
      name: 'Test Button',
      description: 'A test button component',
      category: 'buttons',
      code: 'export default function Button() { return <button>Click</button>; }',
      props: [{ name: 'variant', type: 'string', default: 'primary', required: false }],
      linked_tokens: ['color/primary']
    });

    expect(component.id).toBeDefined();
    expect(component.slug).toBe('test-button');
    testComponentId = component.id;
  });

  it('should get component with relations', async () => {
    const component = await componentService.getComponent(testComponentId);
    
    expect(component.name).toBe('Test Button');
    expect(component.props.length).toBe(1);
  });

  it('should add example', async () => {
    const example = await componentService.addExample(testComponentId, {
      title: 'Basic Usage',
      code: '<Button>Hello</Button>',
      description: 'Simple button example'
    });

    expect(example.id).toBeDefined();
    expect(example.title).toBe('Basic Usage');
  });

  it('should update component', async () => {
    const updated = await componentService.updateComponent(testComponentId, {
      description: 'Updated description'
    });

    expect(updated.description).toBe('Updated description');
  });

  it('should filter components by category', async () => {
    const buttons = await componentService.getComponents({ category: 'buttons' });
    
    buttons.forEach(c => {
      expect(c.category).toBe('buttons');
    });
  });

  it('should filter components by status', async () => {
    const published = await componentService.getComponents({ status: 'published' });
    
    published.forEach(c => {
      expect(c.status).toBe('published');
    });
  });
});
```

### Export Integration Tests

```typescript
// tests/integration/export.test.ts
import { describe, it, expect } from 'vitest';
import { themeService } from '../../src/services/themeService';
import { componentService } from '../../src/services/componentService';
import { generateCSS } from '../../src/services/generators/cssGenerator';
import { generateJSON } from '../../src/services/generators/jsonGenerator';
import { generateLLMSTxt } from '../../src/services/generators/llmsTxtGenerator';

describe('Export Integration', () => {
  it('should generate valid CSS', async () => {
    const themes = await themeService.getThemes();
    const theme = await themeService.getTheme(themes[0].id);
    
    const css = generateCSS(theme.tokens || []);
    
    expect(css).toContain(':root');
    expect(css).toContain('--');
    expect(css).toContain(';');
  });

  it('should generate valid JSON', async () => {
    const themes = await themeService.getThemes();
    const theme = await themeService.getTheme(themes[0].id);
    
    const json = generateJSON(theme.tokens || [], { format: 'nested' });
    
    // Should be valid JSON
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('should generate valid LLMS.txt', async () => {
    const themes = await themeService.getThemes();
    const fullThemes = await Promise.all(themes.map(t => themeService.getTheme(t.id)));
    const components = await componentService.getComponents({ status: 'published' });
    
    const llmsTxt = await generateLLMSTxt(fullThemes, components);
    
    expect(llmsTxt).toContain('# ');
    expect(llmsTxt).toContain('## Colors');
    expect(llmsTxt).toContain('## Components');
  });
});
```

---

## Files Created
- `tests/integration/themeService.test.ts` — Theme service tests
- `tests/integration/tokenService.test.ts` — Token service tests
- `tests/integration/componentService.test.ts` — Component service tests
- `tests/integration/export.test.ts` — Export integration tests

---

## Tests

### Verification
- [ ] All integration tests pass
- [ ] Database operations work correctly
- [ ] Export generators produce valid output
- [ ] No test pollution between suites

---

## Time Estimate
4 hours
