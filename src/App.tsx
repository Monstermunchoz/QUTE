import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useLayoutEffect, useState } from 'react'
import { TabBar } from './components/TabBar'
import { Toast } from './components/Toast'
import { Chat } from './screens/Chat'
import { Decouvrir } from './screens/Decouvrir'
import { LieuSheet } from './screens/LieuSheet'
import { Lieux } from './screens/Lieux'
import { Messages, nonLus } from './screens/Messages'
import { Moi } from './screens/Moi'
import { Onboarding } from './screens/Onboarding'
import { Charte, Confidentialite, Lexique, Panique, Premium } from './screens/Pages'
import { ProfilPage } from './screens/ProfilPage'
import { MonProfilPage } from './screens/MonProfil'
import { Soirees } from './screens/Soirees'
import { SoireeSheet } from './screens/SoireeSheet'
import { useApp, type Overlay, type Tab } from './store/useApp'

const ECRANS: Record<Tab, () => React.JSX.Element> = { decouvrir: Decouvrir, lieux: Lieux, soirees: Soirees, messages: Messages, moi: Moi }

function useTheme() {
  const theme = useApp((s) => s.theme)
  const [systemeClair, setSystemeClair] = useState(() => matchMedia('(prefers-color-scheme: light)').matches)
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: light)')
    const f = () => setSystemeClair(mq.matches)
    mq.addEventListener('change', f)
    return () => mq.removeEventListener('change', f)
  }, [])
  const clair = theme === 'ivoire' || (theme === 'auto' && systemeClair)
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = clair ? 'ivoire' : 'nuit'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', clair ? '#f4ece4' : '#0b0709')
  }, [clair])
}

function OverlayView({ o }: { o: Overlay }) {
  switch (o.kind) {
    case 'profil': return <ProfilPage id={o.id} />
    case 'lieu': return <LieuSheet id={o.id} />
    case 'soiree': return <SoireeSheet id={o.id} />
    case 'chat': return <Chat id={o.id} />
    case 'premium': return <Premium />
    case 'lexique': return <Lexique />
    case 'charte': return <Charte />
    case 'monprofil': return <MonProfilPage />
    case 'confidentialite': return <Confidentialite />
  }
}

export function App() {
  useTheme()
  const { onboarded, tab, overlays, close, panique } = useApp()

  // Le bouton « retour » du téléphone ferme la dernière fenêtre ouverte.
  useEffect(() => {
    const onPop = () => { if (useApp.getState().overlays.length) close() }
    addEventListener('popstate', onPop)
    return () => removeEventListener('popstate', onPop)
  }, [close])

  // Mode discret automatique quand l'appli passe en arrière-plan (aperçu du multitâche).
  useEffect(() => {
    const f = () => document.documentElement.classList.toggle('cache', document.hidden)
    document.addEventListener('visibilitychange', f)
    return () => document.removeEventListener('visibilitychange', f)
  }, [])

  const Ecran = ECRANS[tab]

  return (
    <div className="shell">
      {!onboarded ? (
        <Onboarding />
      ) : (
        <>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div key={tab} className="screen" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
              <Ecran />
            </motion.div>
          </AnimatePresence>
          <TabBar nonLus={nonLus()} />
          <AnimatePresence>
            {overlays.map((o, i) => <OverlayView key={`${o.kind}-${'id' in o ? o.id : ''}-${i}`} o={o} />)}
          </AnimatePresence>
        </>
      )}
      <Toast />
      {panique && <Panique />}
    </div>
  )
}
