"use client";

import { useMemo, useState } from "react";
import { EventCard } from "./event-card";
import { isEventThisWeek, isEventTonight } from "@/lib/utils/event-date";
import type { Evenement, Participation, ParticipationStatut } from "@/types";

type EventFilter =
  | "tous"
  | "ce_soir"
  | "cette_semaine"
  | "soiree"
  | "culture"
  | "rencontre";

const FILTERS: { id: EventFilter; label: string }[] = [
  { id: "tous", label: "Tous" },
  { id: "ce_soir", label: "Ce soir" },
  { id: "cette_semaine", label: "Cette semaine" },
  { id: "soiree", label: "Soirées" },
  { id: "culture", label: "Culture" },
  { id: "rencontre", label: "Rencontres" },
];

type EventsTabProps = {
  evenements: Evenement[];
  participations: Participation[];
  currentUserId: string;
};

export function EventsTab({
  evenements,
  participations,
  currentUserId,
}: EventsTabProps) {
  const [filter, setFilter] = useState<EventFilter>("tous");

  const filtered = useMemo(() => {
    return evenements.filter((event) => {
      if (filter === "ce_soir") {
        return isEventTonight(event.date_debut);
      }

      if (filter === "cette_semaine") {
        return isEventThisWeek(event.date_debut);
      }

      if (filter === "soiree" || filter === "culture" || filter === "rencontre") {
        return event.categorie === filter;
      }

      return true;
    });
  }, [evenements, filter]);

  function interestedCount(eventId: string) {
    return participations.filter(
      (item) =>
        item.evenement_id === eventId &&
        (item.statut === "interesse" || item.statut === "participe"),
    ).length;
  }

  function myStatut(eventId: string): ParticipationStatut | null {
    return (
      participations.find(
        (item) =>
          item.evenement_id === eventId && item.user_id === currentUserId,
      )?.statut ?? null
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 overflow-x-auto">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
              filter === item.id ? "text-[#FF2D87]" : "text-[#888888]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="pt-8 text-center text-[#888888]">
          Rien de prévu pour l&apos;instant.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((event) => (
            <li key={event.id}>
              <EventCard
                event={event}
                interestedCount={interestedCount(event.id)}
                currentUserId={currentUserId}
                myStatut={myStatut(event.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
