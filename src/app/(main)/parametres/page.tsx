"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { PageTitle } from "@/components/ui/BackButton";
import { Switch } from "@/components/ui/Switch";

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
    </main>
  );
}
