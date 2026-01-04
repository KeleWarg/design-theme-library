/**
 * @chunk 4.05 - Plugin Integration Testing
 * 
 * Mock implementations of Figma API for testing
 */

// Mock Figma API types
export interface MockComponentNode {
  id: string;
  name: string;
  type: 'COMPONENT' | 'COMPONENT_SET';
  description?: string;
  documentationLinks?: Array<{ uri: string }>;
  children?: MockSceneNode[];
  width?: number;
  height?: number;
  fills?: readonly Paint[];
  cornerRadius?: number;
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  componentPropertyDefinitions?: ComponentPropertyDefinitions;
  boundVariables?: Map<string, VariableAlias | VariableAlias[]>;
}

export interface MockSceneNode {
  id: string;
  name: string;
  type: string;
  children?: MockSceneNode[];
  width?: number;
  height?: number;
  fills?: readonly Paint[];
  cornerRadius?: number;
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
}

export interface MockVariable {
  id: string;
  name: string;
  key: string;
  variableCollectionId: string;
  resolvedType: 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN';
}

export interface MockVariableCollection {
  id: string;
  name: string;
  modes: Array<{ modeId: string; name: string }>;
  variables: string[];
}

/**
 * Create a mock component node
 */
export function createMockComponent(data: {
  id: string;
  name: string;
  type?: 'COMPONENT' | 'COMPONENT_SET';
  description?: string;
  properties?: Record<string, ComponentPropertyDefinition>;
  children?: MockSceneNode[];
  boundVariables?: Map<string, VariableAlias | VariableAlias[]>;
  width?: number;
  height?: number;
}): MockComponentNode {
  return {
    id: data.id,
    name: data.name,
    type: data.type || 'COMPONENT',
    description: data.description || '',
    children: data.children || [],
    componentPropertyDefinitions: data.properties || {},
    boundVariables: data.boundVariables || new Map(),
    width: data.width || 100,
    height: data.height || 100,
  };
}

/**
 * Create a mock component set with variants
 */
export function createMockComponentSet(data: {
  id: string;
  name: string;
  variants: Array<{
    id: string;
    name: string;
    properties: Record<string, string>;
  }>;
  properties?: Record<string, ComponentPropertyDefinition>;
}): MockComponentNode {
  const variantNodes: MockSceneNode[] = data.variants.map(v => ({
    id: v.id,
    name: v.name,
    type: 'COMPONENT',
    width: 100,
    height: 40,
  }));

  return {
    id: data.id,
    name: data.name,
    type: 'COMPONENT_SET',
    description: '',
    children: variantNodes,
    componentPropertyDefinitions: data.properties || {},
    boundVariables: new Map(),
    width: 100,
    height: 40,
  };
}

/**
 * Create a mock variable
 */
export function createMockVariable(data: {
  id: string;
  name: string;
  collectionId: string;
  type: 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN';
}): MockVariable {
  return {
    id: data.id,
    name: data.name,
    key: `key-${data.id}`,
    variableCollectionId: data.collectionId,
    resolvedType: data.type,
  };
}

/**
 * Create a mock variable alias
 */
export function createMockVariableAlias(variableId: string): VariableAlias {
  return {
    type: 'VARIABLE_ALIAS',
    id: variableId,
  };
}

/**
 * Mock image export data (base64 placeholder)
 */
export function createMockImageData(format: 'PNG' | 'SVG' = 'PNG'): Uint8Array {
  // Return a minimal valid image data
  if (format === 'SVG') {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100"/></svg>';
    return new TextEncoder().encode(svg);
  } else {
    // Minimal PNG header (not a real PNG, but enough for testing)
    return new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  }
}

/**
 * Setup global Figma mock
 */
export function setupFigmaMock(mocks: {
  currentPage?: {
    selection?: MockSceneNode[];
    findAll?: (predicate: (node: MockSceneNode) => boolean) => MockSceneNode[];
  };
  getNodeById?: (id: string) => MockSceneNode | null;
  fileKey?: string;
  root?: { name: string };
  variables?: {
    getLocalVariables?: () => MockVariable[];
    getVariableById?: (id: string) => MockVariable | null;
  };
  variableCollections?: {
    getLocalVariableCollections?: () => MockVariableCollection[];
  };
}): void {
  // Store mocks globally for access in tests
  (global as any).__figmaMocks = mocks;
}

/**
 * Get current Figma mocks
 */
export function getFigmaMocks(): any {
  return (global as any).__figmaMocks || {};
}





