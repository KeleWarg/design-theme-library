# Theme Guide

## Overview

Themes contain design tokens organized by category. Each theme can have multiple tokens that define your visual language.

## Token Categories

### Colors

Define your color palette including:
- Primary, secondary, accent colors
- Background and foreground
- Semantic colors (success, error, warning, info)
- Neutral/gray scale

**Example:**
```css
--color-primary: #3B82F6;
--color-primary-hover: #2563EB;
--color-background: #FFFFFF;
--color-foreground: #1F2937;
--color-success: #10B981;
--color-error: #EF4444;
```

### Typography

Font-related tokens:
- Font sizes (xs through 6xl)
- Font weights (thin through black)
- Line heights
- Letter spacing
- Font families (via typeface roles)

**Example:**
```css
--font-size-xs: 0.75rem;
--font-size-sm: 0.875rem;
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-bold: 700;
--line-height-tight: 1.25;
--line-height-normal: 1.5;
```

### Spacing

Consistent spacing scale:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px

**Example:**
```css
--space-xs: 0.25rem;
--space-sm: 0.5rem;
--space-md: 1rem;
--space-lg: 1.5rem;
--space-xl: 2rem;
```

### Shadows

Elevation and depth:
- sm: Subtle shadow for cards
- md: Medium elevation
- lg: Popovers and dropdowns
- xl: Modals and dialogs

**Example:**
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

### Radius

Border radius values:
- none: 0
- sm: 4px
- md: 8px
- lg: 12px
- xl: 16px
- full: 9999px (pill shape)

**Example:**
```css
--radius-none: 0;
--radius-sm: 0.25rem;
--radius-md: 0.5rem;
--radius-lg: 0.75rem;
--radius-full: 9999px;
```

### Grid

Layout tokens:
- Breakpoints (sm, md, lg, xl, 2xl)
- Container max-widths
- Column counts
- Gutters

**Example:**
```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--container-max-width: 1280px;
--grid-columns: 12;
--grid-gutter: 1rem;
```

## Typography Roles

Each theme can define typeface roles:
- **Primary**: Main body text
- **Heading**: Headlines and titles
- **Mono**: Code and technical content

Fonts can be:
- **Google Fonts**: Loaded from Google Fonts API
- **Custom**: Uploaded font files (.woff2, .woff, .ttf)

### Setting Up Typography Roles

1. Navigate to **Themes** > **[Your Theme]** > **Typography**
2. Click **Add Typeface**
3. Choose **Google Font** or **Custom Font**
4. For Google Fonts: Select font family and weights
5. For Custom Fonts: Upload font files for each weight/style
6. Assign typefaces to roles (Primary, Heading, Mono)
7. Configure fallback font stacks

## Best Practices

### 1. Use Semantic Names

✅ **Good:**
```css
--color-primary
--color-success
--spacing-md
--font-size-body
```

❌ **Bad:**
```css
--color-blue
--color-green
--spacing-16
--font-size-16px
```

### 2. Maintain Consistency

Use the spacing scale consistently:
- Don't mix `16px` and `var(--space-md)` in the same component
- Stick to the defined scale values

### 3. Document Tokens

Add descriptions for clarity:
- **Token Name**: `color-primary`
- **Description**: "Primary brand color used for main actions and highlights"
- **Usage**: "Buttons, links, focus states"

### 4. Test in Context

Use the preview panel to see tokens in action:
- Typography preview shows text styles
- Color preview shows color combinations
- Real-time updates as you edit

### 5. Plan for Dark Mode

Structure token names to support theming:
```css
/* Light mode */
--color-background: #FFFFFF;
--color-foreground: #1F2937;

/* Dark mode (future) */
--color-background: #111827;
--color-foreground: #F9FAFB;
```

## Importing from Figma

### Step 1: Export Figma Variables

1. In Figma, go to **Variables** panel
2. Click **Export** (three dots menu)
3. Choose **Export as JSON**
4. Save the file

### Step 2: Import to Admin Tool

1. Navigate to **Themes** page
2. Click **Create Theme** > **Import from JSON**
3. Upload your Figma Variables JSON
4. Review the detected collections and modes
5. Map collections to token categories
6. Confirm import

### Supported Formats

- **Figma Variables** (DTCG format)
- **Style Dictionary** JSON
- **Flat JSON** (key-value pairs)

## Token Path Structure

Tokens are organized by path:
```
Color/Primary/500 → --color-primary-500
Spacing/Base/Md → --spacing-base-md
Typography/Size/Body → --font-size-body
```

The path determines:
- CSS variable name
- Token category
- Organization in the editor

## Default Theme

One theme can be marked as the default. The default theme:
- Loads automatically on app start
- Is used for component previews
- Can be changed in Settings

## Related Documentation

- [Component Guide](./component-guide.md) - Using tokens in components
- [Export Guide](./export-guide.md) - Exporting tokens to various formats





