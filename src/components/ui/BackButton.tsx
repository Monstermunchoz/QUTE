"use client";

import { useRouter } from "next/navigation";

type BackButtonProps = {
  className?: string;
  fallbackHref?: string;
};

export function BackButton({
  className = "",
  fallbackHref = "/accueil",
}: BackButtonProps) {
  const router = useRouter();

  function goBack() {
    if (typeof window !== "undefined") {
      const fromApp =
        document.referrer.startsWith(window.location.origin) ||
        window.history.length > 1;

      if (fromApp) {
        router.back();
        return;
      }
    }

    router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      aria-label="Retour"
      onClick={goBack}
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
        <h1 className="page-title mb-0 truncate text-[var(--text)]">{title}</h1>
        {subtitle ? (
          <p className="page-copy text-[var(--text-muted)]">{subtitle}</p>
        ) : null}
      </div>
    </header>
  );
}
