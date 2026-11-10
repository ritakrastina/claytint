import { useDeferredValue, useMemo } from 'react'

import { resolvePalette } from '../data/palettes'
import { useStore } from '../store'
import { hslToHex } from '../utils/colour'
import {
  explainGap,
  findBestRecipe,
  type GapReason,
  type MatchQuality,
} from '../utils/mixing'
import { formatParts, formatWeight } from '../utils/units'

export type RecipeCard = {
  targetHex: string
  mixHex: string
  quality: MatchQuality
  paletteName: string
  ingredients: {
    id: string
    hex: string
    label: string
    amount: string
  }[]
  total: string
  qualityInfo: string
  testChipInfo: string
}

const QUALITY_INFO: Record<GapReason, string> = {
  'too-vivid':
    'Target is more vivid than these clays can reach, so this is the closest duller mix.',
  'too-muted':
    'Target is greyer than these clays can reach, so this is the closest brighter mix.',
  'too-light': 'Target is lighter than these clays can reach.',
  'too-dark': 'Target is darker than these clays can reach.',
  hue: "Target is out of these clays' reach, so the mix leans to a nearby hue.",
}

const TEST_CHIP_INFO =
  'Real clay may look different, so mix a small test chip first.'

export function useRecipe(): RecipeCard | null {
  const colour = useStore((state) => state.colour)
  const paletteId = useStore((state) => state.paletteId)
  const customClays = useStore((state) => state.customClays)
  const totalGrams = useStore((state) => state.totalGrams)
  const unit = useStore((state) => state.unit)

  const { name, clays } = resolvePalette(paletteId, customClays)

  // Deferred so the colour picker stays responsive while the recipe is found
  const targetHex = useDeferredValue(hslToHex(colour))

  // Memoised, as deferring renders twice per colour change, and unit or weight changes re-render too
  const bestRecipe = useMemo(
    () => findBestRecipe(targetHex, clays),
    [targetHex, clays]
  )

  if (!bestRecipe) return null

  // Rounding to whole parts may shift the colour, so show the rounded recipe
  const recipe = unit === 'parts' ? bestRecipe.rounded : bestRecipe.exact

  const totalParts = recipe.ingredients.reduce(
    (sum, { parts = 0 }) => sum + parts,
    0
  )

  return {
    targetHex,
    mixHex: recipe.hex,
    quality: recipe.quality,
    paletteName: name,
    ingredients: recipe.ingredients.map(({ clay, fraction, parts }) => ({
      id: clay.id,
      hex: clay.hex,
      label: clay.name || clay.hex,
      amount:
        unit === 'parts'
          ? formatParts(parts ?? 0)
          : formatWeight(fraction * totalGrams, unit),
    })),
    total:
      unit === 'parts'
        ? formatParts(totalParts)
        : formatWeight(totalGrams, unit),
    qualityInfo: QUALITY_INFO[explainGap(targetHex, recipe.hex)],
    testChipInfo: TEST_CHIP_INFO,
  }
}
