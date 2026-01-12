# Test Fixtures

**Chunk:** 4.05 - Plugin Integration Testing

This directory contains sample component data for integration testing.

---

## Files

### `simple-component.json`
A basic component with no variants or complex properties. Used for testing:
- Simple component extraction
- Basic metadata extraction
- Preview image export

### `component-set.json`
A ComponentSet with multiple variants. Used for testing:
- Variant extraction
- Property parsing
- Multiple variant handling

### `component-with-variables.json`
A component using design tokens (bound variables). Used for testing:
- Variable detection
- Collection name extraction
- Variable binding extraction

### `component-with-images.json`
A component containing images and vector icons. Used for testing:
- Image fill export
- Vector icon export (SVG)
- Nested image detection

---

## Usage

These fixtures are used in integration tests to verify:
1. Component extraction accuracy
2. Image export formats
3. API payload structure
4. Error handling

---

## Structure

Each fixture follows the `ExtractedComponent` interface:
- `id`: Unique component identifier
- `name`: Component name
- `description`: Component description
- `type`: 'COMPONENT' or 'COMPONENT_SET'
- `properties`: Component properties array
- `variants`: Variant array (for ComponentSets)
- `boundVariables`: Array of bound design tokens
- `structure`: Simplified node tree structure





