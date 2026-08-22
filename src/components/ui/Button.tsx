"use client";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = {
  label: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
};

const variantClassName: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "border border-[var(--border)] bg-transparent text-[var(--text)]",
  ghost: "bg-transparent text-[var(--text-muted)]",
  danger: "border border-[#FF4444] bg-transparent text-[#FF4444]",
};

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
    />
  );
}

export function Button({
  label,
  onClick,
  loading = false,
  disabled = false,
  type = "button",
  variant = "primary",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`flex h-[52px] w-full items-center justify-center rounded-[12px] px-4 text-sm font-bold tracking-wide transition-opacity disabled:cursor-not-allowed disabled:opacity-50 ${variantClassName[variant]}`}
      style={
        variant === "primary"
          ? { background: "linear-gradient(135deg, #FF2D87, #7B2FFF)" }
          : undefined
      }
    >
      {loading ? <Spinner /> : label}
    </button>
  );
}
