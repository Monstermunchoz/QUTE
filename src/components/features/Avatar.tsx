import type { CSSProperties } from "react";

type AvatarSize = "xs" | "sm" | "member" | "md" | "drawer" | "lg" | "xl";

const SIZE_PX: Record<AvatarSize, number> = {
  xs: 32,
  sm: 40,
  member: 44,
  md: 64,
  drawer: 56,
  lg: 96,
  xl: 120,
};

type AvatarProps = {
  pseudo: string;
  photoUrl?: string | null;
  size: AvatarSize;
  abonnement?: string | null;
  role?: string | null;
};

function ringStyle(
  role?: string | null,
  abonnement?: string | null,
): CSSProperties {
  if (role === "admin") {
    return { boxShadow: "0 0 0 2px #FFB800" };
  }

  const color =
    abonnement === "qute_club"
      ? "#FFB800"
      : abonnement === "qute_plus"
        ? "#FF2D87"
        : "#333333";

  return { border: `2px solid ${color}` };
}

export function Avatar({
  pseudo,
  photoUrl,
  size,
  abonnement,
  role,
}: AvatarProps) {
  const px = SIZE_PX[size];
  const initial = (pseudo?.trim()?.charAt(0) || "?").toUpperCase();
  const ring = ringStyle(role, abonnement);

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={pseudo}
        width={px}
        height={px}
        className="box-border shrink-0 object-cover"
        style={{
          width: px,
          height: px,
          borderRadius: "50%",
          ...ring,
        }}
      />
    );
  }

  return (
    <div
      aria-hidden
      className="box-border flex shrink-0 items-center justify-center font-bold text-white"
      style={{
        width: px,
        height: px,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #FF2D87, #7B2FFF)",
        fontSize: px * 0.4,
        ...ring,
      }}
    >
      {initial}
    </div>
  );
}
