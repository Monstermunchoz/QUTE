import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const [
    { count: reportsCount },
    { count: eventsCount },
    { count: photosCount },
  ] = await Promise.all([
    supabase
      .from("signalements")
      .select("*", { count: "exact", head: true })
      .eq("statut", "en_attente"),
    supabase
      .from("evenements")
      .select("*", { count: "exact", head: true })
      .eq("statut", "pending"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("photo_status", "pending"),
  ]);

  const cards = [
    {
      href: "/admin/signalements",
      label: "Signalements en attente",
      value: reportsCount ?? 0,
    },
    {
      href: "/admin/evenements",
      label: "Événements pending",
      value: eventsCount ?? 0,
    },
    {
      href: "/admin/photos",
      label: "Photos pending",
      value: photosCount ?? 0,
    },
  ];

  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-[12px] border border-[#1E1E1E] bg-[#111111] p-4"
          >
            <p className="text-[32px] font-bold leading-none text-white">
              {card.value}
            </p>
            <p className="mt-2 text-sm text-[#888888]">{card.label}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
