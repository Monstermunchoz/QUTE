"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import {
  JE_SORS_STATUTS,
  endOfNightParis,
  formatRemaining,
  parisDayBounds,
} from "@/lib/utils/je-sors";
import type {
  Evenement,
  JeSors,
  JeSorsStatut,
  JeSorsVisibilite,
  Lieu,
  LieuCategorie,
} from "@/types";

type JeSorsBlockProps = {
  current: JeSors | null;
};

type DurationId = "1h" | "2h" | "3h" | "nuit" | "custom";

const LIEU_GROUPS: { id: LieuCategorie; label: string }[] = [
  { id: "bar", label: "Bars" },
  { id: "club", label: "Clubs" },
  { id: "cafe", label: "Cafés" },
  { id: "association", label: "Associations" },
  { id: "culture", label: "Culture" },
];

const AUTRE_LIEU = "__autre__";

export function JeSorsBlock({ current }: JeSorsBlockProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [statut, setStatut] = useState<JeSorsStatut>("je_sors");
  const [duration, setDuration] = useState<DurationId>("2h");
  const [customHours, setCustomHours] = useState("4");
  const [message, setMessage] = useState("");
  const [zone, setZone] = useState("");
  const [visibilite, setVisibilite] = useState<JeSorsVisibilite>("tous");
  const [lieux, setLieux] = useState<Lieu[]>([]);
  const [eventsTonight, setEventsTonight] = useState<
    Pick<Evenement, "id" | "titre">[]
  >([]);
  const [lieuChoice, setLieuChoice] = useState("");
  const [lieuLibre, setLieuLibre] = useState("");
  const [evenementId, setEvenementId] = useState("");

  const active = Boolean(
    current && new Date(current.expires_at).getTime() > now,
  );
  const remaining = current && active ? formatRemaining(current.expires_at) : null;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const { start, end } = parisDayBounds();

    async function load() {
      const [{ data: lieuRows }, { data: eventRows }] = await Promise.all([
        supabase
          .from("lieux")
          .select("id, nom, adresse, categorie")
          .order("nom", { ascending: true }),
        supabase
          .from("evenements")
          .select("id, titre")
          .eq("statut", "publie")
          .gte("date_debut", start.toISOString())
          .lt("date_debut", end.toISOString())
          .order("date_debut", { ascending: true }),
      ]);

      setLieux((lieuRows ?? []) as Lieu[]);
      setEventsTonight((eventRows ?? []) as Pick<Evenement, "id" | "titre">[]);
    }

    void load();
  }, []);

  function expiresAtFromDuration() {
    if (duration === "nuit") {
      return endOfNightParis();
    }

    const hours =
      duration === "1h"
        ? 1
        : duration === "2h"
          ? 2
          : duration === "3h"
            ? 3
            : Number(customHours);

    const safeHours = Number.isFinite(hours) && hours >= 1 ? hours : 1;
    return new Date(Date.now() + safeHours * 3_600_000);
  }

  async function activate() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setError("Tu dois être connecté·e.");
      return;
    }

    const pickedLieu = lieuChoice && lieuChoice !== AUTRE_LIEU ? lieuChoice : null;
    const { error: upsertError } = await supabase.from("je_sors").upsert(
      {
        user_id: user.id,
        statut,
        message: message.trim().slice(0, 200) || null,
        zone: zone.trim() || null,
        visibilite,
        expires_at: expiresAtFromDuration().toISOString(),
        lieu_id: pickedLieu,
        lieu_libre:
          lieuChoice === AUTRE_LIEU
            ? lieuLibre.trim().slice(0, 100) || null
            : null,
        evenement_id: evenementId || null,
      },
      { onConflict: "user_id" },
    );

    setLoading(false);

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    setOpen(false);
    router.refresh();
  }

  async function deactivate() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("je_sors")
      .delete()
      .eq("user_id", current?.user_id ?? "");

    setLoading(false);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    router.refresh();
  }

  return (
    <section className="flex flex-col gap-3 rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-4">
      <h2 className="font-bold text-white">JE SORS ce soir</h2>

      {active && current ? (
        <>
          <span className="w-fit rounded-[8px] bg-[#FF2D87] px-2 py-1 text-xs font-bold text-white">
            🔥 JE SORS
          </span>
          {remaining ? (
            <p className="text-sm text-[#888888]">{remaining}</p>
          ) : null}
          <Button
            type="button"
            label="Désactiver"
            variant="secondary"
            loading={loading}
            onClick={() => void deactivate()}
          />
        </>
      ) : (
        <Button
          type="button"
          label="Je sors ce soir !"
          onClick={() => setOpen(true)}
        />
      )}

      {error ? <p className="text-sm text-[#FF4444]">{error}</p> : null}

      {open ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 px-4 py-6 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="je-sors-title"
        >
          <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-6">
            <h3 id="je-sors-title" className="text-xl font-bold text-white">
              Je sors ce soir
            </h3>

            <div className="mt-4 flex flex-col gap-2">
              <p className="text-[14px] text-[#888888]">Statut</p>
              {JE_SORS_STATUTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStatut(item.id)}
                  className={`rounded-[12px] border px-4 py-3 text-left text-sm font-bold ${
                    statut === item.id
                      ? "border-[#FF2D87] text-white"
                      : "border-[#1E1E1E] text-[#888888]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <p className="text-[14px] text-[#888888]">Durée</p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["1h", "1h"],
                    ["2h", "2h"],
                    ["3h", "3h"],
                    ["nuit", "Toute la nuit"],
                    ["custom", "Personnalisé"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setDuration(id)}
                    className={`rounded-[8px] px-3 py-2 text-xs font-bold ${
                      duration === id
                        ? "bg-[#FF2D87] text-white"
                        : "bg-[#1E1E1E] text-[#888888]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {duration === "custom" ? (
                <Input
                  label="Heures"
                  type="number"
                  min={1}
                  max={24}
                  value={customHours}
                  onChange={(event) => setCustomHours(event.target.value)}
                />
              ) : null}
            </div>

            <div className="mt-4">
              <Input
                label="Message (optionnel)"
                maxLength={200}
                value={message}
                onChange={(event) => setMessage(event.target.value.slice(0, 200))}
                placeholder="Qui QUTE près de la Guillotière ?"
              />
              <p className="mt-1 text-right text-xs text-[#888888]">
                {message.length}/200
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <label htmlFor="lieu-select" className="text-[14px] text-[#888888]">
                Où tu sors ?
              </label>
              <select
                id="lieu-select"
                value={lieuChoice}
                onChange={(event) => setLieuChoice(event.target.value)}
                className="h-[52px] w-full rounded-[12px] border border-[#333333] bg-[#1E1E1E] px-4 text-white outline-none focus:border-[#FF2D87]"
              >
                <option value="">Choisir un lieu</option>
                {LIEU_GROUPS.map((group) => {
                  const items = lieux.filter((lieu) => lieu.categorie === group.id);
                  if (items.length === 0) {
                    return null;
                  }
                  return (
                    <optgroup key={group.id} label={group.label}>
                      {items.map((lieu) => (
                        <option key={lieu.id} value={lieu.id}>
                          {lieu.nom}
                          {lieu.adresse ? ` · ${lieu.adresse}` : ""}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
                {lieux.filter(
                  (lieu) =>
                    !LIEU_GROUPS.some((group) => group.id === lieu.categorie),
                ).length > 0 ? (
                  <optgroup label="Autres">
                    {lieux
                      .filter(
                        (lieu) =>
                          !LIEU_GROUPS.some((group) => group.id === lieu.categorie),
                      )
                      .map((lieu) => (
                        <option key={lieu.id} value={lieu.id}>
                          {lieu.nom}
                          {lieu.adresse ? ` · ${lieu.adresse}` : ""}
                        </option>
                      ))}
                  </optgroup>
                ) : null}
                <option value={AUTRE_LIEU}>Autre lieu</option>
              </select>
              {lieuChoice === AUTRE_LIEU ? (
                <Input
                  label="Précise le lieu"
                  maxLength={100}
                  value={lieuLibre}
                  onChange={(event) =>
                    setLieuLibre(event.target.value.slice(0, 100))
                  }
                  placeholder="Où ça ? (ex: chez des potes, Croix-Rousse…)"
                />
              ) : null}
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <label htmlFor="event-select" className="text-[14px] text-[#888888]">
                Événement (optionnel)
              </label>
              <select
                id="event-select"
                value={evenementId}
                onChange={(event) => setEvenementId(event.target.value)}
                className="h-[52px] w-full rounded-[12px] border border-[#333333] bg-[#1E1E1E] px-4 text-white outline-none focus:border-[#FF2D87]"
              >
                <option value="">Aucun événement</option>
                {eventsTonight.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.titre}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <Input
                label="Zone approximative"
                value={zone}
                onChange={(event) => setZone(event.target.value)}
                placeholder="Presqu'île, Croix-Rousse…"
              />
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <p className="text-[14px] text-[#888888]">Visibilité</p>
              <button
                type="button"
                onClick={() => setVisibilite("tous")}
                className={`rounded-[12px] border px-4 py-3 text-left text-sm font-bold ${
                  visibilite === "tous"
                    ? "border-[#FF2D87] text-white"
                    : "border-[#1E1E1E] text-[#888888]"
                }`}
              >
                Tout le monde
              </button>
              <button
                type="button"
                onClick={() => setVisibilite("matchs")}
                className={`rounded-[12px] border px-4 py-3 text-left text-sm font-bold ${
                  visibilite === "matchs"
                    ? "border-[#FF2D87] text-white"
                    : "border-[#1E1E1E] text-[#888888]"
                }`}
              >
                Mes matchs uniquement
              </button>
            </div>

            {error ? (
              <p className="mt-3 text-sm text-[#FF4444]">{error}</p>
            ) : null}

            <div className="mt-6 flex flex-col gap-2">
              <Button
                type="button"
                label="C'est parti !"
                loading={loading}
                onClick={() => void activate()}
              />
              <Button
                type="button"
                label="Annuler"
                variant="ghost"
                onClick={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
