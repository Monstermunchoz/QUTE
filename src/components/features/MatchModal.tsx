type MatchModalProps = {
  open: boolean;
  onClose: () => void;
  onSeeMatches: () => void;
};

export function MatchModal({ open, onClose, onSeeMatches }: MatchModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-title"
    >
      <div className="modal-shell rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-6 text-center">
        <p id="match-title" className="text-2xl font-bold text-white">
          C&apos;est un match ! 🎉
        </p>
        <p className="mt-2 text-sm text-[#888888]">
          Vous vous êtes QRUSHé·es. La suite, c&apos;est pour le chat.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onSeeMatches}
            className="flex h-[52px] w-full items-center justify-center rounded-[12px] text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #FF2D87, #7B2FFF)" }}
          >
            Voir mes matchs
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-[52px] w-full rounded-[12px] text-sm font-bold text-[#888888]"
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
}
