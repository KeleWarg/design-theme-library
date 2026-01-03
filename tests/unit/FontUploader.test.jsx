/**
 * @chunk 2.23 - FontUploader Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FontUploader, { parseWeightFromFilename, parseStyleFromFilename } from '../../src/components/themes/typography/FontUploader';

// Mock the typefaceService
vi.mock('../../src/services/typefaceService', () => ({
  typefaceService: {
    uploadFontFile: vi.fn(),
    deleteFontFile: vi.fn(),
  }
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

import { typefaceService } from '../../src/services/typefaceService';
import { toast } from 'sonner';

describe('FontUploader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseWeightFromFilename', () => {
    it('parses thin weight', () => {
      expect(parseWeightFromFilename('Inter-Thin.woff2')).toBe(100);
      expect(parseWeightFromFilename('font-hairline.woff')).toBe(100);
    });

    it('parses extralight weight', () => {
      expect(parseWeightFromFilename('Inter-ExtraLight.woff2')).toBe(200);
      expect(parseWeightFromFilename('font-ultralight.woff')).toBe(200);
    });

    it('parses light weight', () => {
      expect(parseWeightFromFilename('Inter-Light.woff2')).toBe(300);
    });

    it('parses regular weight', () => {
      expect(parseWeightFromFilename('Inter-Regular.woff2')).toBe(400);
      expect(parseWeightFromFilename('font-normal.woff')).toBe(400);
    });

    it('parses medium weight', () => {
      expect(parseWeightFromFilename('Inter-Medium.woff2')).toBe(500);
    });

    it('parses semibold weight', () => {
      expect(parseWeightFromFilename('Inter-SemiBold.woff2')).toBe(600);
      expect(parseWeightFromFilename('font-demibold.woff')).toBe(600);
    });

    it('parses bold weight', () => {
      expect(parseWeightFromFilename('Inter-Bold.woff2')).toBe(700);
    });

    it('parses extrabold weight', () => {
      expect(parseWeightFromFilename('Inter-ExtraBold.woff2')).toBe(800);
      expect(parseWeightFromFilename('font-ultrabold.woff')).toBe(800);
    });

    it('parses black weight', () => {
      expect(parseWeightFromFilename('Inter-Black.woff2')).toBe(900);
      expect(parseWeightFromFilename('font-heavy.woff')).toBe(900);
    });

    it('defaults to 400 for unknown weights', () => {
      expect(parseWeightFromFilename('CustomFont.woff2')).toBe(400);
      expect(parseWeightFromFilename('random-name.ttf')).toBe(400);
    });

    it('handles case insensitivity', () => {
      expect(parseWeightFromFilename('INTER-BOLD.woff2')).toBe(700);
      expect(parseWeightFromFilename('inter-bold.woff2')).toBe(700);
      expect(parseWeightFromFilename('Inter-BOLD.woff2')).toBe(700);
    });
  });

  describe('parseStyleFromFilename', () => {
    it('detects italic style', () => {
      expect(parseStyleFromFilename('Inter-Italic.woff2')).toBe('italic');
      expect(parseStyleFromFilename('Inter-BoldItalic.woff2')).toBe('italic');
      expect(parseStyleFromFilename('font-italic.woff')).toBe('italic');
    });

    it('returns normal for non-italic', () => {
      expect(parseStyleFromFilename('Inter-Regular.woff2')).toBe('normal');
      expect(parseStyleFromFilename('Inter-Bold.woff2')).toBe('normal');
      expect(parseStyleFromFilename('CustomFont.ttf')).toBe('normal');
    });

    it('handles case insensitivity', () => {
      expect(parseStyleFromFilename('Inter-ITALIC.woff2')).toBe('italic');
      expect(parseStyleFromFilename('INTER-italic.woff2')).toBe('italic');
    });
  });

  describe('Component Rendering', () => {
    it('renders upload zone', () => {
      render(<FontUploader typefaceId="test-id" />);
      
      expect(screen.getByText(/drop font files here/i)).toBeInTheDocument();
      expect(screen.getByText(/woff2, woff, ttf, otf/i)).toBeInTheDocument();
    });

    it('shows format hint when no files uploaded', () => {
      render(<FontUploader typefaceId="test-id" />);
      
      // Check for the recommendation hint specifically
      expect(screen.getByText(/recommended for best compression/i)).toBeInTheDocument();
    });

    it('renders existing files', () => {
      const existingFiles = [
        { id: '1', format: 'woff2', weight: 400, style: 'normal', file_size: 25000 },
        { id: '2', format: 'woff2', weight: 700, style: 'normal', file_size: 30000 },
      ];

      render(<FontUploader typefaceId="test-id" existingFiles={existingFiles} />);
      
      expect(screen.getByText('Uploaded Files (2)')).toBeInTheDocument();
      expect(screen.getByText('Regular')).toBeInTheDocument();
      expect(screen.getByText('Bold')).toBeInTheDocument();
    });

    it('shows italic in file weight display', () => {
      const existingFiles = [
        { id: '1', format: 'woff2', weight: 400, style: 'italic', file_size: 25000 },
      ];

      render(<FontUploader typefaceId="test-id" existingFiles={existingFiles} />);
      
      expect(screen.getByText('Regular Italic')).toBeInTheDocument();
    });
  });

  describe('File Upload', () => {
    it('accepts valid font formats', async () => {
      typefaceService.uploadFontFile.mockResolvedValue({
        id: 'new-file-id',
        format: 'woff2',
        weight: 700,
        style: 'normal',
        file_size: 25000,
      });

      render(<FontUploader typefaceId="test-id" />);

      const input = document.querySelector('input[type="file"]');
      const file = new File(['font data'], 'Inter-Bold.woff2', { type: 'font/woff2' });
      
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(typefaceService.uploadFontFile).toHaveBeenCalledWith(
          'test-id',
          file,
          700, // Parsed from filename
          'normal' // Not italic
        );
      });
    });

    it('rejects invalid formats', async () => {
      render(<FontUploader typefaceId="test-id" />);

      const input = document.querySelector('input[type="file"]');
      const file = new File(['not a font'], 'document.pdf', { type: 'application/pdf' });
      
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Invalid format')
        );
      });

      expect(typefaceService.uploadFontFile).not.toHaveBeenCalled();
    });

    it('rejects files over 5MB', async () => {
      render(<FontUploader typefaceId="test-id" />);

      const input = document.querySelector('input[type="file"]');
      
      // Create a mock file object with large size
      const largeFile = new File(['x'], 'font.woff2', { type: 'font/woff2' });
      Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 }); // 6MB
      
      fireEvent.change(input, { target: { files: [largeFile] } });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('too large')
        );
      });

      expect(typefaceService.uploadFontFile).not.toHaveBeenCalled();
    });

    it('calls onUploadComplete after successful upload', async () => {
      const onUploadComplete = vi.fn();
      
      typefaceService.uploadFontFile.mockResolvedValue({
        id: 'new-file-id',
        format: 'woff2',
        weight: 400,
        style: 'normal',
        file_size: 25000,
      });

      render(<FontUploader typefaceId="test-id" onUploadComplete={onUploadComplete} />);

      const input = document.querySelector('input[type="file"]');
      const file = new File(['font data'], 'Inter-Regular.woff2', { type: 'font/woff2' });
      
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(onUploadComplete).toHaveBeenCalled();
      });
    });

    it('handles upload errors gracefully', async () => {
      typefaceService.uploadFontFile.mockRejectedValue(new Error('Upload failed'));

      render(<FontUploader typefaceId="test-id" />);

      const input = document.querySelector('input[type="file"]');
      const file = new File(['font data'], 'Inter-Bold.woff2', { type: 'font/woff2' });
      
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Failed to upload')
        );
      });
    });
  });

  describe('File Deletion', () => {
    it('deletes file when delete button clicked', async () => {
      typefaceService.deleteFontFile.mockResolvedValue(true);

      const existingFiles = [
        { id: 'file-1', format: 'woff2', weight: 400, style: 'normal', file_size: 25000 },
      ];

      render(<FontUploader typefaceId="test-id" existingFiles={existingFiles} />);

      const deleteButton = screen.getByTitle('Delete font file');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(typefaceService.deleteFontFile).toHaveBeenCalledWith('file-1');
      });
    });

    it('calls onFileDeleted after successful deletion', async () => {
      const onFileDeleted = vi.fn();
      typefaceService.deleteFontFile.mockResolvedValue(true);

      const existingFiles = [
        { id: 'file-1', format: 'woff2', weight: 400, style: 'normal', file_size: 25000 },
      ];

      render(
        <FontUploader 
          typefaceId="test-id" 
          existingFiles={existingFiles} 
          onFileDeleted={onFileDeleted}
        />
      );

      const deleteButton = screen.getByTitle('Delete font file');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(onFileDeleted).toHaveBeenCalledWith('file-1');
      });
    });

    it('handles deletion errors gracefully', async () => {
      typefaceService.deleteFontFile.mockRejectedValue(new Error('Delete failed'));

      const existingFiles = [
        { id: 'file-1', format: 'woff2', weight: 400, style: 'normal', file_size: 25000 },
      ];

      render(<FontUploader typefaceId="test-id" existingFiles={existingFiles} />);

      const deleteButton = screen.getByTitle('Delete font file');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to delete font file');
      });
    });
  });

  describe('Drag and Drop', () => {
    it('handles drag enter and leave', () => {
      render(<FontUploader typefaceId="test-id" />);
      
      const dropZone = screen.getByText(/drop font files here/i).closest('.font-uploader-zone');
      
      fireEvent.dragEnter(dropZone);
      expect(dropZone).toHaveClass('font-uploader-zone--dragging');
      
      fireEvent.dragLeave(dropZone);
      expect(dropZone).not.toHaveClass('font-uploader-zone--dragging');
    });

    it('handles file drop', async () => {
      typefaceService.uploadFontFile.mockResolvedValue({
        id: 'dropped-file-id',
        format: 'woff2',
        weight: 400,
        style: 'normal',
        file_size: 25000,
      });

      render(<FontUploader typefaceId="test-id" />);
      
      const dropZone = screen.getByText(/drop font files here/i).closest('.font-uploader-zone');
      
      const file = new File(['font data'], 'Inter-Regular.woff2', { type: 'font/woff2' });
      
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        expect(typefaceService.uploadFontFile).toHaveBeenCalled();
      });
    });
  });
});

