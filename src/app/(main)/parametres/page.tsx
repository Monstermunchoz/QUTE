"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { PageTitle } from "@/components/ui/BackButton";
import { Switch } from "@/components/ui/Switch";
import { createClient } from "@/lib/supabase/client";
import { estPremium } from "@/lib/subscription";
import Link from "next/link";

export default function ParametresPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [matchNotif, setMatchNotif] = useState(true);
  const [messageNotif, setMessageNotif] = useState(true);
  const [eventNotif, setEventNotif] = useState(true);
  const [language, setLanguage] = useState("fr");

  useEffect(() => {
    setMounted(true);
  }, []);

  const dark = !mounted || resolvedTheme !== "light";

  return (
    <main className="flex flex-col gap-6">
      <PageTitle title="Paramètres" />

      <section className="overflow-hidden rounded-[16px] border border-[var(--border)] bg-[var(--surface)]">
        <h2 className="px-4 pt-4 text-sm font-bold text-[var(--text)]">
          Notifications
        </h2>
        <Switch
          label="Matchs"
          checked={matchNotif}
          onToggle={() => setMatchNotif((value) => !value)}
        />
        <Switch
          label="Messages"
          checked={messageNotif}
          onToggle={() => setMessageNotif((value) => !value)}
        />
        <Switch
          label="Événements"
          checked={eventNotif}
          onToggle={() => setEventNotif((value) => !value)}
        />
      </section>

      <section className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="text-sm font-bold text-[var(--text)]">Langue</h2>
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="mt-3 h-[52px] w-full rounded-[12px] border border-[var(--border)] bg-[var(--chip)] px-4 text-[var(--text)] outline-none"
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
      </section>

      <section className="overflow-hidden rounded-[16px] border border-[var(--border)] bg-[var(--surface)]">
        <h2 className="px-4 pt-4 text-sm font-bold text-[var(--text)]">Thème</h2>
        <Switch
          label="Thème sombre"
          checked={dark}
          onToggle={() => setTheme(dark ? "light" : "dark")}
        />
      </section>

      <ModeDiscretSection />
    </main>
  );
}

function ModeDiscretSection() {
  const [premium, setPremium] = useState(false);
  const [checked, setChecked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      setUserId(user.id);
      const { data } = await supabase
        .from("profiles")
        .select("abonnement, abonnement_statut, mode_discret")
        .eq("id", user.id)
        .maybeSingle();

      setPremium(estPremium(data));
      setChecked(Boolean(data?.mode_discret));
    }

    void load();
  }, []);

  async function toggle() {
    if (!premium || !userId) {
      return;
    }

    const next = !checked;
    setChecked(next);
    const supabase = createClient();
    await supabase.from("profiles").update({ mode_discret: next }).eq("id", userId);
  }

  return (
    <section className="overflow-hidden rounded-[16px] border border-[var(--border)] bg-[var(--surface)]">
      <h2 className="px-4 pt-4 text-sm font-bold text-[var(--text)]">
        Mode discret
      </h2>
      <p className="px-4 pb-2 text-sm text-[var(--text-muted)]">
        Navigue sans apparaître en ligne. Réservé à QUTE+.
      </p>
      {premium ? (
        <Switch label="Mode discret" checked={checked} onToggle={() => void toggle()} />
      ) : (
        <div className="px-4 pb-4">
          <Link
            href="/abonnement"
            className="flex h-[52px] items-center justify-center rounded-[12px] text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #FF2D87, #7B2FFF)" }}
          >
            Débloquer avec QUTE+
          </Link>
        </div>
      )}
    </section>
  );
}
