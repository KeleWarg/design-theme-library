/**
 * @chunk 1.10 - Component Service Tests
 * 
 * Unit tests for componentService module.
 * Uses mocked Supabase client.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client
vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        remove: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/image.png' } }),
      })),
    },
  },
}));

import { componentService } from '../../src/services/componentService';
import { supabase } from '../../src/lib/supabase';

describe('componentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // Component CRUD Tests
  // ==========================================

  describe('getComponents', () => {
    it('returns array of components without filters', async () => {
      const mockComponents = [
        { id: '1', name: 'Button', slug: 'button', status: 'published' },
        { id: '2', name: 'Input', slug: 'input', status: 'draft' },
      ];

      // Create a chainable mock where order() is the terminal method (returns Promise)
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockComponents, error: null })),
      };
      // Make it thenable (Promise-like)
      mockChain[Symbol.toStringTag] = 'Promise';
      supabase.from.mockReturnValue(mockChain);

      const result = await componentService.getComponents();

      expect(supabase.from).toHaveBeenCalledWith('components');
      expect(result).toHaveLength(2);
    });

    it('filters by status', async () => {
      const mockComponents = [
        { id: '1', name: 'Button', slug: 'button', status: 'published' },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockComponents, error: null })),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await componentService.getComponents({ status: 'published' });

      expect(mockChain.eq).toHaveBeenCalledWith('status', 'published');
      expect(result).toHaveLength(1);
    });

    it('filters by category', async () => {
      const mockComponents = [
        { id: '1', name: 'Button', slug: 'button', category: 'buttons' },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockComponents, error: null })),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await componentService.getComponents({ category: 'buttons' });

      expect(mockChain.eq).toHaveBeenCalledWith('category', 'buttons');
      expect(result).toHaveLength(1);
    });

    it('filters by search term', async () => {
      const mockComponents = [
        { id: '1', name: 'Button', slug: 'button' },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockComponents, error: null })),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await componentService.getComponents({ search: 'button' });

      expect(mockChain.ilike).toHaveBeenCalledWith('name', '%button%');
      expect(result).toHaveLength(1);
    });

    it('throws error on failure', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: null, error: new Error('DB Error') })),
      };
      supabase.from.mockReturnValue(mockChain);

      await expect(componentService.getComponents()).rejects.toThrow('DB Error');
    });
  });

  describe('getPublishedComponents', () => {
    it('returns only published components', async () => {
      const mockComponents = [
        { id: '1', name: 'Button', status: 'published' },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockComponents, error: null })),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await componentService.getPublishedComponents();

      expect(mockChain.eq).toHaveBeenCalledWith('status', 'published');
      expect(result[0].status).toBe('published');
    });
  });

  describe('getComponent', () => {
    it('returns component with images and examples', async () => {
      const mockComponent = {
        id: '1',
        name: 'Button',
        slug: 'button',
        component_images: [{ id: 'img1', name: 'default' }],
        component_examples: [
          { id: 'ex1', title: 'Basic', sort_order: 0 },
          { id: 'ex2', title: 'Advanced', sort_order: 1 },
        ],
      };

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockComponent, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await componentService.getComponent('1');

      expect(supabase.from).toHaveBeenCalledWith('components');
      expect(result.component_images).toHaveLength(1);
      expect(result.component_examples).toHaveLength(2);
    });

    it('sorts examples by sort_order', async () => {
      const mockComponent = {
        id: '1',
        name: 'Button',
        component_examples: [
          { id: 'ex2', title: 'Advanced', sort_order: 2 },
          { id: 'ex1', title: 'Basic', sort_order: 1 },
        ],
      };

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockComponent, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await componentService.getComponent('1');

      expect(result.component_examples[0].title).toBe('Basic');
      expect(result.component_examples[1].title).toBe('Advanced');
    });
  });

  describe('getComponentBySlug', () => {
    it('returns component by slug', async () => {
      const mockComponent = { id: '1', name: 'Button', slug: 'button' };

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockComponent, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await componentService.getComponentBySlug('button');

      expect(mockChain.eq).toHaveBeenCalledWith('slug', 'button');
      expect(result.slug).toBe('button');
    });
  });

  describe('createComponent', () => {
    it('creates component with generated slug', async () => {
      const mockComponent = { id: '1', name: 'My Button', slug: 'my-button', status: 'draft' };

      // Mock chain for slug check (returns no existing component)
      const slugCheckChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      // Mock chain for insert
      const insertChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockComponent, error: null }),
      };

      supabase.from
        .mockReturnValueOnce(slugCheckChain) // First call: slug check
        .mockReturnValueOnce(insertChain); // Second call: insert

      const result = await componentService.createComponent({
        name: 'My Button',
        description: 'A button component',
      });

      expect(insertChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'My Button',
          slug: 'my-button',
          status: 'draft',
        })
      );
      expect(result.slug).toBe('my-button');
    });

    it('generates correct slug from name with special characters', async () => {
      const mockComponent = { id: '1', name: 'Button @2024!', slug: 'button-2024' };

      // Mock chain for slug check (returns no existing component)
      const slugCheckChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      // Mock chain for insert
      const insertChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockComponent, error: null }),
      };

      supabase.from
        .mockReturnValueOnce(slugCheckChain) // First call: slug check
        .mockReturnValueOnce(insertChain); // Second call: insert

      await componentService.createComponent({ name: 'Button @2024!' });

      expect(insertChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'button-2024',
        })
      );
    });
  });

  describe('updateComponent', () => {
    it('updates component and returns result', async () => {
      const mockComponent = { id: '1', name: 'Updated Button', slug: 'updated-button' };

      // Mock chain for slug check (returns no existing component)
      const slugCheckChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      // Mock chain for update
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockComponent, error: null }),
      };

      supabase.from
        .mockReturnValueOnce(slugCheckChain) // First call: slug check
        .mockReturnValueOnce(updateChain); // Second call: update

      const result = await componentService.updateComponent('1', { name: 'Updated Button' });

      expect(updateChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Button',
          slug: 'updated-button',
        })
      );
      expect(result.name).toBe('Updated Button');
    });

    it('updates without changing slug if name not provided', async () => {
      const mockComponent = { id: '1', description: 'New description' };

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockComponent, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      await componentService.updateComponent('1', { description: 'New description' });

      expect(mockChain.update).toHaveBeenCalledWith({ description: 'New description' });
    });
  });

  describe('deleteComponent', () => {
    it('deletes component and removes storage files', async () => {
      const mockComponent = {
        id: '1',
        name: 'Button',
        component_images: [{ storage_path: '1/default.png' }],
        component_examples: [],
      };

      // Mock getComponent
      const getChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockComponent, error: null }),
      };

      // Mock delete
      const deleteChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      supabase.from
        .mockReturnValueOnce(getChain)
        .mockReturnValueOnce(deleteChain);

      const result = await componentService.deleteComponent('1');

      expect(supabase.storage.from).toHaveBeenCalledWith('component-images');
      expect(result).toBe(true);
    });
  });

  describe('updateComponentStatus', () => {
    it('updates component status', async () => {
      const mockComponent = { id: '1', status: 'published' };

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockComponent, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await componentService.updateComponentStatus('1', 'published');

      expect(mockChain.update).toHaveBeenCalledWith({ status: 'published' });
      expect(result.status).toBe('published');
    });
  });

  describe('publishComponent', () => {
    it('sets status to published', async () => {
      const mockComponent = { id: '1', status: 'published' };

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockComponent, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await componentService.publishComponent('1');

      expect(mockChain.update).toHaveBeenCalledWith({ status: 'published' });
      expect(result.status).toBe('published');
    });
  });

  describe('archiveComponent', () => {
    it('sets status to archived', async () => {
      const mockComponent = { id: '1', status: 'archived' };

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockComponent, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await componentService.archiveComponent('1');

      expect(mockChain.update).toHaveBeenCalledWith({ status: 'archived' });
      expect(result.status).toBe('archived');
    });
  });

  // ==========================================
  // Token Linking Tests
  // ==========================================

  describe('linkTokens', () => {
    it('links token IDs to component', async () => {
      const mockComponent = { id: '1', linked_tokens: ['token1', 'token2'] };

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockComponent, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await componentService.linkTokens('1', ['token1', 'token2']);

      expect(mockChain.update).toHaveBeenCalledWith({ linked_tokens: ['token1', 'token2'] });
      expect(result.linked_tokens).toEqual(['token1', 'token2']);
    });
  });

  describe('addLinkedTokens', () => {
    it('adds new tokens to existing linked tokens', async () => {
      const mockComponent = { 
        id: '1', 
        linked_tokens: ['token1'],
        component_images: [],
        component_examples: [],
      };
      const updatedComponent = { id: '1', linked_tokens: ['token1', 'token2'] };

      // Mock getComponent
      const getChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockComponent, error: null }),
      };

      // Mock updateComponent
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedComponent, error: null }),
      };

      supabase.from
        .mockReturnValueOnce(getChain)
        .mockReturnValueOnce(updateChain);

      const result = await componentService.addLinkedTokens('1', ['token2']);

      expect(result.linked_tokens).toContain('token1');
      expect(result.linked_tokens).toContain('token2');
    });

    it('does not duplicate existing tokens', async () => {
      const mockComponent = { 
        id: '1', 
        linked_tokens: ['token1'],
        component_images: [],
        component_examples: [],
      };
      const updatedComponent = { id: '1', linked_tokens: ['token1'] };

      const getChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockComponent, error: null }),
      };

      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedComponent, error: null }),
      };

      supabase.from
        .mockReturnValueOnce(getChain)
        .mockReturnValueOnce(updateChain);

      await componentService.addLinkedTokens('1', ['token1']);

      expect(updateChain.update).toHaveBeenCalledWith({ linked_tokens: ['token1'] });
    });
  });

  // ==========================================
  // Examples Tests
  // ==========================================

  describe('addExample', () => {
    it('creates example with auto sort_order', async () => {
      const mockExample = { id: 'ex1', title: 'Basic Usage', code: '<Button />', sort_order: 0 };

      // Mock getting existing examples count
      const selectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      // Mock insert
      const insertChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockExample, error: null }),
      };

      supabase.from
        .mockReturnValueOnce(selectChain)
        .mockReturnValueOnce(insertChain);

      const result = await componentService.addExample('comp1', {
        title: 'Basic Usage',
        code: '<Button />',
      });

      expect(insertChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          component_id: 'comp1',
          title: 'Basic Usage',
          code: '<Button />',
          sort_order: 0,
        })
      );
      expect(result.title).toBe('Basic Usage');
    });
  });

  describe('updateExample', () => {
    it('updates example and returns result', async () => {
      const mockExample = { id: 'ex1', title: 'Updated Title' };

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockExample, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await componentService.updateExample('ex1', { title: 'Updated Title' });

      expect(mockChain.update).toHaveBeenCalledWith({ title: 'Updated Title' });
      expect(result.title).toBe('Updated Title');
    });
  });

  describe('deleteExample', () => {
    it('deletes example and returns true', async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await componentService.deleteExample('ex1');

      expect(supabase.from).toHaveBeenCalledWith('component_examples');
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'ex1');
      expect(result).toBe(true);
    });
  });

  // ==========================================
  // Images Tests
  // ==========================================

  describe('uploadImage', () => {
    it('uploads image and creates record', async () => {
      const mockFile = new File(['image data'], 'test.png', { type: 'image/png' });
      Object.defineProperty(mockFile, 'size', { value: 1024 });
      
      const mockImage = { 
        id: 'img1', 
        component_id: 'comp1',
        name: 'default',
        storage_path: expect.any(String),
        format: 'png',
        file_size: 1024
      };

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockImage, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await componentService.uploadImage('comp1', mockFile, 'default');

      expect(supabase.storage.from).toHaveBeenCalledWith('component-images');
      expect(mockChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          component_id: 'comp1',
          name: 'default',
          format: 'png',
          file_size: 1024,
        })
      );
      expect(result.name).toBe('default');
    });
  });

  describe('deleteImage', () => {
    it('removes from storage and deletes record', async () => {
      const mockImage = { storage_path: 'comp1/default.png' };

      // Mock get image
      const getChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockImage, error: null }),
      };

      // Mock delete
      const deleteChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      supabase.from
        .mockReturnValueOnce(getChain)
        .mockReturnValueOnce(deleteChain);

      const result = await componentService.deleteImage('img1');

      expect(supabase.storage.from).toHaveBeenCalledWith('component-images');
      expect(result).toBe(true);
    });
  });

  describe('getImageUrl', () => {
    it('returns public URL for image', () => {
      const result = componentService.getImageUrl('comp1/default.png');

      expect(supabase.storage.from).toHaveBeenCalledWith('component-images');
      expect(result).toBe('https://example.com/image.png');
    });
  });

  // ==========================================
  // Bulk Operations Tests
  // ==========================================

  describe('getComponentCountsByStatus', () => {
    it('returns counts grouped by status', async () => {
      const mockData = [
        { status: 'draft' },
        { status: 'draft' },
        { status: 'published' },
        { status: 'archived' },
      ];

      const mockChain = {
        select: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await componentService.getComponentCountsByStatus();

      expect(result).toEqual({
        draft: 2,
        published: 1,
        archived: 1,
      });
    });
  });

  describe('getComponentCountsByCategory', () => {
    it('returns counts grouped by category', async () => {
      const mockData = [
        { category: 'buttons' },
        { category: 'buttons' },
        { category: 'forms' },
        { category: null },
      ];

      const mockChain = {
        select: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await componentService.getComponentCountsByCategory();

      expect(result).toEqual({
        buttons: 2,
        forms: 1,
        uncategorized: 1,
      });
    });
  });

  describe('bulkUpdateStatus', () => {
    it('updates status for multiple components', async () => {
      const mockComponents = [
        { id: '1', status: 'published' },
        { id: '2', status: 'published' },
      ];

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: mockComponents, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await componentService.bulkUpdateStatus(['1', '2'], 'published');

      expect(mockChain.update).toHaveBeenCalledWith({ status: 'published' });
      expect(mockChain.in).toHaveBeenCalledWith('id', ['1', '2']);
      expect(result).toHaveLength(2);
    });
  });

  describe('bulkDelete', () => {
    it('deletes multiple components and their images', async () => {
      const mockImages = [
        { storage_path: '1/default.png' },
        { storage_path: '2/default.png' },
      ];

      // Mock get images
      const getImagesChain = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockImages, error: null }),
      };

      // Mock delete
      const deleteChain = {
        delete: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ error: null }),
      };

      supabase.from
        .mockReturnValueOnce(getImagesChain)
        .mockReturnValueOnce(deleteChain);

      const result = await componentService.bulkDelete(['1', '2']);

      expect(supabase.storage.from).toHaveBeenCalledWith('component-images');
      expect(result).toBe(true);
    });
  });
});

