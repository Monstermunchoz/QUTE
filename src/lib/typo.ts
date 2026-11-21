/**
 * Typographie française : espace insécable avant « : ; ? ! » et à l'intérieur des guillemets,
 * pour qu'un signe ne se retrouve jamais seul en début de ligne.
 * S'applique à tout le texte affiché, y compris celui ajouté plus tard (MutationObserver).
 */
const NBSP = ' '
const RE_AVANT = / ([:;?!»])/g
const RE_APRES = /« /g

function corriger(t: Text) {
  const v = t.nodeValue
  if (!v || (!v.includes(' ') && !v.includes('«'))) return
  const n = v.replace(RE_AVANT, `${NBSP}$1`).replace(RE_APRES, `«${NBSP}`)
  if (n !== v) t.nodeValue = n
}

function parcourir(racine: Node) {
  if (racine.nodeType === Node.TEXT_NODE) return corriger(racine as Text)
  const tag = (racine as Element).tagName
  if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA') return
  const w = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT)
  let n: Node | null
  while ((n = w.nextNode())) {
    const p = n.parentElement?.tagName
    if (p !== 'SCRIPT' && p !== 'STYLE' && p !== 'TEXTAREA') corriger(n as Text)
  }
}

export function typographieFrancaise(racine: HTMLElement = document.body) {
  parcourir(racine)
  new MutationObserver((muts) => {
    for (const m of muts) {
      if (m.type === 'characterData') corriger(m.target as Text)
      else m.addedNodes.forEach(parcourir)
    }
  }).observe(racine, { subtree: true, childList: true, characterData: true })
}
