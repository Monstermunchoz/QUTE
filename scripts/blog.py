"""Génère le blog statique de QUTE (« Le guide du libertinage »).

Sources : content/blog/*.md (en-tête « clé: valeur », puis « --- », puis Markdown).
Sorties :
  blog/index.html, blog/<slug>/index.html, blog/categorie/<cat>/index.html, blog/tag/<tag>/index.html
  public/blog/img/<slug>.svg (+ .png pour le partage), public/sitemap.xml, public/robots.txt

Lancer : python3 scripts/blog.py   (puis npm run build)
"""
import html
import json
import math
import re
import shutil
import subprocess
import unicodedata
from datetime import date
from pathlib import Path

import markdown

from illustrations import illustration

RACINE = Path(__file__).resolve().parent.parent
SITE = 'https://qute.fr'
AUJOURDHUI = date(2026, 11, 22).isoformat()

CATEGORIES = {
    'guide': ('Le guide', 'Les bases du libertinage : définitions, règles, lieux et conseils pour bien commencer.'),
    'pratiques': ('Pratiques', 'Échangisme, soft swap, mélangisme, triolisme, candaulisme : chaque pratique libertine expliquée en détail.'),
    'relations': ('Relations', 'Couple libre, polyamour : les modèles de relations ouvertes et comment les vivre sereinement.'),
    'jeux': ('Jeux & fantasmes', 'BDSM, exhibitionnisme, voyeurisme : les jeux entre adultes consentants, leurs codes et leurs règles.'),
}

ARTICLES = {
    'libertinage': ('guide', ['débutants', 'consentement', 'clubs', 'santé', 'légal']),
    'echangisme': ('pratiques', ['couple', 'clubs', 'débutants', 'jalousie']),
    'soft-swap': ('pratiques', ['couple', 'débutants', 'clubs']),
    'melangisme': ('pratiques', ['couple', 'débutants', 'clubs']),
    'candaulisme': ('pratiques', ['couple', 'fantasmes', 'jalousie']),
    'triolisme': ('pratiques', ['fantasmes', 'couple', 'consentement']),
    'couple-libre': ('relations', ['couple', 'jalousie', 'communication']),
    'polyamour': ('relations', ['communication', 'jalousie']),
    'bdsm': ('jeux', ['consentement', 'fantasmes', 'santé']),
    'exhibitionnisme': ('jeux', ['légal', 'fantasmes', 'clubs']),
    'voyeurisme': ('jeux', ['légal', 'fantasmes', 'clubs']),
}
POPULAIRES = ['libertinage', 'echangisme', 'triolisme', 'soft-swap', 'candaulisme']


def slugify(t: str) -> str:
    t = unicodedata.normalize('NFKD', t).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')


def lire(f: Path) -> dict:
    tete, corps = f.read_text().split('\n---\n', 1)
    meta = dict(l.split(': ', 1) for l in tete.strip().splitlines())
    meta['corps'] = corps
    meta['categorie'], meta['tags'] = ARTICLES[meta['slug']]
    return meta


def url(slug: str) -> str:
    return f'/blog/{slug}/'


def md_html(a: dict):
    texte = re.sub(r'\{\{([a-z-]+)\}\}', lambda m: url(m.group(1)), a['corps'])
    corps = markdown.markdown(texte, extensions=['toc'], extension_configs={'toc': {'slugify': lambda v, s: slugify(v)}})
    # liens externes : nouvel onglet (liens suivis, utiles au référencement)
    corps = re.sub(r'<a href="(https?://[^"]+)">', r'<a href="\1" target="_blank" rel="noopener">', corps)
    # encadré « En bref »
    corps = re.sub(r'(<h2 id="en-bref[^"]*">.*?)(?=<h2 )', r'<div class="en-bref">\1</div>\n', corps, count=1, flags=re.S)
    sommaire = re.findall(r'<h2 id="([^"]+)">(.*?)</h2>', corps)
    faq = []
    m = re.search(r'<h2 id="questions-frequentes[^"]*">.*?</h2>(.*?)(?=<h2 |\Z)', corps, flags=re.S)
    if m:
        for q, r in re.findall(r'<h3[^>]*>(.*?)</h3>\s*<p>(.*?)</p>', m.group(1), flags=re.S):
            faq.append((re.sub('<[^>]+>', '', q), re.sub('<[^>]+>', '', r)))
    mots = len(re.sub('<[^>]+>', ' ', corps).split()) + len(a['lead'].split())
    return corps, sommaire, faq, mots


# ---------- gabarit commun ----------
ACCUEIL = (RACINE / 'index.html').read_text()
NAV = ACCUEIL[ACCUEIL.index('    <header class="nav"'):ACCUEIL.index('    <main id="contenu">')].replace('href="#', 'href="/#')
PIED = ACCUEIL[ACCUEIL.index('    <footer class="footer">'):ACCUEIL.index('    </footer>') + len('    </footer>')]


