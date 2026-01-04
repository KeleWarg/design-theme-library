/**
 * @chunk 2.15 - ColorEditor
 * 
 * Slider component for numeric value selection.
 * Used in color editor for RGB/HSL/opacity controls.
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { cn } from '../../lib/utils';

/**
 * Slider component
 * @param {Object} props
 * @param {number} props.min - Minimum value
 * @param {number} props.max - Maximum value
 * @param {number} props.value - Current value
 * @param {number} props.step - Step increment (default: 1)
 * @param {Function} props.onChange - Called on value change
 * @param {Function} props.onChangeEnd - Called when user finishes dragging
 * @param {boolean} props.disabled - Whether slider is disabled
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.trackColor - Custom track fill color (CSS color)
 * @param {boolean} props.showGradient - Show gradient track (for hue slider)
 */
export default function Slider({
  min = 0,
  max = 100,
  value = 0,
  step = 1,
  onChange,
  onChangeEnd,
  disabled = false,
  className = '',
  trackColor,
  showGradient = false
}) {
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Calculate percentage for positioning
  const percentage = ((value - min) / (max - min)) * 100;
  
  // Convert mouse/touch position to value
  const getValueFromPosition = useCallback((clientX) => {
    if (!trackRef.current) return value;
    
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = x / rect.width;
    const rawValue = min + percent * (max - min);
    
    // Round to step
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, steppedValue));
  }, [min, max, step, value]);
  
  // Handle mouse/touch start
  const handleStart = useCallback((clientX) => {
    if (disabled) return;
    setIsDragging(true);
    const newValue = getValueFromPosition(clientX);
    if (newValue !== value) {
      onChange?.(newValue);
    }
  }, [disabled, getValueFromPosition, value, onChange]);
  
  // Handle mouse/touch move
  const handleMove = useCallback((clientX) => {
    if (!isDragging || disabled) return;
    const newValue = getValueFromPosition(clientX);
    if (newValue !== value) {
      onChange?.(newValue);
    }
  }, [isDragging, disabled, getValueFromPosition, value, onChange]);
  
  // Handle mouse/touch end
  const handleEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onChangeEnd?.(value);
    }
  }, [isDragging, onChangeEnd, value]);
  
  // Mouse events
  const handleMouseDown = (e) => {
    e.preventDefault();
    handleStart(e.clientX);
  };
  
  // Touch events
  const handleTouchStart = (e) => {
    handleStart(e.touches[0].clientX);
  };
  
  // Global mouse/touch event listeners when dragging
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e) => handleMove(e.clientX);
    const handleTouchMove = (e) => handleMove(e.touches[0].clientX);
    const handleMouseUp = () => handleEnd();
    const handleTouchEnd = () => handleEnd();
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMove, handleEnd]);
  
  // Keyboard support
  const handleKeyDown = (e) => {
    if (disabled) return;
    
    let newValue = value;
    
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        newValue = Math.min(max, value + step);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        newValue = Math.max(min, value - step);
        break;
      case 'Home':
        newValue = min;
        break;
      case 'End':
        newValue = max;
        break;
      case 'PageUp':
        newValue = Math.min(max, value + step * 10);
        break;
      case 'PageDown':
        newValue = Math.max(min, value - step * 10);
        break;
      default:
        return;
    }
    
    e.preventDefault();
    if (newValue !== value) {
      onChange?.(newValue);
      onChangeEnd?.(newValue);
    }
  };
  
  // Track fill style
  const fillStyle = {
    width: `${percentage}%`,
    ...(trackColor && { backgroundColor: trackColor })
  };
  
  // Track gradient style (for hue slider)
  const gradientStyle = showGradient ? {
    background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
  } : {};

  return (
    <div 
      className={cn('slider', className, { disabled, dragging: isDragging })}
      ref={trackRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className="slider-track" style={gradientStyle}>
        {!showGradient && (
          <div className="slider-fill" style={fillStyle} />
        )}
      </div>
      <div 
        className="slider-thumb"
        style={{ left: `${percentage}%` }}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-disabled={disabled}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}


