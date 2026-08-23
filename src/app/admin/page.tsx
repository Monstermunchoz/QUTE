import Link from "next/link";
import { TrustCounters } from "./trust-counters";
import { fetchModerationCounts } from "@/lib/admin/moderation-data";
import { createServiceClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const admin = createServiceClient();

  const [
    { count: reportsCount },
    { count: eventsCount },
    { count: avatarCount },
    { count: albumCount },
    trust,
  ] = await Promise.all([
    admin
      .from("signalements")
      .select("*", { count: "exact", head: true })
      .eq("statut", "en_attente"),
    admin
      .from("evenements")
      .select("*", { count: "exact", head: true })
      .eq("statut", "pending"),
    admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("photo_status", "pending"),
    admin
      .from("photos")
      .select("*", { count: "exact", head: true })
      .eq("statut", "pending"),
    fetchModerationCounts(),
  ]);

  const photosCount = (avatarCount ?? 0) + (albumCount ?? 0);

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
      value: photosCount,
    },
  ];

  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-white md:text-2xl">
        Tableau de bord
      </h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-5"
          >
            <p className="text-[32px] font-bold leading-none text-white">
              {card.value}
            </p>
            <p className="mt-2 text-[15px] text-[#CCCCCC]">{card.label}</p>
          </Link>
        ))}
        <TrustCounters
          initialVerify={trust.aVerifier}
          initialQuarantine={trust.quarantaine}
        />
      </div>
    </main>
  );
}
