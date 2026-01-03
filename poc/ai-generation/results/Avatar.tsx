import React from 'react';

interface AvatarProps {
  /** The source URL for the avatar image */
  src?: string;
  /** Alternative text for the avatar image */
  alt?: string;
  /** The name to generate initials from when no image is provided */
  name?: string;
  /** The size of the avatar */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Optional status indicator */
  status?: 'online' | 'offline' | 'away' | 'busy';
  /** Additional CSS class name */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name = '',
  size = 'md',
  status,
  className = '',
  onClick
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const sizeMap = {
    xs: { size: 'var(--space-6)', fontSize: 'var(--font-size-xs)' },
    sm: { size: 'var(--space-8)', fontSize: 'var(--font-size-sm)' },
    md: { size: 'var(--space-10)', fontSize: 'var(--font-size-base)' },
    lg: { size: 'var(--space-12)', fontSize: 'var(--font-size-lg)' },
    xl: { size: 'var(--space-16)', fontSize: 'var(--font-size-xl)' }
  };

  const statusColors = {
    online: 'var(--color-success)',
    offline: 'var(--color-neutral-400)',
    away: 'var(--color-warning)',
    busy: 'var(--color-error)'
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const shouldShowImage = src && !imageError;
  const initials = getInitials(name);

  const avatarStyle: React.CSSProperties = {
    width: sizeMap[size].size,
    height: sizeMap[size].size,
    borderRadius: 'var(--radius-full)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: shouldShowImage ? 'transparent' : 'var(--color-primary-500)',
    color: 'var(--color-text-inverse)',
    fontSize: sizeMap[size].fontSize,
    fontWeight: 'var(--font-weight-medium)',
    fontFamily: 'var(--font-family-sans)',
    position: 'relative',
    overflow: 'hidden',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'var(--transition-normal)',
    border: '2px solid var(--color-neutral-0)',
    boxShadow: 'var(--shadow-sm)'
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: shouldShowImage ? 'block' : 'none'
  };

  const statusIndicatorStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '0',
    right: '0',
    width: size === 'xs' ? 'var(--space-2)' : size === 'sm' ? 'var(--space-3)' : 'var(--space-4)',
    height: size === 'xs' ? 'var(--space-2)' : size === 'sm' ? 'var(--space-3)' : 'var(--space-4)',
    borderRadius: 'var(--radius-full)',
    backgroundColor: status ? statusColors[status] : 'transparent',
    border: '2px solid var(--color-neutral-0)',
    transform: 'translate(25%, 25%)'
  };

  return (
    <div
      className={className}
      style={avatarStyle}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      aria-label={alt || `Avatar for ${name}`}
    >
      {shouldShowImage && (
        <img
          src={src}
          alt={alt || name}
          style={imageStyle}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}
      {!shouldShowImage && (
        <span aria-hidden="true">
          {initials || '?'}
        </span>
      )}
      {status && (
        <div
          style={statusIndicatorStyle}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
};

export default Avatar;