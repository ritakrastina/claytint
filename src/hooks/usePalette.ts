import { useState } from 'react'

import {
  CUSTOM_PALETTE,
  PALETTES,
  type Clay,
  type ClayDraft,
} from '../data/palettes'

const PALETTE_KEY = 'palette'
const CUSTOM_CLAYS_KEY = 'custom-clays'

const load = (key: string): string | null => {
  try {
    return localStorage.getItem(key)
  } catch {
    // Storage blocked (private mode etc.)
    return null
  }
}

const save = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage blocked (private mode etc.)
  }
}

const loadSelectedId = (): string | null => {
  return load(PALETTE_KEY)
}

const loadCustomClays = (): Clay[] => {
  try {
    const parsed: unknown = JSON.parse(load(CUSTOM_CLAYS_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Selected colour palette - one of the presets or the user's custom list.
 * Both the choice and the custom list are saved in localStorage.
 */
export function usePalette() {
  const [selectedId, setSelectedIdState] = useState(loadSelectedId)
  const [customClays, setCustomClaysState] = useState(loadCustomClays)

  const selectPalette = (id: string) => {
    setSelectedIdState(id)
    save(PALETTE_KEY, id)
  }

  const setCustomClays = (clays: Clay[]) => {
    setCustomClaysState(clays)
    save(CUSTOM_CLAYS_KEY, JSON.stringify(clays))
  }

  const saveClay = ({ id, ...clay }: ClayDraft) =>
    setCustomClays(
      id
        ? customClays.map((old) => (old.id === id ? { id, ...clay } : old))
        : [...customClays, { id: crypto.randomUUID(), ...clay }]
    )

  const removeClay = (id: string) =>
    setCustomClays(customClays.filter((clay) => clay.id !== id))

  // Fallback to the first palette
  const selected = PALETTES.find(({ id }) => id === selectedId) ?? PALETTES[0]
  const palette =
    selected.id === CUSTOM_PALETTE.id
      ? { ...CUSTOM_PALETTE, clays: customClays }
      : selected

  return {
    palette,
    selectPalette,
    saveClay,
    removeClay,
  }
}
