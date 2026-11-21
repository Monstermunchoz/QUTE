import { motion } from 'motion/react'
import { CalendarHeart, Flame, MapPin, MessageCircle, UserRound } from 'lucide-react'
import { useApp, type Tab } from '../store/useApp'

const TABS: { id: Tab; label: string; Icon: typeof Flame }[] = [
  { id: 'decouvrir', label: 'Découvrir', Icon: Flame },
  { id: 'lieux', label: 'Lieux', Icon: MapPin },
  { id: 'soirees', label: 'Soirées', Icon: CalendarHeart },
  { id: 'messages', label: 'Messages', Icon: MessageCircle },
  { id: 'moi', label: 'Moi', Icon: UserRound },
]

export function TabBar({ nonLus }: { nonLus: number }) {
  const tab = useApp((s) => s.tab)
  const setTab = useApp((s) => s.setTab)
  return (
    <nav className="tabbar" aria-label="Navigation principale">
      {TABS.map(({ id, label, Icon }) => (
        <button key={id} className="tab" aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}>
          {tab === id && <motion.span layoutId="tab-pill" className="tab-pill" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
          <Icon size={22} strokeWidth={tab === id ? 2.2 : 1.8} />
          {label}
          {id === 'messages' && nonLus > 0 && <span className="badge">{nonLus}</span>}
        </button>
      ))}
    </nav>
  )
}
