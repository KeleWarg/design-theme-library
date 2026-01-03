/**
 * @chunk 0.02 - Figma Plugin PoC - Component Extraction
 * 
 * Extracts component properties, variants, and bound variables from Figma components.
 * This module validates Figma API capabilities for the design system admin tool.
 */

// ============================================================================
// Types
// ============================================================================

export interface ExtractedProperty {
  name: string;
  type: 'BOOLEAN' | 'TEXT' | 'INSTANCE_SWAP' | 'VARIANT';
  defaultValue?: string | boolean;
  variantOptions?: string[];
  preferredValues?: string[];
}

export interface ExtractedVariant {
  id: string;
  name: string;
  properties: Record<string, string>;
}

export interface BoundVariable {
  nodeId: string;
  nodeName: string;
  property: string;
  variableId: string;
  variableName: string;
  collectionName?: string;
}

export interface SimplifiedNode {
  id: string;
  name: string;
  type: string;
  children?: SimplifiedNode[];
  // Layout properties
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  // Size properties
  width?: number;
  height?: number;
  // Style properties (simplified)
  fills?: string;
  strokes?: string;
  cornerRadius?: number;
}

export interface ExtractedComponent {
  id: string;
  name: string;
  description: string;
  type: 'COMPONENT' | 'COMPONENT_SET';
  documentationLinks?: string[];
  properties: ExtractedProperty[];
  variants?: ExtractedVariant[];
  boundVariables: BoundVariable[];
  structure: SimplifiedNode;
  // Extraction metadata
  extractedAt: string;
  warnings: string[];
}

