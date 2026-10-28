import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { PALETTES, type Clay, type ClayDraft } from './data/palettes'
import { DEFAULT_COLOUR, type Hsl } from './utils/colour'

interface State {
  paletteId: string
  customClays: Clay[]
  colour: Hsl
  weight: number
  unit: 'parts' | 'grams'
  selectPalette: (id: string) => void
  saveClay: (draft: ClayDraft) => void
  removeClay: (id: string) => void
  setColour: (colour: Hsl) => void
  setWeight: (weight: number) => void
  setUnit: (unit: 'parts' | 'grams') => void
}

// App state saved in localStorage
export const useStore = create<State>()(
  persist(
    (set) => ({
      paletteId: PALETTES[0].id,
      customClays: [],
      colour: DEFAULT_COLOUR,
      weight: 25,
      unit: 'parts',

      selectPalette: (paletteId) => set({ paletteId }),

      saveClay: ({ id, ...clay }) =>
        set(({ customClays }) => ({
          customClays: id
            ? customClays.map((old) => (old.id === id ? { id, ...clay } : old))
            : [...customClays, { id: crypto.randomUUID(), ...clay }],
        })),

      removeClay: (id) =>
        set(({ customClays }) => ({
          customClays: customClays.filter((clay) => clay.id !== id),
        })),

      setColour: (colour) => set({ colour }),

      setWeight: (weight) => set({ weight }),

      setUnit: (unit) => set({ unit }),
    }),
    {
      name: 'claytint',
    }
  )
)
