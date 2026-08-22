export function formatEventDate(iso: string) {
  const date = new Date(iso);
  const weekday = date.toLocaleDateString("fr-FR", {
    weekday: "long",
    timeZone: "Europe/Paris",
  });
  const dayMonth = date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Paris",
  });
  const time = date.toLocaleTimeString("fr-FR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Paris",
  });
  const [hours, minutes] = time.split(":");
  const hourLabel =
    minutes === "00" ? `${Number(hours)}h` : `${Number(hours)}h${minutes}`;
  const label = `${weekday} ${dayMonth} à ${hourLabel}`;

  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function parisYmd(date: Date) {
  return date.toLocaleDateString("en-CA", { timeZone: "Europe/Paris" });
}

function parisWeekday(date: Date) {
  const weekday = date.toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "Europe/Paris",
  });

  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
}

export function addDaysYmd(ymd: string, days: number) {
  const [year, month, day] = ymd.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));

  return next.toISOString().slice(0, 10);
}

export function isEventTonight(iso: string) {
  return parisYmd(new Date(iso)) === parisYmd(new Date());
}

/** True if the event starts today (Paris) or is still ongoing during today. */
export function eventOverlapsParisDay(
  event: { date_debut: string; date_fin?: string | null },
  dayStart: Date,
  dayEnd: Date,
) {
  const debut = new Date(event.date_debut).getTime();
  const fin = event.date_fin
    ? new Date(event.date_fin).getTime()
    : debut;

  return debut < dayEnd.getTime() && fin >= dayStart.getTime();
}

export function isEventThisWeek(iso: string) {
  const event = new Date(iso);

  if (event.getTime() < Date.now()) {
    return false;
  }

  const today = parisYmd(new Date());
  const eventDay = parisYmd(event);
  const daysUntilSunday = (7 - parisWeekday(new Date())) % 7;
  const sunday = addDaysYmd(today, daysUntilSunday);

  return eventDay >= today && eventDay <= sunday;
}
