"use client";

type SwitchProps = {
  label: string;
  checked: boolean;
  onToggle: () => void;
};

export function Switch({ label, checked, onToggle }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className="qute-switch-row"
    >
      <span className="text-sm text-[var(--text)]">{label}</span>
      <span className={`qute-switch ${checked ? "qute-switch-on" : ""}`}>
        <span className="qute-switch-thumb" />
      </span>
    </button>
  );
}
