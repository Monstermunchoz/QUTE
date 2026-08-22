"use client";

type OpenMapsButtonProps = {
  nom: string;
  adresse?: string | null;
};

export function openMaps(adresse: string, nom: string) {
  const query = encodeURIComponent(`${nom} ${adresse}`.trim());
  window.open(
    `https://www.google.com/maps/search/?api=1&query=${query}`,
    "_blank",
  );
}

function PinIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FF2D87"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" />
      <circle cx="12" cy="11" r="1.8" />
    </svg>
  );
}

export function OpenMapsButton({ nom, adresse }: OpenMapsButtonProps) {
  const name = nom.trim();
  const address = (adresse ?? "").trim();

  if (!name && !address) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        openMaps(address, name);
      }}
      className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[12px] border border-[#1E1E1E] bg-transparent text-base font-bold tracking-wide text-white"
    >
      <PinIcon />
      Ouvrir dans Google Maps
    </button>
  );
}
