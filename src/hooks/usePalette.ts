import { useState } from 'react'

import { CUSTOM_PALETTE, PALETTES } from '../data/palettes'
import type { Clay } from '../data/palettes'
import { normaliseHex } from '../utils/colour'

const PALETTE_KEY = 'palette'
const CUSTOM_CLAYS_KEY = 'customClays'

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
    if (!Array.isArray(parsed)) return []
    const seen = new Set<string>()
    return parsed.flatMap((item) => {
      const hex =
        typeof item?.hex === 'string' ? normaliseHex(item.hex) : undefined
      if (!hex || seen.has(hex)) return []
      seen.add(hex)
      const name = typeof item.name === 'string' ? item.name : hex
      return [{ hex, name }]
    })
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

  const addClay = (clay: Clay) => setCustomClays([...customClays, clay])

  const updateClay = (index: number, clay: Clay) =>
    setCustomClays(customClays.map((old, i) => (i === index ? clay : old)))

  const removeClay = (index: number) =>
    setCustomClays(customClays.filter((_, i) => i !== index))

  // Fallback to the first palette
  const selected = PALETTES.find(({ id }) => id === selectedId) ?? PALETTES[0]
  const palette =
    selected.id === CUSTOM_PALETTE.id
      ? { ...CUSTOM_PALETTE, clays: customClays }
      : selected

  return {
    palette,
    selectPalette,
    addClay,
    updateClay,
    removeClay,
  }
}
