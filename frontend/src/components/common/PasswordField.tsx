import React, { useState } from "react";
import { usePasswordStrength } from "../../hooks/usePasswordStrength";

interface PasswordFieldProps {
  label?: string;
  showLabel?: boolean;
  showStrengthIndicator?: boolean;
  errorMessage?: string;
  helperText?: string;
  value?: string;
  name?: string;
  [key: string]: any;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  label = "비밀번호",
  showLabel = false,
  showStrengthIndicator = false,
  errorMessage,
  helperText,
  value = "",
  name,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const passwordStrength = usePasswordStrength(String(value));

  const strengthColor = {
    error: "bg-red-500",
    warning: "bg-amber-400",
    success: "bg-green-500",
  }[passwordStrength.color as string] || "bg-outline-variant";

  return (
    <div>
      {showLabel && (
        <label htmlFor={name} className="block text-sm font-medium text-on-surface-variant mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={name}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          aria-label={label}
          aria-invalid={!!errorMessage}
          className={`input-base pr-11 ${errorMessage ? "border-error focus:ring-error/20" : ""}`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
          aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-xl">
            {showPassword ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>

      {showStrengthIndicator && value ? (
        <div className="mt-2">
          <p className="text-xs text-on-surface-variant mb-1" aria-live="polite">
            비밀번호 강도: {passwordStrength.label}
          </p>
          <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${strengthColor}`}
              style={{ width: `${passwordStrength.strength}%` }}
              aria-label={`비밀번호 강도 ${passwordStrength.strength}%`}
            />
          </div>
        </div>
      ) : null}

      {(errorMessage || helperText) && (
        <p className={`text-xs mt-1 ${errorMessage ? "text-error" : "text-on-surface-variant"}`}>
          {errorMessage || helperText}
        </p>
      )}
    </div>
  );
};
