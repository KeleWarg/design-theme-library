/**
 * @chunk 2.03 - CreateThemeModal
 * 
 * Button component with variants, sizes, and loading state.
 */

import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger'
  size = 'default', // 'small' | 'default' | 'large'
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) {
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger'
  };

  const sizeClasses = {
    small: 'btn-sm',
    default: '',
    large: 'btn-lg'
  };

  return (
    <button
      type={type}
      className={`btn ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={16} className="btn-spinner" />}
      {children}
    </button>
  );
}


