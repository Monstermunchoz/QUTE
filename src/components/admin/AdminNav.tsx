"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/signalements", label: "Signalements" },
  { href: "/admin/evenements", label: "Événements" },
  { href: "/admin/profils", label: "Profils" },
  { href: "/admin/photos", label: "Photos" },
  { href: "/admin/moderation", label: "Modération" },
  { href: "/admin/audit", label: "Journal" },
];

type AdminNavProps = {
  pseudo: string;
};

function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className="menu-icon"
      width={24}
      height={24}
      aria-hidden
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function AdminNav({ pseudo }: AdminNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = LINKS.map((link) => {
    const active =
      link.href === "/admin"
        ? pathname === "/admin"
        : pathname.startsWith(link.href);

    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={() => setOpen(false)}
        className={`rounded-[12px] px-3 py-3 text-[15px] font-bold ${
          active ? "bg-[#1E1E1E] text-[#FF2D87]" : "text-[#CCCCCC]"
        }`}
      >
        {link.label}
      </Link>
    );
  });

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center gap-2 border-b border-[#1E1E1E] bg-[#111111] px-5 py-2 md:hidden">
        <button
          type="button"
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="flex h-11 w-11 shrink-0 items-center justify-center text-white"
        >
          <MenuIcon />
        </button>
        <div className="min-w-0">
          <p className="text-[15px] font-bold text-[#FF2D87]">QUTE Admin</p>
          <p className="truncate text-sm text-[#888888]">{pseudo}</p>
        </div>
      </header>

      {open ? (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-40 bg-black/70 md:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={`z-50 w-[min(280px,85vw)] flex-col border-r border-[#1E1E1E] bg-[#111111] md:static md:flex md:w-[220px] ${
          open ? "fixed inset-y-0 left-0 flex" : "hidden md:flex"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#1E1E1E] px-5 py-5">
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-[#FF2D87]">QUTE Admin</p>
            <p className="mt-1 truncate text-sm text-[#888888]">{pseudo}</p>
          </div>
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
            className="flex h-11 w-11 shrink-0 items-center justify-center text-xl text-[#888888] md:hidden"
          >
            ✕
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">{links}</nav>
        <Link
          href="/accueil"
          onClick={() => setOpen(false)}
          className="border-t border-[#1E1E1E] px-5 py-4 text-[15px] text-[#CCCCCC]"
        >
          Retour QUTE
        </Link>
      </aside>
    </>
  );
}
