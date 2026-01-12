/**
 * @chunk 4.02 - ComponentExtractor Module
 * 
 * Type definitions for component extraction
 */

export interface ExtractedComponent {
  id: string;
  name: string;
  description: string;
  type: 'COMPONENT' | 'COMPONENT_SET';
  properties: ExtractedProperty[];
  variants: ExtractedVariant[];
  structure: SimplifiedNode;
  boundVariables: BoundVariable[];
}

export interface ExtractedProperty {
  name: string;
  type: 'BOOLEAN' | 'TEXT' | 'INSTANCE_SWAP' | 'VARIANT';
  defaultValue: any;
  options?: string[];
}

export interface ExtractedVariant {
  name: string;
  props: Record<string, string>;
  nodeId: string;
}

export interface SimplifiedNode {
  name: string;
  type: string;
  layoutMode?: string;
  padding?: { top: number; right: number; bottom: number; left: number };
  gap?: number;
  children?: SimplifiedNode[];
}

export interface BoundVariable {
  nodePath: string;
  field: string;
  variableId: string;
  variableName: string;
  collectionName: string;
}





