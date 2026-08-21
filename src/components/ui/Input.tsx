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
      <label htmlFor={inputId} className="text-[14px] text-[#888888]">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={`h-[52px] w-full rounded-[12px] border bg-[#1E1E1E] px-4 text-white outline-none placeholder:text-[#555555] focus:border-[#FF2D87] ${
          error ? "border-[#FF4444]" : "border-[#333333]"
        } ${className}`}
        {...rest}
        {...register}
      />
      {error ? <p className="text-sm text-[#FF4444]">{error}</p> : null}
    </div>
  );
}
