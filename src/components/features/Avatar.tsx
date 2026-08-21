type AvatarSize = "sm" | "md" | "lg" | "xl";

const SIZE_PX: Record<AvatarSize, number> = {
  sm: 40,
  md: 64,
  lg: 96,
  xl: 120,
};

type AvatarProps = {
  pseudo: string;
  photoUrl?: string | null;
  size: AvatarSize;
};

export function Avatar({ pseudo, photoUrl, size }: AvatarProps) {
  const px = SIZE_PX[size];
  const initial = (pseudo?.trim()?.charAt(0) || "?").toUpperCase();

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={pseudo}
        width={px}
        height={px}
        className="shrink-0 object-cover"
        style={{ width: px, height: px, borderRadius: "50%" }}
      />
    );
  }

  return (
    <div
      aria-hidden
      className="flex shrink-0 items-center justify-center font-bold text-white"
      style={{
        width: px,
        height: px,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #FF2D87, #7B2FFF)",
        fontSize: px * 0.4,
      }}
    >
      {initial}
    </div>
  );
}
