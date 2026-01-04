/**
 * @chunk 6.04 - Integration Tests
 * 
 * Integration tests for componentService.
 * Tests database operations with mocked Supabase client.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Supabase client
vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    })),
    storage: {
      from: vi.fn(() => ({
        remove: vi.fn().mockResolvedValue({ error: null }),
      })),
    },
  },
}));

import { componentService } from '../../src/services/componentService';
import { supabase } from '../../src/lib/supabase';

describe('Component Service Integration', () => {
  let testComponentId;

  beforeEach(() => {
    vi.clearAllMocks();
    testComponentId = 'test-component-id-123';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getComponents', () => {
    it('returns array without filters', async () => {
      const mockComponents = [
        { id: '1', name: 'Button', slug: 'button', status: 'published', category: 'buttons' },
        { id: '2', name: 'Input', slug: 'input', status: 'draft', category: 'forms' },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockComponents, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await componentService.getComponents();

      expect(supabase.from).toHaveBeenCalledWith('components');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    it('filters by category', async () => {
      const mockComponents = [
        { id: '1', name: 'Button', slug: 'button', category: 'buttons' },
      ];

      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
      };
      
      // Make the chain thenable (Promise-like)
      chain.then = vi.fn((resolve) => resolve({ data: mockComponents, error: null }));
      chain[Symbol.toStringTag] = 'Promise';
      
      supabase.from.mockReturnValue(chain);

      const result = await componentService.getComponents({ category: 'buttons' });

      expect(chain.eq).toHaveBeenCalledWith('category', 'buttons');
      expect(result.length).toBe(1);
      expect(result[0].category).toBe('buttons');
    });

    it('filters by status', async () => {
      const mockComponents = [
        { id: '1', name: 'Button', slug: 'button', status: 'published' },
      ];

      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
      };
      
      // Make the chain thenable (Promise-like)
      chain.then = vi.fn((resolve) => resolve({ data: mockComponents, error: null }));
      chain[Symbol.toStringTag] = 'Promise';
      
      supabase.from.mockReturnValue(chain);

      const result = await componentService.getComponents({ status: 'published' });

      expect(chain.eq).toHaveBeenCalledWith('status', 'published');
      expect(result.length).toBe(1);
      expect(result[0].status).toBe('published');
    });
  });

  describe('createComponent', () => {
    it('creates component with all fields', async () => {
      const newComponent = {
        id: testComponentId,
        name: 'Test Button',
        slug: 'test-button',
        description: 'A test button component',
        category: 'buttons',
        code: 'export default function Button() { return <button>Click</button>; }',
        props: [{ name: 'variant', type: 'string', default: 'primary', required: false }],
        linked_tokens: ['Color/Primary/500', 'Spacing/MD'],
        status: 'draft',
      };

      // First call: slug check (returns null = no conflict)
      const mockSlugCheckChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }), // Not found
      };

      // Second call: insert
      const mockInsertChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: newComponent, error: null }),
      };

      let callCount = 0;
      supabase.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return mockSlugCheckChain; // Slug check
        return mockInsertChain; // Insert
      });

      const result = await componentService.createComponent({
        name: 'Test Button',
        description: 'A test button component',
        category: 'buttons',
        code: 'export default function Button() { return <button>Click</button>; }',
        props: [{ name: 'variant', type: 'string', default: 'primary', required: false }],
        linked_tokens: ['Color/Primary/500', 'Spacing/MD'],
      });

      expect(result.id).toBeDefined();
      expect(result.slug).toBe('test-button');
      expect(result.name).toBe('Test Button');
      expect(result.linked_tokens).toEqual(['Color/Primary/500', 'Spacing/MD']);
    });
  });

  describe('updateComponent', () => {
    it('preserves linked_tokens as paths', async () => {
      const updatedComponent = {
        id: testComponentId,
        name: 'Test Button',
        slug: 'test-button',
        linked_tokens: ['Color/Primary/500', 'Spacing/MD'],
      };

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedComponent, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await componentService.updateComponent(testComponentId, {
        linked_tokens: ['Color/Primary/500', 'Spacing/MD'],
      });

      expect(result.linked_tokens).toEqual(['Color/Primary/500', 'Spacing/MD']);
      expect(Array.isArray(result.linked_tokens)).toBe(true);
      // Ensure paths, not UUIDs
      expect(result.linked_tokens[0]).not.toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
  });

  describe('deleteComponent', () => {
    it('removes component', async () => {
      // Mock getComponent call (used by deleteComponent)
      const mockComponent = {
        id: testComponentId,
        component_images: [],
      };

      const mockGetChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockComponent, error: null }),
      };

      const mockDeleteChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      let callCount = 0;
      supabase.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return mockGetChain;
        return mockDeleteChain;
      });

      const result = await componentService.deleteComponent(testComponentId);

      expect(result).toBe(true);
      expect(mockDeleteChain.delete).toHaveBeenCalled();
      expect(mockDeleteChain.eq).toHaveBeenCalledWith('id', testComponentId);
    });
  });
});