def page(titre, description, canon, corps, image=None, schema=None, robots=None, type_og='website'):
    img = image or f'{SITE}/og-image.png'
    ld = ''.join(f'\n    <script type="application/ld+json">{json.dumps(s, ensure_ascii=False)}</script>' for s in (schema or []))
    rob = f'\n    <meta name="robots" content="{robots}" />' if robots else ''
    e = html.escape
    return f'''<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#0b0709" />
    <title>{e(titre)}</title>
    <meta name="description" content="{e(description)}" />
    <meta name="rating" content="adult" />{rob}
    <link rel="canonical" href="{SITE}{canon}" />
    <meta property="og:title" content="{e(titre)}" />
    <meta property="og:description" content="{e(description)}" />
    <meta property="og:type" content="{type_og}" />
    <meta property="og:url" content="{SITE}{canon}" />
    <meta property="og:site_name" content="QUTE" />
    <meta property="og:locale" content="fr_FR" />
    <meta property="og:image" content="{img}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="alternate" type="application/rss+xml" title="Le guide du libertinage" href="/blog/rss.xml" />{ld}
  </head>
  <body>
    <a class="skip" href="#contenu">Aller au contenu</a>

{NAV}    <main id="contenu" class="blog">
{corps}
    </main>

{PIED}

    <script type="module" src="/src/landing/blog.ts"></script>
  </body>
</html>
'''


def carte(a, grande=False):
    cat = CATEGORIES[a['categorie']][0]
    return f'''<article class="carte-post{' grande' if grande else ''}">
  <a href="{url(a['slug'])}" class="carte-img"><img src="/blog/img/{a['slug']}.svg" width="1200" height="630" alt="{html.escape(a['alt'])}" loading="lazy" decoding="async" /></a>
  <div class="carte-corps">
    <a class="cat-lien" href="/blog/categorie/{a['categorie']}/">{cat}</a>
    <h3><a href="{url(a['slug'])}">{html.escape(a['h1'])}</a></h3>
    <p>{html.escape(a['description'])}</p>
    <span class="lire">{a['minutes']} min de lecture</span>
  </div>
</article>'''


def sidebar(tous, actif=None):
    par_cat = {c: sum(1 for a in tous if a['categorie'] == c) for c in CATEGORIES}
    cats = ''.join(f'<li><a href="/blog/categorie/{c}/"{" aria-current=page" if actif == c else ""}><span>{n}</span><em>{par_cat[c]}</em></a></li>' for c, (n, _) in CATEGORIES.items())
    idx = {a['slug']: a for a in tous}
    pops = ''.join(f'''<li><a href="{url(s)}"><img src="/blog/img/{s}.svg" width="96" height="50" alt="" loading="lazy" decoding="async" /><span>{html.escape(idx[s]['h1'].split(' : ')[0])}</span></a></li>''' for s in POPULAIRES)
    tags = sorted({t for a in tous for t in a['tags']})
    nuage = ''.join(f'<a href="/blog/tag/{slugify(t)}/">#{t}</a>' for t in tags)
    return f'''<aside class="sidebar" aria-label="Barre latérale du blog">
  <section class="widget"><h2>Catégories</h2><ul class="w-cats">{cats}</ul></section>
  <section class="widget"><h2>Articles populaires</h2><ol class="w-pop">{pops}</ol></section>
  <section class="widget"><h2>Tags</h2><div class="w-tags">{nuage}</div></section>
  <section class="widget w-appli"><span data-logo></span><p>Le réseau libertin, en toute confiance. Rencontres, clubs et soirées partout en France.</p><a class="btn btn-primary btn-sm" href="/app/">Ouvrir l'appli</a></section>
</aside>'''


