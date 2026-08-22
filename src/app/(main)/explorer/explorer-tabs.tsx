"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProfileCard } from "@/components/features/ProfileCard";
import { EventsTab } from "./events-tab";
import { IDENTITES, ZONES_LYON } from "@/lib/profile/options";
import { getAge } from "@/lib/utils/age";
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
  profiles: Pick<
    Profile,
    | "id"
    | "pseudo"
    | "ville"
    | "zone"
    | "photo_url"
    | "abonnement"
    | "role"
    | "identites"
    | "date_naissance"
  >[];
  salons: Salon[];
  groupes: Groupe[];
  lieux: Lieu[];
  lieuLikeCounts?: Record<string, number>;
  evenements: Evenement[];
  participations: Participation[];
  currentUserId: string;
  initialTab?: TabId;
  canCreateSalon?: boolean;
  canFilter?: boolean;
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
  lieuLikeCounts = {},
  evenements,
  participations,
  currentUserId,
  initialTab = "personnes",
  canCreateSalon = false,
  canFilter = false,
  jeSorsByUserId = {},
}: ExplorerTabsProps) {
  const [tab, setTab] = useState<TabId>(initialTab);
  const [category, setCategory] = useState<"tous" | LieuCategorie>("tous");
  const [identite, setIdentite] = useState("");
  const [zone, setZone] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const filteredLieux = useMemo(() => {
    const filtered =
      category === "tous"
        ? lieux
        : lieux.filter((lieu) => lieu.categorie === category);

    return filtered.slice().sort((a, b) => {
      const delta = (lieuLikeCounts[b.id] ?? 0) - (lieuLikeCounts[a.id] ?? 0);
      if (delta !== 0) {
        return delta;
      }
      return a.nom.localeCompare(b.nom, "fr");
    });
  }, [category, lieuLikeCounts, lieux]);

  const filteredProfiles = useMemo(() => {
    if (!canFilter) {
      return profiles;
    }

    return profiles.filter((profile) => {
      if (identite && !(profile.identites ?? []).includes(identite)) {
        return false;
      }

      if (zone && profile.zone !== zone) {
        return false;
      }

      const age = getAge(profile.date_naissance);
      const min = Number(ageMin);
      const max = Number(ageMax);

      if (ageMin && (age == null || age < min)) {
        return false;
      }

      if (ageMax && (age == null || age > max)) {
        return false;
      }

      return true;
    });
  }, [ageMax, ageMin, canFilter, identite, profiles, zone]);

  return (
    <main className="flex flex-col gap-4 pb-4">
      <header>
        <h1 className="page-title text-white">Explorer</h1>
        <p className="page-copy text-[#888888]">Qui QUTE dans le coin.</p>
      </header>

      <div className="tabs-scroll flex gap-2">
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
        <div className="flex flex-col gap-3">
          {canFilter ? (
            <div className="grid grid-cols-2 gap-2">
              <select
                value={identite}
                onChange={(event) => setIdentite(event.target.value)}
                className="h-[52px] w-full rounded-[12px] border border-[#1E1E1E] bg-[#111111] px-3 text-base text-white"
              >
                <option value="">Identité</option>
                {IDENTITES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                value={zone}
                onChange={(event) => setZone(event.target.value)}
                className="h-[52px] w-full rounded-[12px] border border-[#1E1E1E] bg-[#111111] px-3 text-base text-white"
              >
                <option value="">Zone</option>
                {ZONES_LYON.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={18}
                max={99}
                placeholder="Âge min"
                value={ageMin}
                onChange={(event) => setAgeMin(event.target.value)}
                className="h-[52px] w-full rounded-[12px] border border-[#1E1E1E] bg-[#111111] px-3 text-base text-white outline-none"
              />
              <input
                type="number"
                min={18}
                max={99}
                placeholder="Âge max"
                value={ageMax}
                onChange={(event) => setAgeMax(event.target.value)}
                className="h-[52px] w-full rounded-[12px] border border-[#1E1E1E] bg-[#111111] px-3 text-base text-white outline-none"
              />
            </div>
          ) : (
            <Link
              href="/abonnement"
              className="rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-4"
            >
              <p className="text-sm font-bold text-white">Filtres avancés</p>
              <p className="mt-1 text-sm text-[#888888]">
                Identité, âge et zone — réservés à QUTE+.
              </p>
            </Link>
          )}
          {filteredProfiles.length === 0 ? (
          <p className="pt-16 text-center text-[#888888]">
            Bon… personne n&apos;a bougé. 😏
          </p>
        ) : (
          <div className="grid-responsive">
            {filteredProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                jeSors={jeSorsByUserId[profile.id] ?? null}
              />
            ))}
          </div>
        )}
        </div>
      ) : null}

      {tab === "salons" ? (
        <div className="flex flex-col gap-3">
          {canCreateSalon ? (
            <Link
              href="/salons/creer"
              className="flex h-[52px] items-center justify-center rounded-[12px] text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #FF2D87, #7B2FFF)" }}
            >
              Créer mon salon
            </Link>
          ) : (
            <article className="rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-6">
              <svg
                width={28}
                height={28}
                viewBox="0 0 24 24"
                fill="url(#salon-star)"
                aria-hidden
              >
                <defs>
                  <linearGradient id="salon-star" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF2D87" />
                    <stop offset="100%" stopColor="#7B2FFF" />
                  </linearGradient>
                </defs>
                <path d="M12 3 14.4 9.2 21 10l-4.2 3.9L18 21l-6-3.4L6 21l1.2-7.1L3 10l6.6-.8z" />
              </svg>
              <h2 className="mt-3 font-bold text-white">Crée ton propre salon</h2>
              <p className="mt-2 text-sm text-[#888888]">
                Réservé aux membres QUTE+ et QUTE Club.
              </p>
              <Link
                href="/abonnement"
                className="mt-4 flex h-[52px] items-center justify-center rounded-[12px] text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #FF2D87, #7B2FFF)" }}
              >
                Découvrir QUTE+
              </Link>
            </article>
          )}
          {salons.length === 0 ? (
            <p className="pt-8 text-center text-[#888888]">
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
          )}
        </div>
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
          <div className="tabs-scroll flex gap-2">
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
                  <p className="mt-1 text-xs text-[#888888]">
                    ❤️ {lieuLikeCounts[lieu.id] ?? 0}
                  </p>
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
