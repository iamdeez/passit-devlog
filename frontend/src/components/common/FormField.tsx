import React from "react";

interface FormFieldProps {
  label?: string;
  showLabel?: boolean;
  errorMessage?: string;
  helperText?: string;
  name?: string;
  placeholder?: string;
  [key: string]: any;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  showLabel = false,
  errorMessage,
  helperText,
  name,
  placeholder,
  ...rest
}) => {
  return (
    <div>
      {showLabel && label && (
        <label htmlFor={name} className="block text-sm font-medium text-on-surface-variant mb-1.5">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        placeholder={placeholder || label}
        aria-label={label || placeholder}
        aria-invalid={!!errorMessage}
        className={`input-base ${errorMessage ? "border-error focus:ring-error/20" : ""}`}
        {...rest}
      />
      {(errorMessage || helperText) && (
        <p className={`text-xs mt-1 ${errorMessage ? "text-error" : "text-on-surface-variant"}`}>
          {errorMessage || helperText}
        </p>
      )}
    </div>
  );
};
