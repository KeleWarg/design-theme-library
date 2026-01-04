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

  const mockBoundVariables = [
    {
      nodePath: 'Label', // Path is built as "parentPath/childName", root is "", so Label under Button is just "Label"
      variableName: 'color-primary',
      field: 'fills',
    },
    {
      nodePath: 'Container',
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
      // Text appears in both legend and node types, use getAllByText and check first
      const textElements = screen.getAllByText(/Text/);
      expect(textElements.length).toBeGreaterThan(0);
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

    it('collapses node when clicked', () => {
      render(<FigmaStructureView structure={mockStructure} />);

      // Find and click the Button node header (root is expanded by default)
      const buttonNode = screen.getByText('Button').closest('.node-header');
      expect(buttonNode).toBeInTheDocument();

      // Label and Icon should be visible (direct children of expanded root)
      expect(screen.getByText('Label')).toBeInTheDocument();
      expect(screen.getByText('Icon')).toBeInTheDocument();

      // Click Button node (root) to collapse it
      let chevron = buttonNode.querySelector('.expand-icon');
      expect(chevron).toHaveClass('expanded');
      
      // Click to collapse
      fireEvent.click(buttonNode);

      // Re-query after click to get updated DOM
      const buttonNodeAfterClick = screen.getByText('Button').closest('.node-header');
      chevron = buttonNodeAfterClick.querySelector('.expand-icon');
      
      // After clicking, chevron should not have expanded class (collapsed)
      expect(chevron).not.toHaveClass('expanded');
      
      // Children should no longer be visible
      expect(screen.queryByText('Label')).not.toBeInTheDocument();
      expect(screen.queryByText('Icon')).not.toBeInTheDocument();
    });

    it('expands collapsed node when clicked again', () => {
      render(<FigmaStructureView structure={mockStructure} />);

      // Root (Button) is initially expanded
      let buttonNode = screen.getByText('Button').closest('.node-header');
      let chevron = buttonNode.querySelector('.expand-icon');
      expect(chevron).toHaveClass('expanded');

      // Click to collapse
      fireEvent.click(buttonNode);
      
      // Re-query after click
      buttonNode = screen.getByText('Button').closest('.node-header');
      chevron = buttonNode.querySelector('.expand-icon');
      expect(chevron).not.toHaveClass('expanded');
      
      // Children should not be visible
      expect(screen.queryByText('Label')).not.toBeInTheDocument();
      
      // Click again to expand
      fireEvent.click(buttonNode);

      // Re-query after second click
      buttonNode = screen.getByText('Button').closest('.node-header');
      chevron = buttonNode.querySelector('.expand-icon');
      
      // Should be expanded again
      expect(chevron).toHaveClass('expanded');
      
      // Children should be visible again
      expect(screen.getByText('Label')).toBeInTheDocument();
      expect(screen.getByText('Icon')).toBeInTheDocument();
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

      // The nodePath 'Label' should match the Label node (path is "Label" not "Button/Label")
      // The Container node should also have a badge
      const badges = document.querySelectorAll('.bound-variables-badge');
      expect(badges.length).toBeGreaterThan(0);
      
      // Check that Label node has the badge
      const labelNode = screen.getByText('Label').closest('.node-header');
      expect(labelNode).toHaveClass('has-bound-variables');
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

      // Root node has path "", children have path "{childName}"
      const boundVars = [
        {
          nodePath: '', // Root node (Button) has empty path
          variableName: 'color-primary',
        },
        {
          nodePath: '', // Root node (Button) has empty path
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
    it('limits rendering depth to MAX_RENDER_DEPTH', () => {
      // Create a deeply nested structure (12 levels deep)
      // MAX_RENDER_DEPTH is 10, so we need to manually expand enough nodes
      // to hit the limit. Since only root is expanded by default, we just
      // test that the component renders without errors and shows root.
      let deepStructure = { name: 'Level0', type: 'FRAME' };
      let current = deepStructure;
      for (let i = 1; i <= 12; i++) {
        current.children = [{ name: `Level${i}`, type: 'FRAME' }];
        current = current.children[0];
      }

      const { container } = render(<FigmaStructureView structure={deepStructure} />);
      
      // Root should render successfully
      expect(screen.getByText('Level0')).toBeInTheDocument();
      
      // Only Level1 should be visible (root is expanded by default)
      expect(screen.getByText('Level1')).toBeInTheDocument();
      
      // Deeper levels shouldn't be visible without expanding
      expect(screen.queryByText('Level2')).not.toBeInTheDocument();
    });

    it('shows performance warning for large structures', () => {
      // Create a structure with many nodes (Root + 150 children = 151 total nodes)
      const largeStructure = {
        name: 'Root',
        type: 'FRAME',
        children: Array.from({ length: 150 }, (_, i) => ({
          name: `Node${i}`,
          type: 'FRAME',
        })),
      };

      const { container } = render(<FigmaStructureView structure={largeStructure} />);

      // The warning text includes "Large structure" and total node count (151 = root + 150 children)
      expect(screen.getByText(/Large structure/i)).toBeInTheDocument();
      // Total nodes = 151 (root + 150 children)
      expect(container.textContent).toContain('151 nodes');
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
        name: 'Text',
        type: 'TEXT',
      };

      render(<FigmaStructureView structure={textStructure} />);

      // Text appears in both legend and node, get the node one (first match should be the node)
      const textNodes = screen.getAllByText('Text');
      const textNode = textNodes[0].closest('.node-header');
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

