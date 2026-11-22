import './landing.css'
import { logoSvg } from '../brand'
import { typographieFrancaise } from '../lib/typo'

const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s)
const $$ = <T extends Element = HTMLElement>(s: string) => Array.from(document.querySelectorAll<T>(s))

$$('[data-logo]').forEach((el) => (el.innerHTML = logoSvg(15)))


/* Le bouton d'installation de l'en-tête mobile renvoie vers l'accueil */
$$('[data-install]').forEach((b) => b.addEventListener('click', () => (location.href = '/#contenu')))

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

/* Barre de navigation */
const nav = $('#nav')
const surDefilement = () => nav?.classList.toggle('scrolled', scrollY > 30)
addEventListener('scroll', surDefilement, { passive: true })
surDefilement()

/* Apparitions progressives */
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (!e.isIntersecting) return
      e.target.classList.add('vu')
      io.unobserve(e.target)
    }),
  { rootMargin: '0px 0px -8% 0px' },
)
$$('.reveal').forEach((el) => io.observe(el))

typographieFrancaise()
