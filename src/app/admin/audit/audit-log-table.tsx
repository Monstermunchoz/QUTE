"use client";

import { useMemo, useState } from "react";

type AuditItem = {
  id: string;
  admin_id: string | null;
  adminPseudo: string;
  action: string;
  cible_type: string | null;
  cible_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

const ACTION_FILTERS: { id: string; label: string }[] = [
  { id: "tous", label: "Tous" },
  { id: "bannir", label: "Bannir" },
  { id: "supprimer", label: "Supprimer" },
  { id: "approuver_photo", label: "Approuver photo" },
  { id: "rejeter_photo", label: "Rejeter photo" },
  { id: "publier_evenement", label: "Publier événement" },
  { id: "refuser_evenement", label: "Refuser événement" },
  { id: "traiter_signalement", label: "Signalement" },
];

const ACTION_LABELS: Record<string, string> = {
  bannir: "Bannir",
  supprimer: "Supprimer",
  approuver_photo: "Approuver photo",
  rejeter_photo: "Rejeter photo",
  publier_evenement: "Publier événement",
  refuser_evenement: "Refuser événement",
  traiter_signalement: "Traiter signalement",
};

function formatDetails(details: Record<string, unknown> | null) {
  if (!details || Object.keys(details).length === 0) {
    return "—";
  }

  const parts: string[] = [];
  if (typeof details.pseudo === "string" && details.pseudo) {
    parts.push(details.pseudo);
  }
  if (typeof details.titre === "string" && details.titre) {
    parts.push(details.titre);
  }
  if (typeof details.decision === "string" && details.decision) {
    parts.push(details.decision);
  }
  if (typeof details.raison === "string" && details.raison) {
    parts.push(details.raison);
  }
  if (typeof details.kind === "string" && details.kind) {
    parts.push(details.kind);
  }
  if (typeof details.email === "string" && details.email) {
    parts.push(details.email);
  }

  return parts.length > 0 ? parts.join(" · ") : JSON.stringify(details);
}

type AuditLogTableProps = {
  items: AuditItem[];
};

export function AuditLogTable({ items }: AuditLogTableProps) {
  const [filter, setFilter] = useState("tous");

  const visible = useMemo(() => {
    if (filter === "tous") {
      return items;
    }
    return items.filter((item) => item.action === filter);
  }, [filter, items]);

  return (
    <div className="flex flex-col gap-4">
      <div className="tabs-scroll flex gap-2">
        {ACTION_FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
              filter === item.id ? "text-[#FF2D87]" : "text-[#888888]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-[15px] text-[#888888]">Aucune action enregistrée.</p>
      ) : (
        <div className="overflow-x-auto rounded-[16px] border border-[#1E1E1E]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#111111] text-[#888888]">
              <tr>
                <th className="whitespace-nowrap px-3 py-3 font-bold">Date</th>
                <th className="whitespace-nowrap px-3 py-3 font-bold">Admin</th>
                <th className="whitespace-nowrap px-3 py-3 font-bold">Action</th>
                <th className="whitespace-nowrap px-3 py-3 font-bold">Cible</th>
                <th className="whitespace-nowrap px-3 py-3 font-bold">Détails</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <tr key={item.id} className="border-t border-[#1E1E1E]">
                  <td className="whitespace-nowrap px-3 py-3 text-[#CCCCCC]">
                    {new Date(item.created_at).toLocaleString("fr-FR")}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-white">
                    {item.adminPseudo}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-white">
                    {ACTION_LABELS[item.action] ?? item.action}
                  </td>
                  <td className="px-3 py-3 text-[#CCCCCC]">
                    {item.cible_type ?? "—"}
                    {item.cible_id ? (
                      <span className="mt-0.5 block max-w-[140px] truncate text-xs text-[#666666]">
                        {item.cible_id}
                      </span>
                    ) : null}
                  </td>
                  <td className="max-w-[240px] break-words px-3 py-3 text-[#CCCCCC]">
                    {formatDetails(item.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
