import './landing.css'
import qrcode from 'qrcode-generator'
import { logoSvg } from '../brand'
import { LIEUX, SORTIES } from '../data/venues'
import { SOIREES } from '../data/events'
import { alias } from '../data/villes'
import { LEXIQUE } from '../data/lexique'
import { MAP_H, MAP_W, REGIONS } from '../data/regions'
import { project } from '../lib/geo'
import { typographieFrancaise } from '../lib/typo'

const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s)
const $$ = <T extends Element = HTMLElement>(s: string) => Array.from(document.querySelectorAll<T>(s))

const APP_URL = '/app/'

/* Logo et fraise */
$$('[data-logo]').forEach((el) => (el.innerHTML = logoSvg(15)))
const FRAISE = `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 7.2c4.6 0 7.6 1.9 7.6 5.2 0 4.2-4.6 8.6-7.6 8.6s-7.6-4.4-7.6-8.6c0-3.3 3-5.2 7.6-5.2z" fill="#ff4d5e"/><path d="M12 7.4c-1.6-2-3.6-2.6-5.4-2.1 1 .9 2.2 1.6 3.4 1.9-1.2.3-2.2 1-2.9 2 1.9.3 3.6-.2 4.9-1.3 1.3 1.1 3 1.6 4.9 1.3-.7-1-1.7-1.7-2.9-2 1.2-.3 2.4-1 3.4-1.9-1.8-.5-3.8.1-5.4 2.1z" fill="#3f7d4e"/><g fill="#ffd9a8"><circle cx="9" cy="12" r=".7"/><circle cx="12" cy="11" r=".7"/><circle cx="15" cy="12" r=".7"/><circle cx="10.5" cy="15" r=".7"/><circle cx="13.5" cy="15" r=".7"/><circle cx="12" cy="18" r=".7"/></g></svg>`
$$('[data-fraise]').forEach((el) => (el.innerHTML = FRAISE))

/* Chiffres réels tirés des données */
const compte: Record<string, number> = {
  lieux: SORTIES.length,
  clubs: SORTIES.filter((l) => l.type === 'club').length,
  saunas: SORTIES.filter((l) => l.type === 'sauna').length,
  cap: SORTIES.filter((l) => l.ville === "Cap d'Agde").length,
  shops: LIEUX.filter((l) => l.type === 'shop').length,
  soirees: SOIREES.length,
}
$$('[data-count]').forEach((el) => {
  const n = compte[el.dataset.count ?? '']
  if (n !== undefined) el.textContent = String(n)
})
const mots = $('[data-count="mots"]')
if (mots) mots.textContent = String(LEXIQUE.length)

/* Villes */
const parVille = SORTIES.reduce<Record<string, number>>((m, l) => ((m[alias(l.ville)] = (m[alias(l.ville)] ?? 0) + 1), m), {})
const villes = $('[data-villes]')
if (villes) {
  villes.innerHTML = Object.entries(parVille)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 14)
    .map(([v, n]) => `<a class="ville" href="${APP_URL}">${v} <span>${n}</span></a>`)
    .join('')
}

/* Carte */
const carte = $('[data-carte]')
if (carte) {
  const couleur = { club: '#d9294a', sauna: '#f1e6dc', bar: '#eba3ae', shop: '#a98bff' } as const
  const pins = SORTIES.map((l, i) => {
    const { x, y } = project(l.lng, l.lat)
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">${i % 7 === 0 ? `<circle class="pin" r="12" fill="${couleur[l.type]}" style="animation-delay:${(i % 5) * 0.5}s"/>` : ''}<circle r="6" fill="${couleur[l.type]}" stroke="#120c0e" stroke-width="2"/></g>`
  }).join('')
  const regions = REGIONS.map((r) => `<path d="${r.d}" fill="rgba(246,233,226,.05)" stroke="rgba(246,233,226,.2)" stroke-width="1.4"><title>${r.nom}</title></path>`).join('')
  carte.innerHTML = `<svg viewBox="0 0 ${MAP_W} ${MAP_H}" role="img" aria-label="Carte des clubs et saunas libertins en France">${regions}${pins}</svg>`
}

/* QR code vers l'appli */
const qr = $('[data-qr]')
if (qr) {
  const q = qrcode(0, 'M')
  q.addData(new URL(APP_URL, location.href).href)
  q.make()
  const n = q.getModuleCount()
  let d = ''
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`
  qr.innerHTML = `<svg viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"><path d="${d}" fill="#1a0e11"/></svg>`
}

/* Installation : invite native (Android/Chrome), guide (iPhone), sinon QR ou ouverture */
type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
let invite: InstallPrompt | null = null
addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  invite = e as InstallPrompt
})
const estIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
const estMobile = matchMedia('(max-width: 860px)').matches || estIOS
const sheet = $('[data-ios]')

