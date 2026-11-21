import { AnimatePresence, motion } from 'motion/react'
import { useApp } from '../store/useApp'

export function Toast() {
  const toast = useApp((s) => s.toast)
  return (
    <AnimatePresence>
      {toast && (
        <motion.div className="toast" role="status" initial={{ opacity: 0, y: -16, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -16, x: '-50%' }} transition={{ type: 'spring', stiffness: 500, damping: 34 }}>
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
