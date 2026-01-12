/**
 * @chunk 3.06 - SimpleSelect Component
 * 
 * A simplified Select wrapper around Radix UI Select primitives.
 * Provides a simple API with `options`, `value`, `onChange` props
 * instead of requiring compound component usage.
 */

import * as React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./Select";
import { Label } from "./label";
import { cn } from "@/lib/utils";

/**
 * SimpleSelect - A wrapper component for easy select usage
 * 
 * @param {Object} props
 * @param {string} props.label - Label text above the select
 * @param {string} props.value - Currently selected value
 * @param {function} props.onChange - Callback when value changes (receives value string)
 * @param {Array} props.options - Array of { value, label } objects
 * @param {string} props.placeholder - Placeholder text when no value selected
 * @param {string} props.size - Size variant: 'sm' | 'default'
 * @param {boolean} props.disabled - Whether the select is disabled
 * @param {string} props.className - Additional CSS classes for the trigger
 * @param {string} props.error - Error message to display
 */
export default function SimpleSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  size = "default",
  disabled = false,
  className,
  error,
  id,
  ...rest
}) {
  const selectId = id || React.useId();
  
  const handleValueChange = (newValue) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  const sizeClasses = {
    sm: "h-8 text-sm",
    default: "h-9",
  };

  return (
    <div className="simple-select-wrapper">
      {label && (
        <Label htmlFor={selectId} className="simple-select-label mb-1.5 block text-sm font-medium">
          {label}
        </Label>
      )}
      <Select
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
        {...rest}
      >
        <SelectTrigger
          id={selectId}
          className={cn(
            sizeClasses[size] || sizeClasses.default,
            error && "border-red-500 focus:ring-red-500",
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <span className="simple-select-error text-sm text-red-500 mt-1">
          {error}
        </span>
      )}
    </div>
  );
}







