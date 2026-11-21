import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Compte = 'couple' | 'femme' | 'homme' | 'trans'
export type Tab = 'decouvrir' | 'lieux' | 'soirees' | 'messages' | 'moi'
export type Overlay =
  | { kind: 'profil'; id: string }
  | { kind: 'lieu'; id: string }
  | { kind: 'chat'; id: string }
  | { kind: 'premium' }
  | { kind: 'lexique' }
  | { kind: 'charte' }
  | { kind: 'confidentialite' }

type Consentements = { majeur: boolean; donneesSensibles: boolean; charte: boolean; cgu: boolean }

type State = {
  onboarded: boolean
  compte: Compte | null
  pseudo: string
  envies: string[]
  consentements: Consentements
  premium: boolean
  discret: boolean
  floutage: boolean // photos sensibles floutées par défaut
  tab: Tab
  overlays: Overlay[]
  likes: string[]
  passes: string[]
  tartes: string[]
  historique: { id: string; action: 'like' | 'pass' | 'tarte' }[]
  ceSoir: string[] // lieux où je vais
  bloques: string[]
  validations: Record<string, 'oui' | 'non'> // validation à deux
  panique: boolean
  ville: string | null // filtre ville partagé (lieux, soirées)
  theme: 'nuit' | 'ivoire' | 'auto'
  toast: string | null

  finishOnboarding: (d: { compte: Compte; pseudo: string; envies: string[]; consentements: Consentements }) => void
  setTab: (t: Tab) => void
  open: (o: Overlay) => void
  close: () => void
  like: (id: string) => void
  pass: (id: string) => void
  tarte: (id: string) => void
  undo: () => void
  toggleCeSoir: (id: string) => void
  bloquer: (id: string) => void
  valider: (id: string, v: 'oui' | 'non') => void
  setPremium: (v: boolean) => void
  setDiscret: (v: boolean) => void
  setFloutage: (v: boolean) => void
  setPanique: (v: boolean) => void
  setVille: (v: string | null) => void
  setTheme: (t: 'nuit' | 'ivoire' | 'auto') => void
  notify: (m: string) => void
  reset: () => void
}

const initial = {
  onboarded: false,
  compte: null,
  pseudo: '',
  envies: [],
  consentements: { majeur: false, donneesSensibles: false, charte: false, cgu: false },
  premium: false,
  discret: false,
  floutage: true,
  tab: 'decouvrir' as Tab,
  overlays: [] as Overlay[],
  likes: [],
  passes: [],
  tartes: [],
  historique: [] as { id: string; action: 'like' | 'pass' | 'tarte' }[],
  ceSoir: [],
  bloques: [],
  validations: {},
  panique: false,
  ville: null as string | null,
  theme: 'nuit' as 'nuit' | 'ivoire' | 'auto',
  toast: null,
}

let toastTimer: ReturnType<typeof setTimeout> | undefined

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      ...initial,
      finishOnboarding: (d) => set({ ...d, onboarded: true }),
      setTab: (tab) => set({ tab, overlays: [] }),
      open: (o) => {
        history.pushState({ overlay: true }, '')
        set({ overlays: [...get().overlays, o] })
      },
      close: () => set({ overlays: get().overlays.slice(0, -1) }),
      like: (id) => set({ likes: [...get().likes, id], historique: [...get().historique, { id, action: 'like' }] }),
      pass: (id) => set({ passes: [...get().passes, id], historique: [...get().historique, { id, action: 'pass' }] }),
      tarte: (id) =>
        set({ tartes: [...get().tartes, id], likes: [...get().likes, id], historique: [...get().historique, { id, action: 'tarte' }] }),
      undo: () => {
        const h = get().historique
        const last = h[h.length - 1]
        if (!last) return
        const sans = (l: string[]) => l.filter((x) => x !== last.id)
        set({ historique: h.slice(0, -1), likes: sans(get().likes), passes: sans(get().passes), tartes: sans(get().tartes) })
      },
      toggleCeSoir: (id) => {
        const s = get().ceSoir
        set({ ceSoir: s.includes(id) ? s.filter((x) => x !== id) : [...s, id] })
      },
      bloquer: (id) => set({ bloques: [...get().bloques, id], overlays: [] }),
      valider: (id, v) => set({ validations: { ...get().validations, [id]: v } }),
      setPremium: (premium) => set({ premium }),
      setDiscret: (discret) => set({ discret }),
      setFloutage: (floutage) => set({ floutage }),
      setPanique: (panique) => set({ panique }),
      setVille: (ville) => set({ ville }),
      setTheme: (theme) => set({ theme }),
      notify: (toast) => {
        clearTimeout(toastTimer)
        set({ toast })
        toastTimer = setTimeout(() => set({ toast: null }), 2600)
      },
      reset: () => {
        localStorage.removeItem('qute')
        set({ ...initial })
      },
    }),
    {
      name: 'qute',
      partialize: (s) => {
        const { overlays: _o, toast: _t, panique: _p, ...rest } = s
        return rest
      },
    },
  ),
)
