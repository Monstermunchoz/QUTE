"use client";

import { useState } from "react";
import Link from "next/link";
import { ProfileCard } from "@/components/features/ProfileCard";
import { formatEventDate } from "@/lib/utils/event-date";
import { eventCategoryLabel } from "@/lib/events/categories";
import type { Evenement, JeSorsStatut, Profile, Salon } from "@/types";

type Outing = {
  profile: Pick<Profile, "id" | "pseudo" | "ville" | "photo_url" | "abonnement" | "role">;
  statut: JeSorsStatut;
  zone: string | null;
  lieu: { id: string; nom: string } | null;
  lieuLibre: string | null;
  evenement: { id: string; titre: string } | null;
};

type CeSoirHubProps = {
  pseudo: string;
  peopleCount: number;
  eventsCount: number;
  lieuxCount: number;
  outings: Outing[];
  eventsTonight: Evenement[];
  salons: Salon[];
};

type FilterId = "tous" | "sorties" | "discussions" | "evenements";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "tous", label: "Tous" },
  { id: "sorties", label: "Sorties" },
  { id: "discussions", label: "Discussions" },
  { id: "evenements", label: "Événements" },
];

export function CeSoirHub({
  pseudo,
  peopleCount,
  eventsCount,
  lieuxCount,
  outings,
  eventsTonight,
  salons,
}: CeSoirHubProps) {
  const [filter, setFilter] = useState<FilterId>("tous");

  const showSorties = filter === "tous" || filter === "sorties";
  const showEvents = filter === "tous" || filter === "evenements";
  const showSalons = filter === "tous" || filter === "discussions";

  return (
    <main className="flex flex-col gap-6 pb-4">
      <header>
        <p className="text-sm text-[#888888]">Bienvenue {pseudo}</p>
        <h1 className="text-[26px] font-bold leading-tight text-white sm:text-[28px]">
          Ce soir à Lyon 🌙
        </h1>
      </header>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="min-w-0 rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-2 text-center sm:p-3">
          <p className="text-[28px] font-bold leading-none text-white">
            {peopleCount}
          </p>
          <p className="mt-2 text-[12px] leading-tight text-[#888888]">
            personnes sortent
          </p>
        </div>
        <div className="min-w-0 rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-2 text-center sm:p-3">
          <p className="text-[28px] font-bold leading-none text-white">
            {eventsCount}
          </p>
          <p className="mt-2 text-[12px] leading-tight text-[#888888]">
            événements ce soir
          </p>
        </div>
        <div className="min-w-0 rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-2 text-center sm:p-3">
          <p className="text-[28px] font-bold leading-none text-white">
            {lieuxCount}
          </p>
          <p className="mt-2 text-[12px] leading-tight text-[#888888]">
            lieux actifs
          </p>
        </div>
      </div>

      <div className="tabs-scroll flex gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
              filter === item.id ? "text-[#FF2D87]" : "text-[#888888]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {showSorties ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-[20px] font-bold text-white sm:text-lg">Ils sortent ce soir</h2>
          {outings.length === 0 ? (
            <p className="text-sm text-[#888888]">
              Personne n&apos;a encore allumé JE SORS.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {outings.map((item) => (
                <div key={item.profile.id} className="flex flex-col gap-2">
                  <ProfileCard
                    profile={item.profile}
                    jeSors={{ statut: item.statut, zone: item.zone }}
                  />
                  {item.lieu ? (
                    <Link
                      href={`/lieux/${item.lieu.id}`}
                      className="truncate text-center text-xs font-bold text-[#FF2D87]"
                    >
                      {item.lieu.nom}
                    </Link>
                  ) : item.lieuLibre ? (
                    <p className="truncate text-center text-xs text-[#888888]">
                      {item.lieuLibre}
                    </p>
                  ) : null}
                  {item.evenement ? (
                    <Link
                      href={`/evenements/${item.evenement.id}`}
                      className="truncate text-center text-xs font-bold text-[#FF2D87]"
                    >
                      À {item.evenement.titre}
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {showEvents ? (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-bold text-white sm:text-lg">Événements ce soir</h2>
            <Link
              href="/explorer?tab=evenements"
              className="text-sm font-bold text-[#FF2D87]"
            >
              Voir tout
            </Link>
          </div>
          {eventsTonight.length === 0 ? (
            <p className="text-sm text-[#888888]">Rien de prévu ce soir.</p>
          ) : (
            <ul className="flex w-full flex-col gap-3">
              {eventsTonight.map((event) => (
                <li key={event.id} className="min-w-0">
                  <Link
                    href={`/evenements/${event.id}`}
                    className="block w-full min-w-0 overflow-hidden rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-4"
                  >
                    <p className="font-bold text-white">{event.titre}</p>
                    <p className="mt-1 font-bold text-white">
                      {formatEventDate(event.date_debut)}
                    </p>
                    <p className="mt-1 text-sm text-[#888888]">
                      {event.lieu_nom || "Lyon"}
                    </p>
                    {event.categorie ? (
                      <span className="mt-2 inline-block rounded-[8px] bg-[#1E1E1E] px-2 py-1 text-xs text-[#FF2D87]">
                        {eventCategoryLabel(event.categorie)}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {showSalons ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-[20px] font-bold text-white sm:text-lg">Salons actifs</h2>
          {salons.length === 0 ? (
            <p className="text-sm text-[#888888]">Les salons sont calmes.</p>
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
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </main>
  );
}
