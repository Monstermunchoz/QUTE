"use client";

import { useState } from "react";

type ToggleRowProps = {
  label: string;
  checked: boolean;
  onToggle: () => void;
};

function ToggleRow({ label, checked, onToggle }: ToggleRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className="flex h-[52px] w-full items-center justify-between px-4"
    >
      <span className="text-sm text-[#CCCCCC]">{label}</span>
      <span
        className={`relative h-6 w-11 rounded-full ${
          checked ? "bg-[#FF2D87]" : "bg-[#333333]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export default function ParametresPage() {
  const [matchNotif, setMatchNotif] = useState(true);
  const [messageNotif, setMessageNotif] = useState(true);
  const [eventNotif, setEventNotif] = useState(true);
  const [language, setLanguage] = useState("fr");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  return (
    <main className="flex flex-col gap-6 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-white">Paramètres</h1>
      </header>

      <section className="rounded-[16px] border border-[#1E1E1E] bg-[#111111]">
        <h2 className="px-4 pt-4 text-sm font-bold text-white">Notifications</h2>
        <ToggleRow
          label="Matchs"
          checked={matchNotif}
          onToggle={() => setMatchNotif((value) => !value)}
        />
        <ToggleRow
          label="Messages"
          checked={messageNotif}
          onToggle={() => setMessageNotif((value) => !value)}
        />
        <ToggleRow
          label="Événements"
          checked={eventNotif}
          onToggle={() => setEventNotif((value) => !value)}
        />
      </section>

      <section className="rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-4">
        <h2 className="text-sm font-bold text-white">Langue</h2>
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="mt-3 h-[52px] w-full rounded-[12px] border border-[#333333] bg-[#1E1E1E] px-4 text-white outline-none"
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
      </section>

      <section className="rounded-[16px] border border-[#1E1E1E] bg-[#111111]">
        <h2 className="px-4 pt-4 text-sm font-bold text-white">Thème</h2>
        <ToggleRow
          label="Thème sombre"
          checked={theme === "dark"}
          onToggle={() =>
            setTheme((value) => (value === "dark" ? "light" : "dark"))
          }
        />
      </section>
    </main>
  );
}
