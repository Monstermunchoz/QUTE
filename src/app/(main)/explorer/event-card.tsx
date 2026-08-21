import Link from "next/link";
import { InterestButton } from "./interest-button";
import { eventCategoryLabel } from "@/lib/events/categories";
import { formatEventDate } from "@/lib/utils/event-date";
import type { Evenement, ParticipationStatut } from "@/types";

type EventCardProps = {
  event: Evenement;
  interestedCount: number;
  currentUserId: string;
  myStatut: ParticipationStatut | null;
};

export function EventCard({
  event,
  interestedCount,
  currentUserId,
  myStatut,
}: EventCardProps) {
  const lieuLine = [event.lieu_nom, event.adresse].filter(Boolean).join(" · ");

  return (
    <article className="flex flex-col gap-3 rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-4">
      <Link href={`/evenements/${event.id}`} className="flex flex-col gap-2">
        <h2 className="font-bold text-white">{event.titre}</h2>
        <p className="font-bold text-white">{formatEventDate(event.date_debut)}</p>
        {lieuLine ? <p className="text-sm text-[#888888]">{lieuLine}</p> : null}
        {event.categorie ? (
          <span className="w-fit rounded-[8px] bg-[#1E1E1E] px-2 py-1 text-xs text-[#FF2D87]">
            {eventCategoryLabel(event.categorie)}
          </span>
        ) : null}
        <p className="text-sm text-[#888888]">
          {interestedCount} intéressé{interestedCount > 1 ? "s" : ""}
        </p>
      </Link>
      <InterestButton
        evenementId={event.id}
        currentUserId={currentUserId}
        initialStatut={myStatut}
      />
    </article>
  );
}
