"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ProfileCard } from "@/components/features/ProfileCard";
import { EventsTab } from "./events-tab";
import type {
  Evenement,
  Groupe,
  Lieu,
  LieuCategorie,
  Participation,
  Profile,
  Salon,
  JeSorsStatut,
} from "@/types";

const PlacesMap = dynamic(
  () =>
    import("@/components/features/PlacesMap").then((mod) => mod.PlacesMap),
  { ssr: false },
);

type TabId = "personnes" | "salons" | "groupes" | "lieux" | "evenements";

type ExplorerTabsProps = {
  profiles: Pick<Profile, "id" | "pseudo" | "ville" | "photo_url">[];
  salons: Salon[];
  groupes: Groupe[];
  lieux: Lieu[];
  evenements: Evenement[];
  participations: Participation[];
  currentUserId: string;
  initialTab?: TabId;
  jeSorsByUserId?: Record<string, { statut: JeSorsStatut; zone: string | null }>;
};

const TABS: { id: TabId; label: string }[] = [
  { id: "personnes", label: "Personnes" },
  { id: "salons", label: "Salons" },
  { id: "groupes", label: "Groupes" },
  { id: "lieux", label: "Lieux" },
  { id: "evenements", label: "Événements" },
];

const CATEGORY_FILTERS: { id: "tous" | LieuCategorie; label: string }[] = [
  { id: "tous", label: "Tous" },
  { id: "bar", label: "Bars" },
  { id: "club", label: "Clubs" },
  { id: "cafe", label: "Cafés" },
  { id: "association", label: "Associations" },
];

export function ExplorerTabs({
  profiles,
  salons,
  groupes,
  lieux,
  evenements,
  participations,
  currentUserId,
  initialTab = "personnes",
  jeSorsByUserId = {},
}: ExplorerTabsProps) {
  const [tab, setTab] = useState<TabId>(initialTab);
  const [category, setCategory] = useState<"tous" | LieuCategorie>("tous");

  const filteredLieux = useMemo(
    () =>
      category === "tous"
        ? lieux
        : lieux.filter((lieu) => lieu.categorie === category),
    [category, lieux],
  );

  return (
    <main className="flex flex-col gap-4 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-white">Explorer</h1>
        <p className="text-sm text-[#888888]">Qui QUTE dans le coin.</p>
      </header>

      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
                active ? "text-[#FF2D87]" : "text-[#888888]"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "personnes" ? (
        profiles.length === 0 ? (
          <p className="pt-16 text-center text-[#888888]">
            Bon… personne n&apos;a bougé. 😏
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                jeSors={jeSorsByUserId[profile.id] ?? null}
              />
            ))}
          </div>
        )
      ) : null}

      {tab === "salons" ? (
        salons.length === 0 ? (
          <p className="pt-16 text-center text-[#888888]">
            Aucun salon pour le moment.
          </p>
        ) : (
        <ul className="flex flex-col gap-3">
          {salons.map((salon) => (
            <li key={salon.id}>
              <Link
                href={`/salons/${salon.id}`}
                className="block rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-4"
              >
                <p className="font-bold text-white">{salon.nom}</p>
                <p className="mt-1 text-sm text-[#888888]">
                  {salon.description}
                </p>
                {salon.theme ? (
                  <span className="mt-3 inline-block rounded-[8px] bg-[#1E1E1E] px-2 py-1 text-xs text-[#FF2D87]">
                    {salon.theme}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
        )
      ) : null}

      {tab === "groupes" ? (
        <div className="flex flex-col gap-3">
          <Link
            href="/groupes/creer"
            className="flex h-[52px] items-center justify-center rounded-[12px] text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #FF2D87, #7B2FFF)" }}
          >
            Créer un groupe
          </Link>
          {groupes.length === 0 ? (
            <p className="pt-8 text-center text-[#888888]">
              Pas encore de groupe. Crée le premier.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {groupes.map((groupe) => (
                <li key={groupe.id}>
                  <Link
                    href={`/groupes/${groupe.id}`}
                    className="block rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-4"
                  >
                    <p className="font-bold text-white">{groupe.nom}</p>
                    <p className="mt-1 text-sm text-[#888888]">
                      {groupe.description || "Pas de description."}
                    </p>
                    {groupe.est_prive ? (
                      <span className="mt-3 inline-block rounded-[8px] bg-[#1E1E1E] px-2 py-1 text-xs text-[#FF2D87]">
                        privé
                      </span>
                    ) : (
                      <span className="mt-3 inline-block rounded-[8px] bg-[#1E1E1E] px-2 py-1 text-xs text-[#FF2D87]">
                        public
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {tab === "lieux" ? (
        <div className="flex flex-col gap-3">
          <PlacesMap lieux={filteredLieux} />
          <div className="flex gap-2 overflow-x-auto">
            {CATEGORY_FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.id)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                  category === item.id ? "text-[#FF2D87]" : "text-[#888888]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          {filteredLieux.length === 0 ? (
            <p className="pt-8 text-center text-[#888888]">
              Aucun lieu dans ce filtre.
            </p>
          ) : (
          <ul className="flex flex-col gap-3">
            {filteredLieux.map((lieu) => (
              <li key={lieu.id}>
                <Link
                  href={`/lieux/${lieu.id}`}
                  className="block rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-4"
                >
                  <p className="font-bold text-white">{lieu.nom}</p>
                  {lieu.categorie ? (
                    <span className="mt-2 inline-block rounded-[8px] bg-[#1E1E1E] px-2 py-1 text-xs text-[#FF2D87]">
                      {lieu.categorie}
                    </span>
                  ) : null}
                  <p className="mt-2 text-sm text-[#888888]">{lieu.adresse}</p>
                </Link>
              </li>
            ))}
          </ul>
          )}
        </div>
      ) : null}

      {tab === "evenements" ? (
        <EventsTab
          evenements={evenements}
          participations={participations}
          currentUserId={currentUserId}
        />
      ) : null}
    </main>
  );
}
