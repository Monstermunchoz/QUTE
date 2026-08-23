"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Flagged = {
  id: string;
  source: "prive" | "salon";
  auteurId: string;
  pseudo: string;
  extrait: string;
  contenu: string;
  categorie: string | null;
  score: number;
  createdAt: string;
  conversationId: string | null;
  salonId: string | null;
};

type QuarantineItem = {
  id: string;
  auteurId: string;
  pseudo: string;
  extrait: string;
  contenu: string;
  categorie: string | null;
  score: number;
  createdAt: string;
  conversationId: string | null;
  salonId: string | null;
};

type RuleItem = {
  id: string;
  pattern: string;
  categorie: string;
  poids: number;
  actif: boolean;
};

const CATEGORIES = [
  "drogue",
  "arme",
  "arnaque",
  "menace",
  "harcelement",
  "mineur",
  "spam",
  "lien_suspect",
];

type TabId = "verifier" | "quarantaine" | "regles";

type ModerationHubProps = {
  flagged: Flagged[];
  quarantaine: QuarantineItem[];
  rules: RuleItem[];
};

type ContexteLine = { id: string; auteur: string; contenu: string; mine: boolean };

export function ModerationHub({
  flagged,
  quarantaine,
  rules,
}: ModerationHubProps) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("verifier");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [context, setContext] = useState<ContexteLine[] | null>(null);
  const [pattern, setPattern] = useState("");
  const [categorie, setCategorie] = useState("spam");
  const [poids, setPoids] = useState(1);

  async function post(url: string, body: Record<string, unknown>) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    if (!response.ok) {
      throw new Error(payload?.error ?? "Action impossible.");
    }
  }

  async function onFlagged(item: Flagged, action: "innocenter" | "masquer" | "supprimer") {
    setLoading(`${item.id}-${action}`);
    setError(null);
    try {
      await post("/api/admin/moderation/message", {
        source: item.source,
        messageId: item.id,
        action,
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action impossible.");
    }
    setLoading(null);
  }

  async function onQuarantine(item: QuarantineItem, action: "innocenter" | "supprimer") {
    setLoading(`${item.id}-${action}`);
    setError(null);
    try {
      await post("/api/admin/moderation/quarantaine", { id: item.id, action });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action impossible.");
    }
    setLoading(null);
  }

  async function loadContext(item: Flagged) {
    if (openId === item.id) {
      setOpenId(null);
      setContext(null);
      return;
    }

    setOpenId(item.id);
    setContext(null);
    const supabase = createClient();

    if (item.source === "prive" && item.conversationId) {
      const { data } = await supabase
        .from("messages")
        .select("id, auteur_id, contenu, created_at")
        .eq("conversation_id", item.conversationId)
        .order("created_at", { ascending: true })
        .limit(40);
      setContext(
        ((data ?? []) as { id: string; auteur_id: string; contenu: string }[]).map(
          (row) => ({
            id: row.id,
            auteur: row.auteur_id,
            contenu: row.contenu,
            mine: row.id === item.id,
          }),
        ),
      );
      return;
    }

    if (item.salonId) {
      const { data } = await supabase
        .from("salon_messages")
        .select("id, auteur_id, contenu, created_at")
        .eq("salon_id", item.salonId)
        .order("created_at", { ascending: true })
        .limit(40);
      setContext(
        ((data ?? []) as { id: string; auteur_id: string; contenu: string }[]).map(
          (row) => ({
            id: row.id,
            auteur: row.auteur_id,
            contenu: row.contenu,
            mine: row.id === item.id,
          }),
        ),
      );
    }
  }

  async function toggleRule(rule: RuleItem) {
    setLoading(rule.id);
    setError(null);
    try {
      await post("/api/admin/moderation/regles", {
        action: "toggle",
        id: rule.id,
        actif: !rule.actif,
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action impossible.");
    }
    setLoading(null);
  }

  async function addRule() {
    setLoading("create");
    setError(null);
    try {
      await post("/api/admin/moderation/regles", {
        action: "create",
        pattern,
        categorie,
        poids,
      });
      setPattern("");
      setPoids(1);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action impossible.");
    }
    setLoading(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="tabs-scroll flex gap-2">
        {(
          [
            { id: "verifier", label: "À vérifier" },
            { id: "quarantaine", label: "Quarantaine" },
            { id: "regles", label: "Règles" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
              tab === item.id ? "text-[#FF2D87]" : "text-[#888888]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? <p className="text-sm text-[#FF4444]">{error}</p> : null}

      {tab === "verifier" ? (
        flagged.length === 0 ? (
          <p className="text-[15px] text-[#888888]">Aucun message à vérifier.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {flagged.map((item) => (
              <li
                key={`${item.source}-${item.id}`}
                className="rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-4"
              >
                <button
                  type="button"
                  onClick={() => void loadContext(item)}
                  className="w-full text-left"
                >
                  <p className="font-bold text-white">{item.pseudo}</p>
                  <p className="mt-1 text-sm text-[#CCCCCC]">{item.extrait}</p>
                  <p className="mt-2 text-xs text-[#888888]">
                    {item.categorie ?? "—"} · score {item.score} ·{" "}
                    {new Date(item.createdAt).toLocaleString("fr-FR")} ·{" "}
                    {item.source === "salon" ? "salon" : "privé"}
                  </p>
                </button>
                {openId === item.id ? (
                  <div className="mt-3 max-h-56 overflow-y-auto rounded-[12px] bg-black/40 p-3 text-sm text-[#CCCCCC]">
                    {context === null ? (
                      <p>Chargement…</p>
                    ) : context.length === 0 ? (
                      <p>{item.contenu}</p>
                    ) : (
                      context.map((line) => (
                        <p
                          key={line.id}
                          className={`mb-2 ${line.mine ? "font-bold text-[#FF2D87]" : ""}`}
                        >
                          {line.contenu}
                        </p>
                      ))
                    )}
                  </div>
                ) : null}
                <div className="mt-3 flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={Boolean(loading)}
                    onClick={() => void onFlagged(item, "innocenter")}
                    className="h-[52px] w-full rounded-[12px] bg-[#22C55E] text-base font-bold text-white disabled:opacity-50"
                  >
                    Innocenter
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(loading)}
                    onClick={() => void onFlagged(item, "masquer")}
                    className="h-[52px] w-full rounded-[12px] border border-[#1E1E1E] text-base font-bold text-white disabled:opacity-50"
                  >
                    Masquer
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(loading)}
                    onClick={() => void onFlagged(item, "supprimer")}
                    className="h-[52px] w-full rounded-[12px] bg-[#FF4444] text-base font-bold text-white disabled:opacity-50"
                  >
                    Supprimer
                  </button>
                  <Link
                    href="/admin/profils"
                    className="flex h-[52px] w-full items-center justify-center rounded-[12px] border border-[#1E1E1E] text-base font-bold text-white"
                  >
                    Bannir l&apos;auteur
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : null}

      {tab === "quarantaine" ? (
        quarantaine.length === 0 ? (
          <p className="text-[15px] text-[#888888]">File vide.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {quarantaine.map((item) => (
              <li
                key={item.id}
                className="rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-4"
              >
                <p className="font-bold text-white">{item.pseudo}</p>
                <p className="mt-1 text-sm text-[#CCCCCC]">{item.extrait}</p>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm text-white">
                  {item.contenu}
                </p>
                <p className="mt-2 text-xs text-[#888888]">
                  {item.categorie ?? "—"} · score {item.score} ·{" "}
                  {new Date(item.createdAt).toLocaleString("fr-FR")}
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={Boolean(loading)}
                    onClick={() => void onQuarantine(item, "innocenter")}
                    className="h-[52px] w-full rounded-[12px] bg-[#22C55E] text-base font-bold text-white disabled:opacity-50"
                  >
                    Innocenter + Envoyer
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(loading)}
                    onClick={() => void onQuarantine(item, "supprimer")}
                    className="h-[52px] w-full rounded-[12px] bg-[#FF4444] text-base font-bold text-white disabled:opacity-50"
                  >
                    Confirmer suppression
                  </button>
                  <Link
                    href="/admin/profils"
                    className="flex h-[52px] w-full items-center justify-center rounded-[12px] border border-[#1E1E1E] text-base font-bold text-white"
                  >
                    Bannir l&apos;auteur
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : null}

      {tab === "regles" ? (
        <div className="flex flex-col gap-4">
          <form
            className="flex flex-col gap-3 rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-4"
            onSubmit={(event) => {
              event.preventDefault();
              void addRule();
            }}
          >
            <p className="font-bold text-white">Ajouter une règle</p>
            <input
              value={pattern}
              onChange={(event) => setPattern(event.target.value)}
              placeholder="Pattern"
              className="h-[52px] rounded-[12px] border border-[#333333] bg-[#1E1E1E] px-4 text-[16px] text-white outline-none"
              required
            />
            <select
              value={categorie}
              onChange={(event) => setCategorie(event.target.value)}
              className="h-[52px] rounded-[12px] border border-[#333333] bg-[#1E1E1E] px-4 text-[16px] text-white"
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={poids}
              onChange={(event) => setPoids(Number(event.target.value))}
              className="h-[52px] rounded-[12px] border border-[#333333] bg-[#1E1E1E] px-4 text-[16px] text-white"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  Poids {value}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={loading === "create"}
              className="h-[52px] rounded-[12px] bg-[#FF2D87] text-base font-bold text-white disabled:opacity-50"
            >
              Ajouter une règle
            </button>
          </form>

          {rules.length === 0 ? (
            <p className="text-[15px] text-[#888888]">
              Aucune règle. Ajoute-les ici ou dans l&apos;éditeur SQL.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {rules.map((rule) => (
                <li
                  key={rule.id}
                  className="flex items-center justify-between gap-3 rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm text-white">{rule.pattern}</p>
                    <p className="mt-1 text-xs text-[#888888]">
                      {rule.categorie} · poids {rule.poids}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={Boolean(loading)}
                    onClick={() => void toggleRule(rule)}
                    className={`h-[52px] shrink-0 rounded-[12px] px-4 text-sm font-bold ${
                      rule.actif
                        ? "bg-[#22C55E] text-white"
                        : "border border-[#1E1E1E] text-[#888888]"
                    }`}
                  >
                    {rule.actif ? "Active" : "Off"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
