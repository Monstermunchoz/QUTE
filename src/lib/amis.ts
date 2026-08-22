import type { Ami } from "@/types";

export function otherAmiId(relation: Ami, userId: string) {
  return relation.demandeur_id === userId
    ? relation.destinataire_id
    : relation.demandeur_id;
}

export function friendLabel(relation: Ami | null, userId: string) {
  if (!relation) {
    return "Ajouter en ami";
  }

  if (relation.statut === "accepte") {
    return "Ami ✓";
  }

  if (relation.statut === "en_attente" && relation.demandeur_id === userId) {
    return "Demande envoyée";
  }

  if (relation.statut === "en_attente" && relation.destinataire_id === userId) {
    return "Demande reçue";
  }

  return "Ajouter en ami";
}

export function isFriendLocked(relation: Ami | null) {
  return Boolean(
    relation &&
      (relation.statut === "accepte" || relation.statut === "en_attente"),
  );
}
