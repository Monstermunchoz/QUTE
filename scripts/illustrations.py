"""Illustrations de synthèse des articles du blog (SVG, 1200x630, non explicites).

Chaque motif est dessiné au trait, aux couleurs de QUTE, sur le fond dégradé du site.
"""

ROUGE = '#C41E3A'
ROSE = '#EBA3AE'
CREME = '#F6EDE8'

FOND = '''<defs>
<radialGradient id="f" cx="30%" cy="20%" r="110%"><stop offset="0" stop-color="#6F2A38"/><stop offset=".55" stop-color="#361219"/><stop offset="1" stop-color="#190B0E"/></radialGradient>
<radialGradient id="h" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#C41E3A" stop-opacity=".45"/><stop offset="1" stop-color="#C41E3A" stop-opacity="0"/></radialGradient>
<pattern id="p" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#F6EDE8" fill-opacity=".07"/></pattern>
</defs>
<rect width="1200" height="630" fill="url(#f)"/><rect width="1200" height="630" fill="url(#p)"/>
<circle cx="600" cy="315" r="300" fill="url(#h)"/>'''

T = f'fill="none" stroke="{CREME}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"'
R = f'fill="none" stroke="{ROUGE}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"'
RS = f'fill="none" stroke="{ROSE}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"'


def coupe(x, y, inc):
    return f'''<g transform="translate({x} {y}) rotate({inc})">
<path {RS} d="M-38 -110C-38 -60-20-30 0-28C20-30 38-60 38-110Z"/><path {RS} d="M0 -28V40M-30 44H30"/>
<path d="M-34 -88C-30 -58-16-38 0-36C16-38 30-58 34-88Z" fill="{ROUGE}" fill-opacity=".55"/></g>'''


