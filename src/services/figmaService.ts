// src/services/figmaService.ts

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  absoluteBoundingBox?: { x: number; y: number; width: number; height: number };
  fills?: Array<{ type: string; color?: { r: number; g: number; b: number; a: number } }>;
  children?: FigmaNode[];
}

export class FigmaService {
  private token: string;
  private baseUrl = 'https://api.figma.com/v1';

  constructor(token: string) {
    this.token = token;
  }

  private async fetch(path: string) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { 'X-Figma-Token': this.token },
    });
    if (!res.ok) throw new Error(`Figma API error: ${res.status}`);
    return res.json();
  }

  async getNodeWithImage(fileKey: string, nodeId: string) {
    // Get node data
    const nodesData = await this.fetch(`/files/${fileKey}/nodes?ids=${nodeId}`);
    const node = nodesData.nodes[nodeId]?.document;
    if (!node) throw new Error('Node not found');

    // Get rendered image
    const imagesData = await this.fetch(`/images/${fileKey}?ids=${nodeId}&format=png&scale=2`);
    const imageUrl = imagesData.images[nodeId];

    const frameOrigin = node.absoluteBoundingBox
      ? { x: node.absoluteBoundingBox.x, y: node.absoluteBoundingBox.y }
      : { x: 0, y: 0 };

    return { node, imageUrl, frameOrigin };
  }

  extractColorsFromNode(node: FigmaNode, frameOrigin: { x: number; y: number }) {
    const colors: Array<{
      hex: string;
      bounds: { x: number; y: number; width: number; height: number };
    }> = [];

    const traverse = (n: FigmaNode) => {
      if (n.fills && n.absoluteBoundingBox) {
        for (const fill of n.fills) {
          if (fill.type === 'SOLID' && fill.color) {
            const { r, g, b } = fill.color;
            const hex = `#${Math.round(r * 255).toString(16).padStart(2, '0')}${Math.round(g * 255).toString(16).padStart(2, '0')}${Math.round(b * 255).toString(16).padStart(2, '0')}`;

            colors.push({
              hex,
              bounds: {
                x: n.absoluteBoundingBox.x - frameOrigin.x,
                y: n.absoluteBoundingBox.y - frameOrigin.y,
                width: n.absoluteBoundingBox.width,
                height: n.absoluteBoundingBox.height,
              },
            });
          }
        }
      }
      n.children?.forEach(traverse);
    };

    traverse(node);
    return colors;
  }
}
