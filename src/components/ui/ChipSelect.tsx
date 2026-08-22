"use client";

type ChipSelectProps = {
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
};

export function ChipSelect({
  options,
  value,
  onChange,
  max,
}: ChipSelectProps) {
  function toggle(option: string) {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option));
      return;
    }

    if (max && value.length >= max) {
      return;
    }

    onChange([...value, option]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = value.includes(option);

        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              selected
                ? "font-bold text-white"
                : "bg-[var(--chip)] text-[var(--text-muted)]"
            }`}
            style={
              selected
                ? { background: "linear-gradient(135deg, #FF2D87, #7B2FFF)" }
                : undefined
            }
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function BadgeList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full bg-[var(--chip)] px-3 py-1.5 text-sm text-[var(--text)]"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
