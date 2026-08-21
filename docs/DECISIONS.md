# QUTE — Décisions produit validées

## Auth
Email + mot de passe. Magic link et social login post-MVP.

## QRUSH (action like)
Nom officiel : QRUSH. Notification au match uniquement, pas au QRUSH.

## JE SORS
Durée personnalisée. Suggestions : 1h, 2h, 3h, toute la nuit.
SQL : expires_at > now() pour statut actif.

## Profil — Âge
L'utilisateur choisit d'afficher ou non son âge.

## Événements
Ouvert à tous. Modération avant publication (statut pending).

## Géo pilote
Lyon Métropole, 59 communes. Région → Département → Ville → Zone.

## Salons / Groupes
Création réservée aux comptes vérifiés.

## Captcha
Cloudflare Turnstile (invisible).

## Thème
Dark par défaut. Toggle light/dark.

## GPS
Aucune position précise publique. Carte Leaflet = lieux uniquement.

## Photos
Statut pending avant discovery.

## RLS
Deny-by-default sur toutes les tables dès création.

## Chat
N'importe qui peut envoyer UN premier message sans match.
Le destinataire voit "Tu as un message en attente" et peut Accepter ou Ignorer.
Si match → conversation ouverte automatiquement, sans demande.

## CE SOIR
Service d'agrégation, pas de table maître.

## Hors MVP
Premium, Shop, QUTE Box, espace pro, Stripe, marketplace,
Safety Plan complet, vérification lourde, social login.
