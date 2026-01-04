# Figma Plugin Guide

## Overview

The Design System Admin Figma plugin allows you to export components directly from Figma to the admin tool.

## Installation

### Step 1: Build the Plugin

The plugin source is located in `poc/figma-plugin/`:

```bash
cd poc/figma-plugin
npm install
npm run build
```

### Step 2: Install in Figma

1. Open Figma Desktop app
2. Go to **Plugins** > **Development** > **Import plugin from manifest...**
3. Select `poc/figma-plugin/manifest.json`
4. The plugin will appear in your plugins list

### Step 3: Configure API Endpoint

1. Open the plugin in Figma
2. Enter your admin tool URL (e.g., `http://localhost:5173`)
3. The plugin will save this for future use

## Usage

### Exporting Components

1. **Select Components**: In Figma, select the components you want to export
   - Can select multiple components
   - Can select component sets (variants)
   - Can select instances

2. **Open Plugin**: 
   - Right-click > **Plugins** > **Design System Admin**
   - Or use **Plugins** menu > **Design System Admin**

3. **Review Selection**:
   - Plugin shows selected components
   - Displays component properties
   - Shows variants (if component set)

4. **Export**:
   - Click **Export to Admin Tool**
   - Plugin sends data to admin tool
   - Admin tool receives import request

5. **Import in Admin Tool**:
   - Navigate to **Figma Import** page
   - Review imported components
   - Confirm import

### Component Extraction

The plugin extracts:
- **Component Name**: From Figma component name
- **Properties**: Component props (if defined in Figma)
- **Variants**: All variant combinations
- **Structure**: Component hierarchy
- **Images**: PNG exports of each variant
- **Tokens**: Linked design tokens (if using Figma Variables)

### Image Export

The plugin automatically exports images:
- **Format**: PNG (2x scale for retina)
- **Location**: Stored in Supabase storage
- **Naming**: `{component-id}/{variant-name}.png`

### Token Linking

If your Figma file uses Variables:
- Plugin detects linked tokens
- Maps Figma variables to admin tool tokens
- Preserves token relationships

## Troubleshooting

### Plugin Not Appearing

**Issue**: Plugin doesn't show in Figma plugins list

**Solutions**:
1. Make sure you're using Figma Desktop (not web)
2. Check that `manifest.json` is valid
3. Rebuild plugin: `npm run build`
4. Restart Figma Desktop

### Export Fails

**Issue**: Export button doesn't work or shows error

**Solutions**:
1. Check admin tool is running
2. Verify API endpoint URL is correct
3. Check browser console for errors
4. Ensure admin tool is accessible from your network

### Components Not Importing

**Issue**: Components don't appear in admin tool

**Solutions**:
1. Check **Figma Import** page in admin tool
2. Verify Supabase connection
3. Check browser console for errors
4. Ensure storage bucket is configured

### Images Not Loading

**Issue**: Component images don't display

**Solutions**:
1. Check Supabase storage bucket permissions
2. Verify images were uploaded successfully
3. Check storage bucket name matches config
4. Review browser network tab for failed requests

### Token Mapping Issues

**Issue**: Tokens don't match between Figma and admin tool

**Solutions**:
1. Ensure Figma Variables use same naming convention
2. Check token paths match admin tool structure
3. Review mapping step in import wizard
4. Manually link tokens after import

## Plugin Development

### Project Structure

```
poc/figma-plugin/
├── manifest.json          # Plugin manifest
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── src/
│   ├── code.ts           # Plugin main code
│   ├── ui.tsx            # Plugin UI
│   └── api.ts            # API client
└── dist/                 # Built files
```

### Building

```bash
cd poc/figma-plugin
npm install
npm run build
```

### Development

1. Make changes to `src/` files
2. Run `npm run build`
3. Reload plugin in Figma (Plugins > Development > Reload)

### API Communication

The plugin communicates with the admin tool via:
- **Endpoint**: `/api/figma/import` (Supabase Edge Function)
- **Method**: POST
- **Payload**: Component data + images

## Best Practices

### Component Naming

Use clear, descriptive names:
- ✅ `Button/Primary`
- ✅ `Card/Default`
- ❌ `Component 1`
- ❌ `Copy of Button`

### Variant Organization

Organize variants clearly:
- Use Figma's variant properties
- Name variants descriptively
- Group related variants

### Token Usage

Link to Figma Variables:
- Use Variables for colors, spacing, typography
- Name variables consistently
- Match admin tool token structure

### Image Quality

Export high-quality images:
- Use 2x scale for retina displays
- Ensure components are properly sized
- Check images after import

## Related Documentation

- [Component Guide](./component-guide.md) - Managing imported components
- [Theme Guide](./theme-guide.md) - Understanding design tokens
- [Export Guide](./export-guide.md) - Exporting components

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review plugin console logs
3. Check admin tool browser console
4. Review Supabase logs





