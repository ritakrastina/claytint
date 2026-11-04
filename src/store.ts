import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { PALETTES, type Clay, type ClayDraft } from './data/palettes'
import { DEFAULT_COLOUR, type Hsl } from './utils/colour'
import type { Unit } from './utils/units'

interface State {
  paletteId: string
  customClays: Clay[]
  colour: Hsl
  totalGrams: number
  unit: Unit
  selectPalette: (id: string) => void
  saveClay: (draft: ClayDraft) => void
  removeClay: (id: string) => void
  setColour: (colour: Hsl) => void
  setTotalGrams: (totalGrams: number) => void
  setUnit: (unit: Unit) => void
}

// App state saved in localStorage
export const useStore = create<State>()(
  persist(
    (set) => ({
      paletteId: PALETTES[0].id,
      customClays: [],
      colour: DEFAULT_COLOUR,
      totalGrams: 50,
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

      setTotalGrams: (totalGrams) => set({ totalGrams }),

      setUnit: (unit) => set({ unit }),
    }),
    {
      name: 'claytint',
    }
  )
)