$$('[data-install]').forEach((b) =>
  b.addEventListener('click', async () => {
    if (!b.closest('[data-modale-offre]')) basculerMenu(false)
    else fermerOffre()
    if (invite) {
      await invite.prompt()
      const { outcome } = await invite.userChoice
      invite = null
      if (outcome === 'accepted') location.href = APP_URL
    } else if (estIOS && sheet) {
      sheet.hidden = false
    } else if (!estMobile) {
      $('[data-qr-box]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else {
      location.href = APP_URL
    }
  }),
)
$$('[data-close]').forEach((b) => b.addEventListener('click', () => sheet && (sheet.hidden = true)))
addEventListener('keydown', (e) => e.key === 'Escape' && sheet && (sheet.hidden = true))

/* Tarifs : deux formules (QUTE, QUTE+) et trois durées */
type Duree = '1m' | '3m' | '12m'
type Plan = 'qute' | 'plus'
const TARIFS: Record<Plan, Record<Duree, { mois: string; facture: string; eco: string }>> = {
  qute: {
    '1m': { mois: '19,99 €', facture: 'Sans engagement', eco: '' },
    '3m': { mois: '15 €', facture: 'Facturé 44,99 € tous les 3 mois', eco: 'Vous économisez 25 %' },
    '12m': { mois: '10 €', facture: 'Facturé 119,99 € par an', eco: 'Vous économisez 50 %' },
  },
  plus: {
    '1m': { mois: '29,99 €', facture: 'Sans engagement', eco: '' },
    '3m': { mois: '25 €', facture: 'Facturé 74,99 € tous les 3 mois', eco: 'Vous économisez 17 %' },
    '12m': { mois: '16,67 €', facture: 'Facturé 199,99 € par an', eco: 'Vous économisez 44 %' },
  },
}
const LIBELLE_DUREE: Record<Duree, string> = { '1m': '1 mois', '3m': '3 mois', '12m': '12 mois' }
let duree: Duree = '3m'
const majPrix = () =>
  (Object.keys(TARIFS) as Plan[]).forEach((p) => {
    const t = TARIFS[p][duree]
    const prix = $(`[data-prix="${p}"]`)
    const facture = $(`[data-facture="${p}"]`)
    if (prix) prix.textContent = t.mois
    if (facture) facture.textContent = t.facture
  })
$$('[data-duree]').forEach((b) =>
  b.addEventListener('click', () => {
    duree = (b.dataset.duree as Duree) ?? '3m'
    $$('[data-duree]').forEach((x) => x.setAttribute('aria-checked', String(x === b)))
    majPrix()
  }),
)

const modale = $('[data-modale-offre]')
const fermerOffre = () => { if (modale) { modale.hidden = true; document.body.style.overflow = '' } }
$$('[data-offre]').forEach((b) =>
  b.addEventListener('click', () => {
    const plan = (b.dataset.offre as Plan) === 'plus' ? 'plus' : 'qute'
    const t = TARIFS[plan][duree]
    if (!modale) return
    $('[data-offre-plan]')!.textContent = plan === 'plus' ? 'QUTE+' : 'QUTE'
    $('[data-offre-titre]')!.textContent = LIBELLE_DUREE[duree]
    $('[data-offre-prix]')!.textContent = t.mois
    $('[data-offre-detail]')!.textContent = t.facture
    $('[data-offre-eco]')!.textContent = t.eco
    $$('[data-plus-seulement]').forEach((li) => (li.hidden = plan !== 'plus'))
    modale.hidden = false
    document.body.style.overflow = 'hidden'
  }),
)
$$('[data-fermer-offre]').forEach((b) => b.addEventListener('click', fermerOffre))
addEventListener('keydown', (e) => e.key === 'Escape' && fermerOffre())


const logoClair = $('[data-logo-clair]')
if (logoClair) logoClair.innerHTML = logoSvg(13, '#f6ede8')

/* Menu mobile */
const burger = $('[data-burger]')
const menu = $('[data-menu]')
const basculerMenu = (ouvrir: boolean) => {
  if (!menu || !burger) return
  menu.hidden = !ouvrir
  burger.setAttribute('aria-expanded', String(ouvrir))
  burger.setAttribute('aria-label', ouvrir ? 'Fermer le menu' : 'Ouvrir le menu')
  document.body.style.overflow = ouvrir ? 'hidden' : ''
}
burger?.addEventListener('click', () => basculerMenu(menu?.hidden === true))
$$('[data-close-menu]').forEach((a) => a.addEventListener('click', () => basculerMenu(false)))
addEventListener('keydown', (e) => e.key === 'Escape' && basculerMenu(false))

/* Barre de navigation qui se densifie au défilement */
const nav = $('#nav')
const surDefilement = () => nav?.classList.toggle('scrolled', scrollY > 30)
addEventListener('scroll', surDefilement, { passive: true })
surDefilement()

/* Apparitions progressives */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return
      const el = e.target as HTMLElement
      const freres = Array.from(el.parentElement?.children ?? []).filter((x) => x.classList.contains('reveal'))
      el.style.transitionDelay = `${Math.min(freres.indexOf(el), 5) * 70}ms`
      el.classList.add('vu')
      io.unobserve(el)
    })
  },
  { rootMargin: '0px 0px -8% 0px' },
)
$$('.reveal').forEach((el) => io.observe(el))

typographieFrancaise()
