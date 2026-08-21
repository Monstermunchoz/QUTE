import { addDaysYmd, parisYmd } from "@/lib/utils/event-date";
import type { JeSors, JeSorsStatut } from "@/types";

export const JE_SORS_STATUTS: { id: JeSorsStatut; label: string }[] = [
  { id: "je_sors", label: "Je sors" },
  { id: "disponible", label: "Disponible pour discuter" },
  { id: "a_un_evenement", label: "À un événement" },
  { id: "dans_un_lieu", label: "Dans un lieu" },
];

export function jeSorsLabel(statut: JeSorsStatut) {
  return JE_SORS_STATUTS.find((item) => item.id === statut)?.label ?? statut;
}

export function isJeSorsActive(row: Pick<JeSors, "expires_at"> | null | undefined) {
  if (!row) {
    return false;
  }

  return new Date(row.expires_at).getTime() > Date.now();
}

export function formatRemaining(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now();

  if (ms <= 0) {
    return null;
  }

  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.max(1, Math.round((ms % 3_600_000) / 60_000));

  if (hours >= 1) {
    return `encore ${hours}h`;
  }

  return `encore ${minutes} min`;
}

function parisAtHour(ymd: string, hour: number, minute = 0) {
  const stamp = `${ymd}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;

  for (const offset of ["+02:00", "+01:00"]) {
    const date = new Date(`${stamp}${offset}`);
    const localHour = Number(
      date.toLocaleString("en-GB", {
        timeZone: "Europe/Paris",
        hour: "numeric",
        hour12: false,
      }),
    );
    const localYmd = date.toLocaleDateString("en-CA", {
      timeZone: "Europe/Paris",
    });

    if (localHour === hour && localYmd === ymd) {
      return date;
    }
  }

  return new Date(`${stamp}+02:00`);
}

export function endOfNightParis() {
  const now = new Date();
  const ymd = parisYmd(now);
  const hour =
    Number(
      now.toLocaleString("en-GB", {
        timeZone: "Europe/Paris",
        hour: "numeric",
        hour12: false,
      }),
    ) % 24;
  const target = hour < 6 ? ymd : addDaysYmd(ymd, 1);

  return parisAtHour(target, 6, 0);
}

export function parisDayBounds() {
  const ymd = parisYmd(new Date());
  const start = parisAtHour(ymd, 0, 0);
  const end = parisAtHour(addDaysYmd(ymd, 1), 0, 0);

  return { start, end };
}
