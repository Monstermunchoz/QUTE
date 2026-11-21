import { memo } from 'react'

type Props = { teinte: number; personnes?: number; flou?: boolean; className?: string; style?: React.CSSProperties }

/**
 * Portrait de démonstration : silhouettes sur velours, en attendant les vraies photos.
 * Les vraies photos passeront par le même composant (flou, verrou, consentement).
 */
export const Portrait = memo(function Portrait({ teinte, personnes = 2, flou, className, style }: Props) {
  const h = teinte
  const bg = `radial-gradient(120% 80% at 30% 20%, hsl(${h} 45% 30%) 0%, hsl(${h} 50% 14%) 55%, hsl(${h} 40% 7%) 100%)`
  const a = `hsl(${h} 38% 42%)`
  const b = `hsl(${(h + 12) % 360} 42% 34%)`
  return (
    <div className={className} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: bg, ...style }} aria-hidden="true">
      <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMax slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', filter: flou ? 'blur(18px)' : undefined, transform: flou ? 'scale(1.15)' : undefined }}>
        <defs>
          <radialGradient id={`l${h}`} cx="50%" cy="30%" r="60%">
            <stop offset="0" stopColor="#fff" stopOpacity=".22" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        {personnes >= 2 ? (
          <>
            <ellipse cx="118" cy="190" rx="44" ry="54" fill={a} />
            <path d="M30 420c8-110 48-160 88-160s80 50 88 160z" fill={a} />
            <ellipse cx="196" cy="212" rx="40" ry="50" fill={b} />
            <path d="M118 420c10-100 42-140 78-140s70 40 80 140z" fill={b} />
          </>
        ) : (
          <>
            <ellipse cx="150" cy="190" rx="50" ry="62" fill={a} />
            <path d="M40 420c10-120 56-170 110-170s100 50 110 170z" fill={a} />
          </>
        )}
        <rect width="300" height="400" fill={`url(#l${h})`} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.18, mixBlendMode: 'overlay', backgroundImage: 'radial-gradient(rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '3px 3px' }} />
    </div>
  )
})
