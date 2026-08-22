type BadgeAbonnementProps = {
  abonnement?: string | null;
};

export function BadgeAbonnement({ abonnement }: BadgeAbonnementProps) {
  if (abonnement === "qute_club") {
    return (
      <span
        className="inline-flex items-center rounded-[6px] px-2 py-0.5 text-[11px] font-bold text-black"
        style={{ background: "linear-gradient(135deg, #FFB800, #FF6B2B)" }}
      >
        Club
      </span>
    );
  }

  if (abonnement === "qute_plus") {
    return (
      <span
        className="inline-flex items-center rounded-[6px] px-2 py-0.5 text-[11px] font-bold text-white"
        style={{ background: "linear-gradient(135deg, #FF2D87, #7B2FFF)" }}
      >
        QUTE+
      </span>
    );
  }

  return null;
}
