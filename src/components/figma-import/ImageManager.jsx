/**
 * @chunk 4.10 - ImageManager
 * 
 * Manage imported images with preview and replace options.
 * Supports selection, replace, delete, restore, download, and toggle between preview/asset images.
 */

import { useState } from 'react';
import { TrashIcon, UploadIcon, CheckIcon, DownloadIcon, ImageIcon } from 'lucide-react';
import Button from '../ui/Button';
import { cn } from '../../lib/utils';
import { storage, BUCKETS } from '../../lib/storage';

export default function ImageManager({ images, onUpdate }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageView, setImageView] = useState('all'); // 'all' | 'preview' | 'assets'
  const [selectedImages, setSelectedImages] = useState(
    new Set(images?.map(img => img.node_id).filter(Boolean) || [])
  );

  if (!images || images.length === 0) {
    return (
      <div className="image-manager-empty">
        <ImageIcon size={32} />
        <p>No images found for this component.</p>
      </div>
    );
  }

  // Filter images based on view mode
  const getDisplayImages = () => {
    if (imageView === 'preview') {
      return images.filter(img => img.node_name?.includes('_preview'));
    }
    if (imageView === 'assets') {
      return images.filter(img => !img.node_name?.includes('_preview'));
    }
    return images;
  };

  const displayImages = getDisplayImages();

  const getImageSrc = (image) => {
    // If replaced with new file, show the new file
    if (image.replaced && image.newFile) {
      return URL.createObjectURL(image.newFile);
    }
    // If we have base64 data directly
    if (image.data) {
      return `data:image/${image.format?.toLowerCase() || 'png'};base64,${image.data}`;
    }
    // If we have a storage path
    if (image.storage_path) {
      return storage.getPublicUrl(BUCKETS.COMPONENT_IMAGES, image.storage_path);
    }
    return null;
  };

  const handleReplace = async (imageId, file) => {
    setUploading(true);
    try {
      const newData = await fileToBase64(file);
      const updatedImages = images.map(img => 
        img.node_id === imageId 
          ? { 
              ...img, 
              data: newData, 
              replaced: true, 
              newFile: file,
              format: file.type.split('/')[1] || img.format
            } 
          : img
      );
      onUpdate(updatedImages);
    } catch (error) {
      console.error('Failed to replace image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (imageId) => {
    const updatedImages = images.filter(img => img.node_id !== imageId);
    onUpdate(updatedImages);
    setSelectedImages(prev => {
      const next = new Set(prev);
      next.delete(imageId);
      return next;
    });
    if (selectedImage === imageId) {
      setSelectedImage(null);
    }
  };

  const handleRestore = (imageId) => {
    const updatedImages = images.map(img =>
      img.node_id === imageId
        ? { ...img, replaced: false, newFile: undefined }
        : img
    );
    onUpdate(updatedImages);
  };

  const handleToggleSelection = (imageId) => {
    setSelectedImages(prev => {
      const next = new Set(prev);
      if (next.has(imageId)) {
        next.delete(imageId);
      } else {
        next.add(imageId);
      }
      return next;
    });
  };

  const handleDownload = async (image) => {
    try {
      const imageSrc = getImageSrc(image);
      if (!imageSrc) return;

      // If it's a data URL, convert to blob
      let blob;
      if (imageSrc.startsWith('data:')) {
        const response = await fetch(imageSrc);
        blob = await response.blob();
      } else {
        // Download from storage
        if (image.storage_path) {
          blob = await storage.download(BUCKETS.COMPONENT_IMAGES, image.storage_path);
        } else {
          return;
        }
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.node_name || `image.${image.format || 'png'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const previewCount = images.filter(img => img.node_name?.includes('_preview')).length;
  const assetCount = images.filter(img => !img.node_name?.includes('_preview')).length;

  return (
    <div className="image-manager">
      <div className="manager-header">
        <p>
          Review and manage images extracted from the Figma component.
          You can replace, remove, or download images before import.
        </p>
        
        <div className="image-view-toggle">
          <button
            className={cn('view-toggle-btn', { active: imageView === 'all' })}
            onClick={() => setImageView('all')}
          >
            All ({images.length})
          </button>
          <button
            className={cn('view-toggle-btn', { active: imageView === 'preview' })}
            onClick={() => setImageView('preview')}
          >
            Preview ({previewCount})
          </button>
          <button
            className={cn('view-toggle-btn', { active: imageView === 'assets' })}
            onClick={() => setImageView('assets')}
          >
            Assets ({assetCount})
          </button>
        </div>
      </div>

      {displayImages.length === 0 ? (
        <div className="image-manager-empty">
          <ImageIcon size={32} />
          <p>No {imageView === 'all' ? '' : imageView} images found.</p>
        </div>
      ) : (
        <div className="images-grid">
          {displayImages.map(image => {
            const imageSrc = getImageSrc(image);
            const isSelected = selectedImages.has(image.node_id);
            const isActive = selectedImage === image.node_id;
            
            return (
              <div 
                key={image.node_id || image.node_name}
                className={cn('image-item', { 
                  selected: isActive,
                  replaced: image.replaced,
                  'not-included': !isSelected
                })}
                onClick={() => setSelectedImage(image.node_id)}
              >
                <div className="image-checkbox">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleToggleSelection(image.node_id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={image.node_name || 'Component image'}
                    loading="lazy"
                  />
                ) : (
                  <div className="image-placeholder">
                    <ImageIcon size={24} />
                    <span>No preview</span>
                  </div>
                )}

                <div className="image-info">
                  <span className="name" title={image.node_name}>
                    {image.node_name || 'Unnamed image'}
                  </span>
                  <span className="size">
                    {image.width && image.height 
                      ? `${image.width}×${image.height}` 
                      : 'Unknown size'}
                    {image.format && ` • ${image.format.toUpperCase()}`}
                  </span>
                </div>

                {image.replaced && (
                  <span className="replaced-badge">
                    <CheckIcon size={12} /> Replaced
                  </span>
                )}

                <div className="image-actions-overlay">
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(image);
                    }}
                    title="Download image"
                  >
                    <DownloadIcon size={14} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedImage && (
        <div className="image-actions">
          <label className="replace-btn">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleReplace(selectedImage, e.target.files[0]);
                }
              }}
              disabled={uploading}
            />
            <UploadIcon size={16} />
            {uploading ? 'Uploading...' : 'Replace'}
          </label>
          
          {images.find(i => i.node_id === selectedImage)?.replaced && (
            <Button 
              variant="ghost" 
              size="small"
              onClick={() => handleRestore(selectedImage)}
            >
              Restore Original
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="small"
            onClick={() => handleDelete(selectedImage)}
          >
            <TrashIcon size={16} /> Remove
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Convert file to base64 string
 */
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      // Remove data URL prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

