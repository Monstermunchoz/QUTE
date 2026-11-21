/** Vrai si l'appli est lancée depuis l'écran d'accueil (installée). */
export const estInstallee = () =>
  matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
