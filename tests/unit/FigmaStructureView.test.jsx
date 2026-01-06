/**
 * @chunk 4.09 - FigmaStructureView
 * 
 * Unit tests for FigmaStructureView component.
 * Tests tree rendering, expand/collapse, type icons, layout indicators, and bound variable highlighting.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FigmaStructureView from '../../src/components/figma-import/FigmaStructureView';

describe('FigmaStructureView', () => {
  const mockStructure = {
    name: 'Button',
    type: 'COMPONENT',
    children: [
      {
        name: 'Label',
        type: 'TEXT',
      },
      {
        name: 'Icon',
        type: 'FRAME',
        children: [
          {
            name: 'IconPath',
            type: 'VECTOR',
          },
        ],
      },
    ],
  };

  const mockStructureWithLayout = {
    name: 'Container',
    type: 'FRAME',
    layoutMode: 'HORIZONTAL',
    gap: 12,
    padding: {
      top: 16,
      right: 16,
      bottom: 16,
      left: 16,
    },
    children: [
      {
        name: 'Item 1',
        type: 'FRAME',
      },
      {
        name: 'Item 2',
        type: 'FRAME',
      },
    ],
  };

  // Note: The component uses path='' for root, 'ChildName' for direct children,
  // and 'Parent/Child' for nested children
  const mockBoundVariables = [
    {
      nodePath: 'Label',  // Direct child of root, path is just 'Label'
      variableName: 'color-primary',
      field: 'fills',
    },
    {
      nodePath: '',  // Root node has empty path
      variableName: 'spacing-md',
      field: 'paddingLeft',
    },
  ];

  describe('Rendering', () => {
    it('renders structure tree', () => {
      render(<FigmaStructureView structure={mockStructure} />);

      expect(screen.getByText('Button')).toBeInTheDocument();
      expect(screen.getByText('Label')).toBeInTheDocument();
      expect(screen.getByText('Icon')).toBeInTheDocument();
    });

    it('shows empty state when structure is null', () => {
      render(<FigmaStructureView structure={null} />);

      expect(screen.getByText('No structure data available for this component.')).toBeInTheDocument();
    });

    it('shows empty state when structure is undefined', () => {
      render(<FigmaStructureView />);

      expect(screen.getByText('No structure data available for this component.')).toBeInTheDocument();
    });

    it('displays node types', () => {
      render(<FigmaStructureView structure={mockStructure} />);

      const nodeTypes = screen.getAllByText(/COMPONENT|TEXT|FRAME|VECTOR/);
      expect(nodeTypes.length).toBeGreaterThan(0);
    });

    it('shows header description', () => {
      render(<FigmaStructureView structure={mockStructure} />);

      expect(screen.getByText(/This shows the Figma layer structure/)).toBeInTheDocument();
    });

    it('shows legend with icon types', () => {
      render(<FigmaStructureView structure={mockStructure} />);

      expect(screen.getByText('Legend')).toBeInTheDocument();
      expect(screen.getByText(/Frame\/Group/)).toBeInTheDocument();
      expect(screen.getByText(/Text/)).toBeInTheDocument();
      expect(screen.getByText(/Rectangle/)).toBeInTheDocument();
    });
  });

  describe('Expand/Collapse', () => {
    it('expands root node by default', () => {
      render(<FigmaStructureView structure={mockStructure} />);

      // Root children should be visible
      expect(screen.getByText('Label')).toBeInTheDocument();
      expect(screen.getByText('Icon')).toBeInTheDocument();
    });

    it('expands node when clicked', () => {
      render(<FigmaStructureView structure={mockStructure} />);

      // Find the Icon node header (child of root)
      const iconNode = screen.getByText('Icon').closest('.node-header');
      expect(iconNode).toBeInTheDocument();

      // IconPath should NOT be visible initially (Icon is not expanded by default)
      expect(screen.queryByText('IconPath')).not.toBeInTheDocument();

      // Click Icon node to expand it
      fireEvent.click(iconNode);

      // IconPath should now be visible
      expect(screen.getByText('IconPath')).toBeInTheDocument();

      // Chevron should have expanded class
      const chevron = iconNode.querySelector('.expand-icon');
      expect(chevron).toHaveClass('expanded');
    });

    it('collapses expanded node when clicked again', () => {
      render(<FigmaStructureView structure={mockStructure} />);

      const iconNode = screen.getByText('Icon').closest('.node-header');

      // Click to expand Icon
      fireEvent.click(iconNode);

      // Verify IconPath is now visible
      expect(screen.getByText('IconPath')).toBeInTheDocument();

      // Click again to collapse
      fireEvent.click(iconNode);

      // IconPath should no longer be visible
      expect(screen.queryByText('IconPath')).not.toBeInTheDocument();
    });

    it('does not toggle nodes without children', () => {
      render(<FigmaStructureView structure={mockStructure} />);

      const labelNode = screen.getByText('Label').closest('.node-header');
      const chevron = labelNode.querySelector('.expand-icon');

      // Nodes without children should not have expand icon
      expect(chevron).not.toBeInTheDocument();
    });
  });

  describe('Layout Indicators', () => {
    it('shows layout mode badge for horizontal layout', () => {
      render(<FigmaStructureView structure={mockStructureWithLayout} />);

      const containerNode = screen.getByText('Container').closest('.node-header');
      const layoutBadge = containerNode.querySelector('.layout-badge');
      
      expect(layoutBadge).toBeInTheDocument();
      expect(layoutBadge).toHaveAttribute('title', 'Auto-layout: HORIZONTAL');
      expect(layoutBadge).toHaveTextContent('→');
    });

    it('shows gap badge when gap is present', () => {
      render(<FigmaStructureView structure={mockStructureWithLayout} />);

      const containerNode = screen.getByText('Container').closest('.node-header');
      const gapBadge = containerNode.querySelector('.gap-badge');
      
      expect(gapBadge).toBeInTheDocument();
      expect(gapBadge).toHaveAttribute('title', 'Gap: 12px');
      expect(gapBadge).toHaveTextContent('gap: 12');
    });

    it('shows padding badge when padding is present', () => {
      render(<FigmaStructureView structure={mockStructureWithLayout} />);

      const containerNode = screen.getByText('Container').closest('.node-header');
      const paddingBadge = containerNode.querySelector('.padding-badge');
      
      expect(paddingBadge).toBeInTheDocument();
      expect(paddingBadge).toHaveAttribute('title', 'Padding: 16px');
    });

    it('does not show layout badges for nodes without layout', () => {
      render(<FigmaStructureView structure={mockStructure} />);

      const labelNode = screen.getByText('Label').closest('.node-header');
      const layoutBadge = labelNode.querySelector('.layout-badge');
      const gapBadge = labelNode.querySelector('.gap-badge');
      
      expect(layoutBadge).not.toBeInTheDocument();
      expect(gapBadge).not.toBeInTheDocument();
    });
  });

  describe('Bound Variables Highlighting', () => {
    it('highlights nodes with bound variables', () => {
      render(
        <FigmaStructureView 
          structure={mockStructure} 
          boundVariables={mockBoundVariables}
        />
      );

      // Note: The nodePath 'Button/Label' should match the Label node
      // We need to check if the node has the has-bound-variables class
      // Since the path matching logic uses nodePath, we'll check for the badge
      const boundVarBadges = screen.queryAllByText(/bound variable/i);
      // Actually, let's check for the badge with the count
      const badges = document.querySelectorAll('.bound-variables-badge');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('shows bound variables count badge', () => {
      const structureWithBoundVar = {
        name: 'Button',
        type: 'COMPONENT',
        children: [
          {
            name: 'Label',
            type: 'TEXT',
          },
        ],
      };

      const boundVars = [
        {
          nodePath: '',  // Root node has empty path
          variableName: 'color-primary',
        },
        {
          nodePath: '',  // Root node has empty path
          variableName: 'spacing-md',
        },
      ];

      render(
        <FigmaStructureView 
          structure={structureWithBoundVar} 
          boundVariables={boundVars}
        />
      );

      // Check for bound variables badge
      const buttonNode = screen.getByText('Button').closest('.node-header');
      expect(buttonNode).toHaveClass('has-bound-variables');
    });

    it('does not highlight nodes without bound variables', () => {
      render(
        <FigmaStructureView 
          structure={mockStructure} 
          boundVariables={[]}
        />
      );

      const buttonNode = screen.getByText('Button').closest('.node-header');
      expect(buttonNode).not.toHaveClass('has-bound-variables');
    });

    it('handles missing boundVariables prop gracefully', () => {
      render(<FigmaStructureView structure={mockStructure} />);

      const buttonNode = screen.getByText('Button').closest('.node-header');
      expect(buttonNode).not.toHaveClass('has-bound-variables');
    });
  });

  describe('Deep Nesting', () => {
    it('limits rendering depth to MAX_RENDER_DEPTH', async () => {
      // Create a deeply nested structure (12 levels deep)
      let deepStructure = { name: 'Level0', type: 'FRAME' };
      let current = deepStructure;
      for (let i = 1; i <= 12; i++) {
        current.children = [{ name: `Level${i}`, type: 'FRAME' }];
        current = current.children[0];
      }

      const { container } = render(<FigmaStructureView structure={deepStructure} />);

      // Progressively expand each level to reach max depth
      // Each click reveals the next level
      for (let i = 0; i <= 10; i++) {
        const nodeHeaders = container.querySelectorAll('.node-header.has-children');
        // Find and click the deepest visible node with children
        for (const header of nodeHeaders) {
          const expandIcon = header.querySelector('.expand-icon:not(.expanded)');
          if (expandIcon) {
            fireEvent.click(header);
          }
        }
      }

      // Should show depth limit message at level 10
      expect(screen.getByText(/max depth reached/i)).toBeInTheDocument();
    });

    it('shows performance warning for large structures', () => {
      // Create a structure with many nodes
      // Total nodes = root + 150 children = 151 nodes
      const largeStructure = {
        name: 'Root',
        type: 'FRAME',
        children: Array.from({ length: 150 }, (_, i) => ({
          name: `Node${i}`,
          type: 'FRAME',
        })),
      };

      render(<FigmaStructureView structure={largeStructure} />);

      expect(screen.getByText(/Large structure/i)).toBeInTheDocument();
      expect(screen.getByText(/151 nodes/)).toBeInTheDocument();
    });
  });

  describe('Type Icons', () => {
    it('renders correct icon for FRAME type', () => {
      const frameStructure = {
        name: 'Frame',
        type: 'FRAME',
      };

      render(<FigmaStructureView structure={frameStructure} />);

      const frameNode = screen.getByText('Frame').closest('.node-header');
      const icon = frameNode.querySelector('.type-icon');
      expect(icon).toBeInTheDocument();
    });

    it('renders correct icon for TEXT type', () => {
      const textStructure = {
        name: 'MyTextNode',
        type: 'TEXT',
      };

      render(<FigmaStructureView structure={textStructure} />);

      const textNode = screen.getByText('MyTextNode').closest('.node-header');
      const icon = textNode.querySelector('.type-icon');
      expect(icon).toBeInTheDocument();
    });

    it('renders correct icon for COMPONENT type', () => {
      render(<FigmaStructureView structure={mockStructure} />);

      const componentNode = screen.getByText('Button').closest('.node-header');
      const icon = componentNode.querySelector('.type-icon');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles nodes without names', () => {
      const structureWithoutName = {
        name: null,
        type: 'FRAME',
      };

      render(<FigmaStructureView structure={structureWithoutName} />);

      expect(screen.getByText('Unnamed')).toBeInTheDocument();
    });

    it('handles missing children array', () => {
      const structureWithoutChildren = {
        name: 'Root',
        type: 'FRAME',
      };

      render(<FigmaStructureView structure={structureWithoutChildren} />);

      expect(screen.getByText('Root')).toBeInTheDocument();
    });

    it('handles empty children array', () => {
      const structureWithEmptyChildren = {
        name: 'Root',
        type: 'FRAME',
        children: [],
      };

      render(<FigmaStructureView structure={structureWithEmptyChildren} />);

      expect(screen.getByText('Root')).toBeInTheDocument();
    });

    it('handles nodes with id property', () => {
      const structureWithId = {
        id: 'node-123',
        name: 'Node',
        type: 'FRAME',
      };

      render(<FigmaStructureView structure={structureWithId} />);

      expect(screen.getByText('Node')).toBeInTheDocument();
    });
  });
});