MOTIFS = {
    'masque': f'''<g transform="translate(600 300)">
<path {T} d="M-230-40C-150-110 150-110 230-40C230 60 150 110 70 110C20 110 10 60 0 60S-20 110-70 110C-150 110-230 60-230-40Z"/>
<path {R} d="M-150-10C-120-40-70-40-50-10C-70 20-120 20-150-10ZM150-10C120-40 70-40 50-10C70 20 120 20 150-10Z"/>
<path {RS} d="M230-40C270-70 300-120 290-170M-230-40C-260-60-280-20-300 10"/></g>
{coupe(300, 470, -12)}{coupe(900, 470, 12)}''',
    'cles': f'''<g transform="translate(600 315)">
<g transform="rotate(-35)"><circle {T} cx="-170" cy="0" r="60"/><circle {T} cx="-170" cy="0" r="22"/><path {T} d="M-110 0H200M150 0V44M185 0V34"/></g>
<g transform="rotate(35)"><circle {R} cx="170" cy="0" r="60"/><path d="M170-22a22 22 0 1 1 0 44a22 22 0 1 1 0-44" {R}/><path {R} d="M110 0H-200M-150 0V44M-185 0V34"/></g></g>''',
    'plumes': f'''<g transform="translate(600 320)">
<g transform="rotate(-28)"><path {T} d="M0-230C90-150 90 70 0 200C-90 70-90-150 0-230Z"/><path {T} d="M0-200V260"/>
<path {RS} d="M0-150 50-110M0-90 60-50M0-30 58 10M0 30 48 70M0-150-50-110M0-90-60-50M0-30-58 10M0 30-48 70"/></g>
<g transform="translate(120 20) rotate(24)"><path {R} d="M0-200C75-130 75 60 0 170C-75 60-75-130 0-200Z"/><path {R} d="M0-170V220"/></g></g>''',
    'cercles': f'''<g transform="translate(600 315)">
<circle {T} cx="-120" cy="-40" r="130"/><circle {R} cx="120" cy="-40" r="130"/>
<circle {RS} cx="-60" cy="80" r="110"/><circle {T} cx="70" cy="80" r="110" stroke-opacity=".6"/></g>''',
    'couronne': f'''<path d="M0 0H1200V40C1000 120 900 60 820 0Z" fill="{ROUGE}" fill-opacity=".35"/>
<path d="M0 0H380C300 60 200 120 0 40Z" fill="{ROUGE}" fill-opacity=".35"/>
<path {RS} d="M110 0C150 220 120 450 60 630M1090 0C1050 220 1080 450 1140 630"/>
<g transform="translate(600 340)"><path {T} d="M-200 110H200L230-90 110 10 0-140-110 10-230-90Z"/>
<path {R} d="M-200 160H200"/><circle cx="0" cy="-160" r="18" fill="{ROUGE}"/><circle cx="-230" cy="-110" r="14" fill="{ROSE}"/><circle cx="230" cy="-110" r="14" fill="{ROSE}"/>
<path {RS} d="M-60 60h120"/></g>''',
    'triangle': f'''<g transform="translate(600 330)">
<circle {T} cx="0" cy="-95" r="115"/><circle {R} cx="-110" cy="85" r="115"/><circle {RS} cx="110" cy="85" r="115"/></g>''',
    'oiseaux': f'''<g transform="translate(600 300)">
<path {T} d="M-300 40C-230-60-150-60-100 0C-50-80 40-90 80-20"/><path {R} d="M-60 160C0 70 80 70 120 120C170 40 260 30 300 100"/>
<path {RS} d="M-420 260C-200 200 200 200 420 140" stroke-opacity=".5"/></g>''',
    'constellation': f'''<g transform="translate(600 315)" {RS} stroke-opacity=".6"><path d="M-330-90-120-160 0 20 170-120 320 60 90 170-160 140Z"/><path d="M-120-160-160 140M0 20 90 170M170-120 90 170"/></g>
''' + ''.join(f'<g transform="translate({600 + x} {315 + y}) scale({s})"><path fill="{c}" d="M0 30C-8 23-34 8-34-12C-34-26-24-36-13-36C-6-36-1-31 0-27C1-31 6-36 13-36C24-36 34-26 34-12C34 8 8 23 0 30Z"/></g>'
         for x, y, s, c in [(-330, -90, 1.2, CREME), (-120, -160, 1.6, ROUGE), (0, 20, 2.4, ROUGE), (170, -120, 1.3, CREME), (320, 60, 1.5, ROUGE), (90, 170, 1.1, CREME), (-160, 140, 1.4, ROSE)]),
    'ruban': f'''<g transform="translate(600 300)">
<path {T} d="M0 0C-80-120-260-140-260-20S-80 80 0 0ZM0 0C80-120 260-140 260-20S80 80 0 0Z"/>
<path {R} d="M-20 20C-60 120-120 200-170 250M20 20C60 120 120 200 170 250"/>
<ellipse cx="0" cy="5" rx="34" ry="40" fill="{ROUGE}"/></g>''',
    'projecteur': f'''<path d="M600 40 330 560H870Z" fill="{CREME}" fill-opacity=".09"/>
<path d="M600 40 450 560H750Z" fill="{CREME}" fill-opacity=".08"/>
<g transform="translate(600 40)"><rect x="-50" y="-30" width="100" height="70" rx="14" fill="{ROUGE}"/></g>
<ellipse cx="600" cy="560" rx="300" ry="40" {T}/><path {R} d="M220 600H980"/>
<path {RS} d="M60 0C120 200 90 420 40 630M1140 0C1080 200 1110 420 1160 630"/>''',
    'oeil': f'''<rect x="380" y="70" width="440" height="490" rx="220" {T}/>
<path {T} d="M600 70V560M380 320H820"/>
<g transform="translate(600 470) scale(.7)"><path {R} d="M-230-40C-150-110 150-110 230-40C230 60 150 110 70 110C20 110 10 60 0 60S-20 110-70 110C-150 110-230 60-230-40Z"/>
<path {RS} d="M230-40C280-110 340-130 380-120M230-40C300-80 360-70 390-40"/></g>''',
}


def illustration(motif: str) -> str:
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">{FOND}{MOTIFS[motif]}</svg>\n'
