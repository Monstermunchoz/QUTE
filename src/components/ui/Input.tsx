"use client";

import type { InputHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  register?: UseFormRegisterReturn;
};

export function Input({
  label,
  type = "text",
  placeholder,
  error,
  register,
  id,
  className = "",
  ...rest
}: InputProps) {
  const inputId = id ?? register?.name ?? label;

  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={inputId} className="text-[14px] text-[var(--text-muted)]">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={`h-[52px] w-full rounded-[12px] border bg-[var(--chip)] px-4 text-[var(--text)] outline-none placeholder:text-[var(--text-muted)] focus:border-[#FF2D87] ${
          error ? "border-[#FF4444]" : "border-[var(--border)]"
        } ${className}`}
        {...rest}
        {...register}
      />
      {error ? <p className="text-sm text-[#FF4444]">{error}</p> : null}
    </div>
  );
}
