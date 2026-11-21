import { motion, useDragControls, type PanInfo } from 'motion/react'
import type { ReactNode } from 'react'

const spring = { type: 'spring', stiffness: 420, damping: 40 } as const

/** Feuille glissante. On la ferme en tirant la poignée vers le bas, ou en touchant le fond. */
export function Sheet({ onClose, children, label }: { onClose: () => void; children: ReactNode; label: string }) {
  const controls = useDragControls()
  const onDragEnd = (_: unknown, i: PanInfo) => {
    if (i.offset.y > 110 || i.velocity.y > 600) onClose()
  }
  return (
    <>
      <motion.div className="sheet-backdrop" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.section
        role="dialog" aria-modal="true" aria-label={label} className="sheet"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={spring}
        drag="y" dragListener={false} dragControls={controls} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.7 }} onDragEnd={onDragEnd}
      >
        <div onPointerDown={(e) => controls.start(e)} style={{ touchAction: 'none', paddingBottom: 4 }}>
          <div className="grabber" />
        </div>
        {children}
      </motion.section>
    </>
  )
}

/** Page plein écran qui glisse depuis la droite. */
export function Page({ children, label }: { children: ReactNode; label: string }) {
  return (
    <motion.section role="dialog" aria-modal="true" aria-label={label} className="page" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={spring}>
      {children}
    </motion.section>
  )
}
