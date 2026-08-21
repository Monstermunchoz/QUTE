"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/signalements", label: "Signalements" },
  { href: "/admin/evenements", label: "Événements" },
  { href: "/admin/profils", label: "Profils" },
  { href: "/admin/photos", label: "Photos" },
];

type AdminNavProps = {
  pseudo: string;
};

export function AdminNav({ pseudo }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <aside className="flex w-[200px] shrink-0 flex-col border-r border-[#1E1E1E] bg-[#111111]">
      <div className="border-b border-[#1E1E1E] px-4 py-5">
        <p className="text-sm font-bold text-[#FF2D87]">QUTE Admin</p>
        <p className="mt-1 truncate text-xs text-[#888888]">{pseudo}</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {LINKS.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-[12px] px-3 py-2 text-sm font-bold ${
                active ? "text-[#FF2D87]" : "text-[#888888]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/accueil"
        className="border-t border-[#1E1E1E] px-4 py-4 text-sm text-[#888888]"
      >
        Retour QUTE
      </Link>
    </aside>
  );
}
