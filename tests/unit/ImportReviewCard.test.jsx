/**
 * @chunk 4.07 - ImportReviewCard
 * 
 * Unit tests for ImportReviewCard component.
 * Tests preview image display, stats, component type, and button actions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock storage module
vi.mock('../../src/lib/storage', () => ({
  storage: {
    getPublicUrl: vi.fn((bucket, path) => `https://example.com/storage/${bucket}/${path}`),
  },
  BUCKETS: {
    COMPONENT_IMAGES: 'component-images',
  },
}));

import ImportReviewCard from '../../src/components/figma-import/ImportReviewCard';

describe('ImportReviewCard', () => {
  const mockComponent = {
    id: 'comp-1',
    name: 'Primary Button',
    description: 'A primary action button',
    component_type: 'COMPONENT',
    properties: [
      { name: 'variant', type: 'variant' },
      { name: 'size', type: 'variant' },
    ],
    variants: [
      { name: 'default', properties: {} },
      { name: 'hover', properties: {} },
    ],
    bound_variables: [
      { variableId: 'var-1', property: 'fill' },
    ],
  };

  const mockImages = [
    {
      id: 'img-1',
      node_name: 'primary-button_preview',
      storage_path: 'imports/import-1/comp-1/preview.png',
      format: 'png',
      width: 200,
      height: 100,
    },
    {
      id: 'img-2',
      node_name: 'primary-button_default',
      storage_path: 'imports/import-1/comp-1/default.png',
      format: 'png',
    },
  ];

  const mockOnReview = vi.fn();
  const mockOnQuickImport = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('shows component name', () => {
      render(
        <ImportReviewCard
          component={mockComponent}
          images={mockImages}
          onReview={mockOnReview}
          onQuickImport={mockOnQuickImport}
        />
      );

      expect(screen.getByText('Primary Button')).toBeInTheDocument();
    });

    it('shows component description', () => {
      render(
        <ImportReviewCard
          component={mockComponent}
          images={mockImages}
          onReview={mockOnReview}
          onQuickImport={mockOnQuickImport}
        />
      );

      expect(screen.getByText('A primary action button')).toBeInTheDocument();
    });

    it('shows "No description" when description is missing', () => {
      const componentWithoutDesc = { ...mockComponent, description: null };
      render(
        <ImportReviewCard
          component={componentWithoutDesc}
          images={mockImages}
          onReview={mockOnReview}
          onQuickImport={mockOnQuickImport}
        />
      );

      expect(screen.getByText('No description')).toBeInTheDocument();
    });

    it('shows "Unnamed Component" when name is missing', () => {
      const componentWithoutName = { ...mockComponent, name: null };
      render(
        <ImportReviewCard
          component={componentWithoutName}
          images={mockImages}
          onReview={mockOnReview}
          onQuickImport={mockOnQuickImport}
        />
      );

      expect(screen.getByText('Unnamed Component')).toBeInTheDocument();
    });
  });

  describe('Preview Image', () => {
    it('shows preview image when available', () => {
      render(
        <ImportReviewCard
          component={mockComponent}
          images={mockImages}
          onReview={mockOnReview}
          onQuickImport={mockOnQuickImport}
        />
      );

      const img = screen.getByAltText('Primary Button');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute(
        'src',
        'https://example.com/storage/component-images/imports/import-1/comp-1/preview.png'
      );
    });

    it('falls back to first image if no preview image found', () => {
      const imagesWithoutPreview = [
        {
          id: 'img-2',
          node_name: 'primary-button_default',
          storage_path: 'imports/import-1/comp-1/default.png',
        },
      ];

      render(
        <ImportReviewCard
          component={mockComponent}
          images={imagesWithoutPreview}
          onReview={mockOnReview}
          onQuickImport={mockOnQuickImport}
        />
      );

      const img = screen.getByAltText('Primary Button');
      expect(img).toBeInTheDocument();
    });

    it('shows placeholder when no images available', () => {
      render(
        <ImportReviewCard
          component={mockComponent}
          images={[]}
          onReview={mockOnReview}
          onQuickImport={mockOnQuickImport}
        />
      );

      // Check for placeholder (no-preview div should exist, no img element)
      const previewContainer = document.querySelector('.card-preview');
      expect(previewContainer).toBeInTheDocument();
      const noPreview = previewContainer.querySelector('.no-preview');
      expect(noPreview).toBeInTheDocument();
      const img = previewContainer.querySelector('img');
      expect(img).not.toBeInTheDocument();
    });
  });

  describe('Stats Display', () => {
    it('shows property count correctly', () => {
      render(
        <ImportReviewCard
          component={mockComponent}
          images={mockImages}
          onReview={mockOnReview}
          onQuickImport={mockOnQuickImport}
        />
      );

      expect(screen.getByText('2 props')).toBeInTheDocument();
    });

    it('shows singular "prop" for single property', () => {
      const singlePropComponent = {
        ...mockComponent,
        properties: [{ name: 'variant', type: 'variant' }],
      };

      render(
        <ImportReviewCard
          component={singlePropComponent}
          images={mockImages}
          onReview={mockOnReview}
          onQuickImport={mockOnQuickImport}
        />
      );

      expect(screen.getByText('1 prop')).toBeInTheDocument();
    });

    it('shows variant count correctly', () => {
      render(
        <ImportReviewCard
          component={mockComponent}
          images={mockImages}
          onReview={mockOnReview}
          onQuickImport={mockOnQuickImport}
        />
      );

      expect(screen.getByText('2 variants')).toBeInTheDocument();
    });

    it('shows image count correctly', () => {
      render(
        <ImportReviewCard
          component={mockComponent}
          images={mockImages}
          onReview={mockOnReview}
          onQuickImport={mockOnQuickImport}
        />
      );

      expect(screen.getByText('2 images')).toBeInTheDocument();
    });

    it('shows bound variables count correctly', () => {
      render(
        <ImportReviewCard
          component={mockComponent}
          images={mockImages}
          onReview={mockOnReview}
          onQuickImport={mockOnQuickImport}
        />
      );

      expect(screen.getByText('1 token')).toBeInTheDocument();
    });

    it('handles missing arrays gracefully', () => {
      const componentWithoutArrays = {
        ...mockComponent,
        properties: null,
        variants: null,
        bound_variables: null,
      };

      render(
        <ImportReviewCard
          component={componentWithoutArrays}
          images={[]}
          onReview={mockOnReview}
          onQuickImport={mockOnQuickImport}
        />
      );

      expect(screen.getByText('0 props')).toBeInTheDocument();
      expect(screen.getByText('0 variants')).toBeInTheDocument();
      expect(screen.getByText('0 images')).toBeInTheDocument();
      expect(screen.getByText('0 tokens')).toBeInTheDocument();
    });
  });

  describe('Component Type', () => {
    it('shows "Component" for COMPONENT type', () => {
      render(
        <ImportReviewCard
          component={mockComponent}
          images={mockImages}
          onReview={mockOnReview}
          onQuickImport={mockOnQuickImport}
        />
      );

      expect(screen.getByText('Component')).toBeInTheDocument();
    });

    it('shows "Component Set" for COMPONENT_SET type', () => {
      const componentSet = {
        ...mockComponent,
        component_type: 'COMPONENT_SET',
      };

      render(
        <ImportReviewCard
          component={componentSet}
          images={mockImages}
          onReview={mockOnReview}
          onQuickImport={mockOnQuickImport}
        />
      );

      expect(screen.getByText('Component Set')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('calls onReview when Review button is clicked', () => {
      render(
        <ImportReviewCard
          component={mockComponent}
          images={mockImages}
          onReview={mockOnReview}
          onQuickImport={mockOnQuickImport}
        />
      );

      const reviewButton = screen.getByText('Review');
      fireEvent.click(reviewButton);

      expect(mockOnReview).toHaveBeenCalledTimes(1);
      expect(mockOnReview).toHaveBeenCalledWith(mockComponent);
    });

    it('calls onQuickImport when Import button is clicked', () => {
      render(
        <ImportReviewCard
          component={mockComponent}
          images={mockImages}
          onReview={mockOnReview}
          onQuickImport={mockOnQuickImport}
        />
      );

      const importButton = screen.getByText('Import');
      fireEvent.click(importButton);

      expect(mockOnQuickImport).toHaveBeenCalledTimes(1);
      expect(mockOnQuickImport).toHaveBeenCalledWith(mockComponent);
    });

    it('handles missing callbacks gracefully', () => {
      render(
        <ImportReviewCard
          component={mockComponent}
          images={mockImages}
        />
      );

      const reviewButton = screen.getByText('Review');
      const importButton = screen.getByText('Import');

      // Should not throw error
      expect(() => fireEvent.click(reviewButton)).not.toThrow();
      expect(() => fireEvent.click(importButton)).not.toThrow();
    });
  });
});