export interface ExtractionResult {
  success: boolean;
  component?: ExtractedComponent;
  error?: string;
  warnings: string[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a node is a component or component set
 */
function isComponentLike(node: SceneNode): node is ComponentNode | ComponentSetNode {
  return node.type === 'COMPONENT' || node.type === 'COMPONENT_SET';
}

/**
 * Check if a node has layout properties (auto-layout)
 */
function hasLayoutMixin(node: SceneNode): node is SceneNode & FrameMixin {
  return 'layoutMode' in node;
}

/**
 * Safely get fills as a string description
 */
function describeFills(node: SceneNode): string | undefined {
  if (!('fills' in node)) return undefined;
  const fills = node.fills;
  if (!fills || fills === figma.mixed || !Array.isArray(fills)) return undefined;
  
  return fills
    .filter((f): f is SolidPaint | GradientPaint => f.visible !== false)
    .map(f => {
      if (f.type === 'SOLID') {
        const { r, g, b } = f.color;
        const hex = rgbToHex(r, g, b);
        return `solid:${hex}`;
      }
      return f.type.toLowerCase();
    })
    .join(', ') || undefined;
}

/**
 * Convert RGB values (0-1) to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Safely get strokes as a string description
 */
function describeStrokes(node: SceneNode): string | undefined {
  if (!('strokes' in node)) return undefined;
  const strokes = node.strokes;
  if (!strokes || !Array.isArray(strokes) || strokes.length === 0) return undefined;
  
  return strokes
    .filter((s): s is SolidPaint => s.visible !== false && s.type === 'SOLID')
    .map(s => {
      const { r, g, b } = s.color;
      return `solid:${rgbToHex(r, g, b)}`;
    })
    .join(', ') || undefined;
}

/**
 * Get corner radius, handling mixed values
 */
function getCornerRadius(node: SceneNode): number | undefined {
  if (!('cornerRadius' in node)) return undefined;
  const radius = node.cornerRadius;
  if (radius === figma.mixed) return undefined;
  return radius;
}

// ============================================================================
// Structure Extraction
// ============================================================================

/**
 * Simplify a node tree for export
 */
function simplifyNode(node: SceneNode, depth: number = 0, maxDepth: number = 5): SimplifiedNode {
  const simplified: SimplifiedNode = {
    id: node.id,
    name: node.name,
    type: node.type,
  };

  // Add layout properties if available
  if (hasLayoutMixin(node)) {
    if (node.layoutMode !== 'NONE') {
      simplified.layoutMode = node.layoutMode;
      simplified.primaryAxisAlignItems = node.primaryAxisAlignItems;
      simplified.counterAxisAlignItems = node.counterAxisAlignItems;
      simplified.paddingLeft = node.paddingLeft;
      simplified.paddingRight = node.paddingRight;
      simplified.paddingTop = node.paddingTop;
      simplified.paddingBottom = node.paddingBottom;
      simplified.itemSpacing = node.itemSpacing;
    }
  }

  // Add size
  if ('width' in node && 'height' in node) {
    simplified.width = Math.round(node.width);
    simplified.height = Math.round(node.height);
  }

  // Add style info (simplified)
  simplified.fills = describeFills(node);
  simplified.strokes = describeStrokes(node);
  simplified.cornerRadius = getCornerRadius(node);

  // Recursively process children (with depth limit)
  if ('children' in node && depth < maxDepth) {
    simplified.children = node.children.map(child => 
      simplifyNode(child, depth + 1, maxDepth)
    );
  }

  return simplified;
}

// ============================================================================
// Property Extraction
// ============================================================================

/**
 * Extract component property definitions
 */
function extractProperties(node: ComponentNode | ComponentSetNode): ExtractedProperty[] {
  const properties: ExtractedProperty[] = [];

  // componentPropertyDefinitions contains all component properties
  if (node.componentPropertyDefinitions) {
    for (const [name, def] of Object.entries(node.componentPropertyDefinitions)) {
      const prop: ExtractedProperty = {
        name,
        type: def.type as ExtractedProperty['type'],
      };

      // Handle different property types
      switch (def.type) {
        case 'BOOLEAN':
          prop.defaultValue = def.defaultValue as boolean;
          break;
        case 'TEXT':
          prop.defaultValue = def.defaultValue as string;
          break;
        case 'INSTANCE_SWAP':
          prop.defaultValue = def.defaultValue as string;
          if (def.preferredValues) {
            prop.preferredValues = def.preferredValues.map(v => 
              v.type === 'COMPONENT' ? v.key : v.key
            );
          }
          break;
        case 'VARIANT':
          prop.variantOptions = def.variantOptions;
          prop.defaultValue = def.defaultValue as string;
          break;
      }

      properties.push(prop);
    }
  }

  return properties;
}

// ============================================================================
// Variant Extraction
// ============================================================================

/**
 * Extract variant information from a ComponentSetNode
 */
function extractVariants(node: ComponentSetNode): ExtractedVariant[] {
  const variants: ExtractedVariant[] = [];

  for (const child of node.children) {
    if (child.type === 'COMPONENT') {
      // Parse variant properties from the component name
      // Figma uses format: "Property1=Value1, Property2=Value2"
      const properties: Record<string, string> = {};
      
      // The variantProperties getter gives us the parsed properties
      if ('variantProperties' in child && child.variantProperties) {
        Object.assign(properties, child.variantProperties);
      }

      variants.push({
        id: child.id,
        name: child.name,
        properties,
      });
    }
  }

  return variants;
}

// ============================================================================
// Bound Variables Extraction
// ============================================================================

/**
 * Recursively extract bound variables from a node tree
 */
function extractBoundVariables(
  node: SceneNode, 
  variables: Map<string, Variable>,
  warnings: string[]
): BoundVariable[] {
  const boundVars: BoundVariable[] = [];

  // Check if this node has bound variables
  if ('boundVariables' in node && node.boundVariables) {
    for (const [property, binding] of Object.entries(node.boundVariables)) {
      // binding can be a single VariableAlias or an array
      const bindings = Array.isArray(binding) ? binding : [binding];
      
      for (const b of bindings) {
        if (b && 'id' in b) {
          const variable = variables.get(b.id);
          
          boundVars.push({
            nodeId: node.id,
            nodeName: node.name,
            property,
            variableId: b.id,
            variableName: variable?.name ?? 'Unknown',
            collectionName: variable ? getCollectionName(variable, warnings) : undefined,
          });
        }
      }
    }
  }

  // Recursively check children
  if ('children' in node) {
    for (const child of node.children) {
      boundVars.push(...extractBoundVariables(child, variables, warnings));
    }
  }

  return boundVars;
}

/**
 * Get the collection name for a variable
 */
function getCollectionName(variable: Variable, warnings: string[]): string | undefined {
  try {
    const collection = figma.variables.getVariableCollectionById(variable.variableCollectionId);
    return collection?.name;
  } catch (e) {
    warnings.push(`Could not get collection for variable ${variable.name}`);
    return undefined;
  }
}

/**
 * Build a map of all local variables for lookup
 */
async function buildVariableMap(): Promise<Map<string, Variable>> {
  const map = new Map<string, Variable>();
  
  try {
    const collections = figma.variables.getLocalVariableCollections();
    for (const collection of collections) {
      for (const varId of collection.variableIds) {
        const variable = figma.variables.getVariableById(varId);
        if (variable) {
          map.set(variable.id, variable);
        }
      }
    }
  } catch (e) {
    console.warn('Could not load variables:', e);
  }

  return map;
}

// ============================================================================
// Main Extraction Function
// ============================================================================

/**
 * Extract all component information from a selected node
 */
export async function extractComponent(node: SceneNode): Promise<ExtractionResult> {
  const warnings: string[] = [];

  // Validate node type
  if (!isComponentLike(node)) {
    return {
      success: false,
      error: `Node is not a Component or ComponentSet (got ${node.type})`,
      warnings: [],
    };
  }

  try {
    // Build variable map for lookups
    const variableMap = await buildVariableMap();

    // Extract component data
    const component: ExtractedComponent = {
      id: node.id,
      name: node.name,
      description: node.description || '',
      type: node.type as 'COMPONENT' | 'COMPONENT_SET',
      properties: extractProperties(node),
      boundVariables: extractBoundVariables(node, variableMap, warnings),
      structure: simplifyNode(node),
      extractedAt: new Date().toISOString(),
      warnings,
    };

    // Add documentation links if available
    if (node.documentationLinks && node.documentationLinks.length > 0) {
      component.documentationLinks = node.documentationLinks.map(link => link.uri);
    }

    // Extract variants for ComponentSet
    if (node.type === 'COMPONENT_SET') {
      component.variants = extractVariants(node);
      
      if (component.variants.length === 0) {
        warnings.push('ComponentSet has no variant children');
      }
    }

    // Add warnings for potential issues
    if (component.properties.length === 0) {
      warnings.push('No component properties found (may be a simple component)');
    }

    if (component.boundVariables.length === 0) {
      warnings.push('No bound variables found (component may not be using design tokens)');
    }

    return {
      success: true,
      component,
      warnings,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      warnings,
    };
  }
}

/**
 * Extract all components from current selection
 */
export async function extractSelectedComponents(): Promise<ExtractionResult[]> {
  const selection = figma.currentPage.selection;
  const results: ExtractionResult[] = [];

  if (selection.length === 0) {
    return [{
      success: false,
      error: 'No nodes selected. Please select a Component or ComponentSet.',
      warnings: [],
    }];
  }

  for (const node of selection) {
    const result = await extractComponent(node);
    results.push(result);
  }

  return results;
}

/**
 * Get summary statistics about extraction capabilities
 */
export function getExtractionCapabilities(): Record<string, boolean> {
  return {
    canAccessComponents: true,
    canAccessComponentSets: true,
    canReadPropertyDefinitions: true,
    canReadVariantProperties: true,
    canAccessBoundVariables: true,
    canAccessLocalVariables: typeof figma.variables !== 'undefined',
    canAccessDocumentationLinks: true,
    canTraverseNodeTree: true,
    canReadLayoutProperties: true,
    canReadStyleProperties: true,
  };
}

