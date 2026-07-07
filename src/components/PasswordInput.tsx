"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

export function passwordFieldAttrs(show: boolean): { type: "text" | "password" } {
  return { type: show ? "text" : "password" };
}

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  children?: ReactNode;
}

function applyInputVisibility(input: HTMLInputElement | null, show: boolean) {
  if (!input) return;
  input.type = show ? "text" : "password";
  input.style.removeProperty("-webkit-text-security");
}

export function PasswordInput({
  label,
  id,
  visible,
  onVisibleChange,
  className,
  children,
  ...inputProps
}: PasswordInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [revealed, setRevealed] = useState(Boolean(visible));

  useEffect(() => {
    if (typeof visible === "boolean") setRevealed(visible);
  }, [visible]);

  useEffect(() => {
    applyInputVisibility(inputRef.current, revealed);
  }, [revealed]);

  function toggleVisibility() {
    setRevealed((prev) => {
      const next = !prev;
      onVisibleChange?.(next);
      applyInputVisibility(inputRef.current, next);
      return next;
    });
  }

  const inputClassName = className ? `no-cap auth-password-input ${className}` : "no-cap auth-password-input";

  return (
    <div className="field auth-password-field">
      <label htmlFor={inputId}>{label}</label>
      <div className="auth-password-wrap">
        <input
          {...inputProps}
          ref={inputRef}
          id={inputId}
          type="password"
          className={inputClassName}
          data-revealed={revealed ? "true" : "false"}
        />
        <button
          type="button"
          className="auth-eye"
          onClick={toggleVisibility}
          aria-label={revealed ? "Hide password" : "Show password"}
          aria-pressed={revealed}
        >
          {revealed ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
        </button>
      </div>
      {children}
    </div>
  );
}
