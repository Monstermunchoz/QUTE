export type PhotoStatus = "pending" | "approved" | "rejected";

export type Profile = {
  id: string;
  pseudo: string;
  bio: string | null;
  ville: string | null;
  zone: string | null;
  age_visible: boolean;
  date_naissance: string | null;
  photo_url: string | null;
  photo_status: PhotoStatus;
  compte_verifie: boolean;
  role: "user" | "moderateur" | "admin";
  abonnement?: "gratuit" | "qute_plus" | "qute_club";
  abonnement_statut?: "inactif" | "essai" | "actif" | "annule" | "impaye";
  abonnement_fin?: string | null;
  essai_utilise?: boolean;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  mode_discret?: boolean;
  identites: string[];
  orientations: string[];
  ce_que_je_cherche: string | null;
  interets: string[];
  pronoms?: string | null;
  recherche?: string[];
  langues?: string[];
  instagram?: string | null;
  visibilite_identites?: "public" | "matchs" | "prive";
  visibilite_orientations?: "public" | "matchs" | "prive";
  banni?: boolean;
  email_banni?: string | null;
  created_at: string;
  updated_at: string;
};

export type AlbumPhoto = {
  id: string;
  user_id: string;
  url: string;
  ordre: number;
  statut: PhotoStatus;
  created_at: string;
};

export type Qrush = {
  id: string;
  envoyeur_id: string;
  receveur_id: string;
  created_at: string;
};

export type Match = {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
};

export type Block = {
  id: string;
  bloqueur_id: string;
  bloque_id: string;
  created_at: string;
};

export type Conversation = {
  id: string;
  match_id: string | null;
  statut: "en_attente" | "acceptee" | "ignoree";
  initiateur_id: string | null;
  destinataire_id: string | null;
  created_at: string;
};

export type LieuCategorie =
  | "bar"
  | "club"
  | "sauna"
  | "cafe"
  | "association"
  | "commerce"
  | "culture"
  | "exterieur"
  | "autre";

export type Lieu = {
  id: string;
  nom: string;
  categorie: LieuCategorie | null;
  adresse: string | null;
  ville: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  site_web: string | null;
  instagram: string | null;
  est_verifie: boolean;
  created_at: string;
};

export type LikeLieu = {
  id: string;
  lieu_id: string;
  user_id: string;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  conversation_id: string;
  auteur_id: string;
  contenu: string;
  created_at: string;
  a_verifier?: boolean;
  trust_score?: number;
  trust_categorie?: string | null;
  masque?: boolean;
};

export type Salon = {
  id: string;
  nom: string;
  description: string | null;
  theme: string | null;
  region: string | null;
  est_public: boolean;
  createur_id?: string | null;
  created_at: string;
};

export type SalonMessage = {
  id: string;
  salon_id: string;
  auteur_id: string;
  contenu: string;
  created_at: string;
  a_verifier?: boolean;
  trust_score?: number;
  trust_categorie?: string | null;
  masque?: boolean;
};

export type Groupe = {
  id: string;
  nom: string;
  description: string | null;
  createur_id: string;
  est_prive: boolean;
  created_at: string;
};

export type GroupeMembre = {
  id: string;
  groupe_id: string;
  user_id: string;
  role: "admin" | "moderateur" | "membre";
  joined_at: string;
};

export type EvenementCategorie =
  | "soiree"
  | "concert"
  | "culture"
  | "sport"
  | "rencontre"
  | "association"
  | "autre";

export type EvenementStatut = "pending" | "publie" | "refuse";

export type Evenement = {
  id: string;
  titre: string;
  description: string | null;
  lieu_id: string | null;
  lieu_nom: string | null;
  adresse: string | null;
  date_debut: string;
  date_fin: string | null;
  createur_id: string | null;
  statut: EvenementStatut;
  categorie: EvenementCategorie | null;
  image_url: string | null;
  max_participants: number | null;
  created_at: string;
};

export type ParticipationStatut = "interesse" | "participe" | "absent";

export type Participation = {
  id: string;
  evenement_id: string;
  user_id: string;
  statut: ParticipationStatut;
  created_at: string;
};

export type JeSorsStatut =
  | "je_sors"
  | "disponible"
  | "a_un_evenement"
  | "dans_un_lieu";

export type JeSorsVisibilite = "tous" | "matchs" | "groupe";

export type JeSors = {
  id: string;
  user_id: string;
  statut: JeSorsStatut;
  evenement_id: string | null;
  lieu_id: string | null;
  lieu_libre?: string | null;
  message: string | null;
  zone: string | null;
  visibilite: JeSorsVisibilite;
  expires_at: string;
  created_at: string;
};

export type SignalementType = "profil" | "message" | "salon" | "evenement" | "autre";
export type SignalementStatut = "en_attente" | "traite" | "rejete";

export type Signalement = {
  id: string;
  rapporteur_id: string;
  cible_id: string;
  type: SignalementType;
  raison: string;
  statut: SignalementStatut;
  note_admin: string | null;
  created_at: string;
};

export type AmiStatut = "en_attente" | "accepte" | "refuse";

export type Ami = {
  id: string;
  demandeur_id: string;
  destinataire_id: string;
  statut: AmiStatut;
  created_at: string;
};

export type NotificationType =
  | "match"
  | "message"
  | "message_attente"
  | "evenement"
  | "salon"
  | "systeme";

export type AppNotification = {
  id: string;
  user_id: string;
  type: NotificationType;
  titre: string;
  contenu: string | null;
  lien: string | null;
  lu: boolean;
  created_at: string;
};

