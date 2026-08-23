import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const [
    { count: reportsCount },
    { count: eventsCount },
    { count: avatarCount },
    { count: albumCount },
    { count: verifyCount },
    { count: salonVerifyCount },
    { count: quarantineCount },
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
    supabase
      .from("photos")
      .select("*", { count: "exact", head: true })
      .eq("statut", "pending"),
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("a_verifier", true)
      .eq("masque", false),
    supabase
      .from("salon_messages")
      .select("*", { count: "exact", head: true })
      .eq("a_verifier", true)
      .eq("masque", false),
    supabase
      .from("messages_quarantaine")
      .select("*", { count: "exact", head: true })
      .eq("statut", "en_attente"),
  ]);

  const photosCount = (avatarCount ?? 0) + (albumCount ?? 0);
  const toVerify = (verifyCount ?? 0) + (salonVerifyCount ?? 0);

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
    {
      href: "/admin/moderation",
      label: "messages à vérifier",
      value: toVerify,
      tone: "orange" as const,
    },
    {
      href: "/admin/moderation",
      label: "messages en quarantaine",
      value: quarantineCount ?? 0,
      tone: "red" as const,
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
            key={`${card.href}-${card.label}`}
            href={card.href}
            className="rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-5"
          >
            <p
              className="text-[32px] font-bold leading-none"
              style={{
                color:
                  "tone" in card && card.tone === "orange"
                    ? "#FF8A00"
                    : "tone" in card && card.tone === "red"
                      ? "#FF4444"
                      : "#FFFFFF",
              }}
            >
              {card.value}
            </p>
            <p className="mt-2 text-[15px] text-[#CCCCCC]">{card.label}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
