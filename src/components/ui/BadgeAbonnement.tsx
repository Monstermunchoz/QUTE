type BadgeAbonnementProps = {
  abonnement?: string | null;
  role?: string | null;
};

const pill =
  "inline-flex items-center rounded-[20px] px-2 py-[3px] text-[11px] font-bold leading-none";

export function BadgeAbonnement({ abonnement, role }: BadgeAbonnementProps) {
  if (role === "admin") {
    return (
      <span
        className={`${pill} text-black`}
        style={{ background: "linear-gradient(135deg, #FFB800, #FF6B2B)" }}
      >
        QUTE Admin
      </span>
    );
  }

  if (role === "moderateur") {
    return (
      <span className={`${pill} bg-[#333333] text-[#FF2D87]`}>Modérateur</span>
    );
  }

  if (abonnement === "qute_club") {
    return (
      <span
        className={`${pill} text-[#FFB800]`}
        style={{ background: "transparent", border: "1px solid #FFB800" }}
      >
        ✦ QUTE Club
      </span>
    );
  }

  if (abonnement === "qute_plus") {
    return (
      <span
        className={`${pill} tracking-[0.08em] text-[#FF2D87]`}
        style={{ background: "transparent", border: "1px solid #FF2D87" }}
      >
        QUTE+
      </span>
    );
  }

  return null;
}