def fil(*elements):
    items = [('Accueil', '/'), ('Blog', '/blog/')] + list(elements)
    li = ''.join(f'<li><a href="{u}">{html.escape(n)}</a></li>' if u else f'<li aria-current="page">{html.escape(n)}</li>' for n, u in items)
    ld = {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': i + 1, 'name': n, **({'item': SITE + u} if u else {})} for i, (n, u) in enumerate(items)]}
    return f'<nav class="fil" aria-label="Fil d\'Ariane"><ol>{li}</ol></nav>', ld


def ecrire(chemin: str, contenu: str):
    p = RACINE / chemin
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(contenu)


def png(svg: Path, sortie: Path):
    subprocess.run(['google-chrome', '--headless', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
                    f'--screenshot={sortie}', '--window-size=1200,630', f'file://{svg}'], capture_output=True, check=False)


def main():
    tous = [lire(f) for f in sorted((RACINE / 'content/blog').glob('*.md'))]
    ordre = ['libertinage', 'echangisme', 'soft-swap', 'melangisme', 'candaulisme', 'triolisme', 'couple-libre', 'polyamour', 'bdsm', 'exhibitionnisme', 'voyeurisme']
    tous.sort(key=lambda a: ordre.index(a['slug']))
    for a in tous:
        a['html'], a['sommaire'], a['faq'], a['mots'] = md_html(a)
        a['minutes'] = max(1, math.ceil(a['mots'] / 220))

    # nettoyage des pages générées
    for d in ['blog']:
        shutil.rmtree(RACINE / d, ignore_errors=True)
    img = RACINE / 'public/blog/img'
    img.mkdir(parents=True, exist_ok=True)

    for a in tous:
        svg = img / f"{a['slug']}.svg"
        svg.write_text(illustration(a['motif']))
        if not (img / f"{a['slug']}.png").exists():
            png(svg, img / f"{a['slug']}.png")

    # ---------- articles ----------
    for i, a in enumerate(tous):
        cat_nom = CATEGORIES[a['categorie']][0]
        fil_html, fil_ld = fil((cat_nom, f"/blog/categorie/{a['categorie']}/"), (a['h1'].split(' : ')[0], None))
        som = ''.join(f'<li><a href="#{i_}">{t}</a></li>' for i_, t in a['sommaire'] if not i_.startswith('en-bref'))
        tags = ''.join(f'<a href="/blog/tag/{slugify(t)}/">#{t}</a>' for t in a['tags'])
        lies = [b for b in tous if b['slug'] != a['slug'] and b['categorie'] == a['categorie']][:3]
        lies += [b for b in tous if b['slug'] not in {a['slug'], *[x['slug'] for x in lies]}][: 3 - len(lies)]
        image = f"{SITE}/blog/img/{a['slug']}.png"
        schema = [fil_ld, {
            '@context': 'https://schema.org', '@type': 'BlogPosting', 'headline': a['h1'], 'description': a['description'],
            'image': image, 'datePublished': AUJOURDHUI, 'dateModified': AUJOURDHUI, 'inLanguage': 'fr-FR',
            'wordCount': a['mots'], 'articleSection': cat_nom, 'keywords': ', '.join([a['keyword']] + a['tags']),
            'mainEntityOfPage': SITE + url(a['slug']),
            'author': {'@type': 'Organization', 'name': 'La rédaction QUTE', 'url': SITE},
            'publisher': {'@type': 'Organization', 'name': 'QUTE', 'logo': {'@type': 'ImageObject', 'url': f'{SITE}/icon.svg'}},
        }]
        if a['faq']:
            schema.append({'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [
                {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': r}} for q, r in a['faq']]})
        corps = f'''      <div class="wrap blog-grille">
        <article class="post">
          {fil_html}
          <a class="cat-lien" href="/blog/categorie/{a['categorie']}/">{cat_nom}</a>
          <h1 class="post-titre">{html.escape(a['h1'])}</h1>
          <p class="post-meta">Par <strong>La rédaction QUTE</strong> · <time datetime="{AUJOURDHUI}">22 novembre 2026</time> · {a['minutes']} min de lecture</p>
          <figure class="post-image"><img src="/blog/img/{a['slug']}.svg" width="1200" height="630" alt="{html.escape(a['alt'])}" fetchpriority="high" decoding="async" /></figure>
          <p class="post-chapo">{html.escape(a['lead'])}</p>
          <nav class="sommaire" aria-label="Sommaire"><details open><summary>Sommaire</summary><ol>{som}</ol></details></nav>
          <div class="post-corps">
{a['html']}
          </div>
          <div class="post-tags">{tags}</div>
          <aside class="auteur"><span class="auteur-ico" data-logo-symbole></span><div><strong>La rédaction QUTE</strong><p>Nous écrivons pour celles et ceux qui découvrent ou vivent le libertinage. Nos articles s'appuient sur les codes de la communauté, le consentement et les sources officielles de santé publique.</p></div></aside>
          <section class="a-lire"><h2 class="h3">À lire aussi</h2><div class="cartes-3">{''.join(carte(b) for b in lies)}</div></section>
        </article>
        {sidebar(tous, a['categorie'])}
      </div>'''
        ecrire(f"blog/{a['slug']}/index.html", page(a['title'], a['description'], url(a['slug']), corps, image, schema, type_og='article'))

    # ---------- accueil du blog ----------
    fil_html, fil_ld = fil(('Le guide du libertinage', None))
    une = tous[0]
    reste = ''.join(carte(a) for a in tous[1:])
    corps = f'''      <section class="blog-hero">
        <div class="hero-glow" aria-hidden="true"></div>
        <div class="wrap">
          {fil_html}
          <p class="eyebrow">Le blog QUTE</p>
          <h1 class="display">Le guide du<br /><span class="red">libertinage.</span></h1>
          <p class="lead">Échangisme, soft swap, mélangisme, triolisme, couple libre, polyamour… Toutes les pratiques libertines expliquées simplement, avec leurs codes, leurs règles et nos conseils pour les vivre sereinement.</p>
        </div>
      </section>
      <div class="wrap blog-grille">
        <div>
          {carte(une, grande=True)}
          <h2 class="h3 titre-liste">Toutes les pratiques</h2>
          <div class="cartes-2">{reste}</div>
        </div>
        {sidebar(tous)}
      </div>'''
    ld = [fil_ld, {'@context': 'https://schema.org', '@type': 'Blog', 'name': 'Le guide du libertinage', 'url': SITE + '/blog/', 'inLanguage': 'fr-FR',
                   'blogPost': [{'@type': 'BlogPosting', 'headline': a['h1'], 'url': SITE + url(a['slug'])} for a in tous]}]
    ecrire('blog/index.html', page('Le guide du libertinage : pratiques, règles et conseils | QUTE',
                                   'Le guide du libertinage de QUTE : échangisme, soft swap, mélangisme, triolisme, couple libre, polyamour, BDSM… Toutes les pratiques expliquées.',
                                   '/blog/', corps, schema=ld))

    # ---------- catégories ----------
    for c, (nom, intro) in CATEGORIES.items():
        liste = [a for a in tous if a['categorie'] == c]
        fil_html, fil_ld = fil((nom, None))
        corps = f'''      <section class="blog-hero petit">
        <div class="wrap">
          {fil_html}
          <p class="eyebrow">Catégorie</p>
          <h1 class="display">{nom}</h1>
          <p class="lead">{intro}</p>
        </div>
      </section>
      <div class="wrap blog-grille">
        <div class="cartes-2">{''.join(carte(a) for a in liste)}</div>
        {sidebar(tous, c)}
      </div>'''
        ecrire(f'blog/categorie/{c}/index.html', page(f'{nom} : articles du guide du libertinage | QUTE', intro, f'/blog/categorie/{c}/', corps, schema=[fil_ld]))

    # ---------- tags (non indexés : pages de navigation) ----------
    for t in sorted({t for a in tous for t in a['tags']}):
        liste = [a for a in tous if t in a['tags']]
        fil_html, fil_ld = fil((f'#{t}', None))
        corps = f'''      <section class="blog-hero petit">
        <div class="wrap">
          {fil_html}
          <p class="eyebrow">Tag</p>
          <h1 class="display">#{t}</h1>
          <p class="lead">{len(liste)} article{'s' if len(liste) > 1 else ''} du guide du libertinage autour de ce thème.</p>
        </div>
      </section>
      <div class="wrap blog-grille">
        <div class="cartes-2">{''.join(carte(a) for a in liste)}</div>
        {sidebar(tous)}
      </div>'''
        ecrire(f'blog/tag/{slugify(t)}/index.html', page(f'#{t} : articles sur le libertinage | QUTE', f'Les articles du guide du libertinage QUTE sur le thème « {t} ».', f'/blog/tag/{slugify(t)}/', corps, schema=[fil_ld], robots='noindex, follow'))

    # ---------- sitemap, robots, flux RSS ----------
    urls = ['/', '/boutique/', '/blog/'] + [url(a['slug']) for a in tous] + [f'/blog/categorie/{c}/' for c in CATEGORIES]
    sm = ''.join(f'<url><loc>{SITE}{u}</loc><lastmod>{AUJOURDHUI}</lastmod></url>' for u in urls)
    (RACINE / 'public/sitemap.xml').write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{sm}</urlset>\n')
    (RACINE / 'public/robots.txt').write_text(f'User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n')
    items = ''.join(f'<item><title>{html.escape(a["h1"])}</title><link>{SITE}{url(a["slug"])}</link><guid>{SITE}{url(a["slug"])}</guid><description>{html.escape(a["description"])}</description></item>' for a in tous)
    (RACINE / 'public/blog').mkdir(parents=True, exist_ok=True)
    (RACINE / 'public/blog/rss.xml').write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Le guide du libertinage — QUTE</title><link>{SITE}/blog/</link><description>Toutes les pratiques libertines expliquées.</description><language>fr-fr</language>{items}</channel></rss>\n')

    for a in tous:
        print(f"{a['slug']:16} {a['mots']:5} mots  {a['minutes']} min  FAQ:{len(a['faq'])}")


if __name__ == '__main__':
    main()
