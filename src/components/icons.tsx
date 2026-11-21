import type { SVGProps } from 'react'

/** La tarte aux fraises : le super like de QUTE. */
export function Fraise(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 7.2c4.6 0 7.6 1.9 7.6 5.2 0 4.2-4.6 8.6-7.6 8.6s-7.6-4.4-7.6-8.6c0-3.3 3-5.2 7.6-5.2z" fill="currentColor" />
      <path d="M12 7.4c-1.6-2-3.6-2.6-5.4-2.1 1 .9 2.2 1.6 3.4 1.9-1.2.3-2.2 1-2.9 2 1.9.3 3.6-.2 4.9-1.3 1.3 1.1 3 1.6 4.9 1.3-.7-1-1.7-1.7-2.9-2 1.2-.3 2.4-1 3.4-1.9-1.8-.5-3.8.1-5.4 2.1z" fill="#3f7d4e" />
      <path d="M12 4.6V2.8" stroke="#3f7d4e" strokeWidth="1.6" strokeLinecap="round" />
      <g fill="#ffd9a8" opacity=".85">
        <circle cx="9" cy="12" r=".7" /><circle cx="12" cy="11" r=".7" /><circle cx="15" cy="12" r=".7" />
        <circle cx="10.5" cy="15" r=".7" /><circle cx="13.5" cy="15" r=".7" /><circle cx="12" cy="18" r=".7" />
      </g>
    </svg>
  )
}

export function Certif(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
      <path d="M12 2l2.6 2.1 3.3-.3.9 3.2 2.9 1.7-1.2 3.1 1.2 3.1-2.9 1.7-.9 3.2-3.3-.3L12 22l-2.6-2.1-3.3.3-.9-3.2-2.9-1.7L3.5 12 2.3 8.9l2.9-1.7.9-3.2 3.3.3z" fill="var(--champagne)" />
      <path d="M8 12.2l2.6 2.6L16 9.4" stroke="var(--bg)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
