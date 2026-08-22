"use client";

import { useRouter } from "next/navigation";

type BackButtonProps = {
  className?: string;
};

export function BackButton({ className = "" }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label="Retour"
      onClick={() => router.back()}
      className={`flex h-11 w-11 shrink-0 items-center justify-center text-[var(--text)] ${className}`}
    >
      <svg
        className="back-icon"
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M15 6 9 12l6 6" />
      </svg>
    </button>
  );
}

type PageTitleProps = {
  title: string;
  subtitle?: string;
};

export function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <header className="flex items-center gap-1">
      <BackButton />
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold text-[var(--text)]">{title}</h1>
        {subtitle ? (
          <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>
        ) : null}
      </div>
    </header>
  );
}
