import { Color } from 'spectral.js'
import { describe, expect, it } from 'vitest'

import { FIMO_CHART, type Parts } from '../data/fimoChart'
import { PALETTES, type Clay } from '../data/palettes'
import {
  DELTA_E_TOLERANCE,
  deltaE,
  explainGap,
  findBestRecipe,
  findRecipes,
  matchQuality,
  mixClays,
  pickBest,
  roundToParts,
  type Recipe,
} from './mixing'

const palette = (id: string) => PALETTES.find((palette) => palette.id === id)!
const FIMO = palette('fimo-professional-tc').clays
const PRIMARY = palette('primary').clays

const clay = (clays: Clay[], id: string) => clays.find((c) => c.id === id)!

const partsOf = (clays: Clay[], parts: Parts) => {
  const total = Object.values(parts).reduce((sum, amount) => sum + amount, 0)
  return Object.entries(parts).map(([id, amount]) => ({
    clay: clay(clays, id),
    fraction: amount / total,
  }))
}

const wholeParts = (recipe: Recipe) =>
  recipe.ingredients.map(({ parts = 0 }) => parts)

const chartErrors = FIMO_CHART.map(({ recipe, parts, hex }) => ({
  recipe,
  hex,
  error: deltaE(mixClays(partsOf(FIMO, parts)), new Color(hex)),
}))

describe('FIMO calibration', () => {
  it('matches the STAEDTLER chart on average', () => {
    const mean =
      chartErrors.reduce((sum, { error }) => sum + error, 0) /
      chartErrors.length
    expect(mean).toBeLessThan(0.032)
  })

  it.each(chartErrors)('mixes $recipe close to $hex', ({ error }) => {
    expect(error).toBeLessThan(0.11)
  })
})

describe('findBestRecipe', () => {
  it.each(FIMO.map(({ id, hex }) => ({ id, hex })))(
    'uses only $id for its own colour',
    ({ id, hex }) => {
      const recipe = findBestRecipe(hex, FIMO)!.exact
      expect(recipe.ingredients.map(({ clay }) => clay.id)).toEqual([id])
      expect(recipe.deltaE).toBeLessThan(1e-6)
    }
  )

  it.each(['YII', 'MIII', 'GII'])(
    'mixes the chart colour %s at least as closely as the chart recipe',
    (name) => {
      const { parts, hex } = FIMO_CHART.find(({ recipe }) => recipe === name)!
      const chartError = deltaE(mixClays(partsOf(FIMO, parts)), new Color(hex))
      expect(findBestRecipe(hex, FIMO)!.exact.deltaE).toBeLessThanOrEqual(
        chartError + 1e-3
      )
    }
  )

  it('gives fractions that add up to 1, largest first', () => {
    const { ingredients } = findBestRecipe('#7e25b3', FIMO)!.exact
    const fractions = ingredients.map(({ fraction }) => fraction)
    expect(fractions.reduce((sum, fraction) => sum + fraction, 0)).toBeCloseTo(
      1,
      10
    )
    expect(fractions).toEqual([...fractions].sort((a, b) => b - a))
  })

  it('rounds the same clays to whole parts', () => {
    const { exact, rounded } = findBestRecipe('#7e25b3', FIMO)!
    expect(rounded.ingredients.map(({ clay }) => clay)).toEqual(
      exact.ingredients.map(({ clay }) => clay)
    )
    expect(
      wholeParts(rounded).every(
        (parts) => Number.isInteger(parts) && parts >= 1
      )
    ).toBe(true)
  })

  it('finds a mix at least as close as any 1, 2 or 3 clays', () => {
    for (const target of ['#7e25b3', '#e6b0d2', '#4f5b2a']) {
      const closest = Math.min(
        ...findRecipes(target, FIMO).map(({ deltaE }) => deltaE)
      )
      const subsets = FIMO.flatMap((a, i) =>
        FIMO.slice(i + 1).flatMap((b, j) =>
          FIMO.slice(i + j + 2).map((c) => [a, b, c])
        )
      )
      for (const subset of subsets) {
        const best = Math.min(
          ...findRecipes(target, subset).map(({ deltaE }) => deltaE)
        )
        expect(closest).toBeLessThanOrEqual(best + 1e-3)
      }
    }
  })

  it('returns null without clays', () => {
    expect(findBestRecipe('#808080', [])).toBeNull()
    expect(findRecipes('#808080', [])).toEqual([])
  })

  it('lets a pure black darken a mix as much as FIMO black', () => {
    const grey = (clays: Clay[]) =>
      mixClays(partsOf(clays, { K: 1, W: 5 })).OKLab[0]
    expect(grey(PRIMARY)).toBeCloseTo(grey(FIMO), 2)
  })
})

describe('pickBest', () => {
  const recipe = (count: number, deltaE: number) =>
    ({
      ingredients: FIMO.slice(0, count).map((clay) => ({
        clay,
        fraction: 1 / count,
      })),
      hex: '#000000',
      deltaE,
    }) as Recipe

  it('prefers fewer clays when the colour looks the same', () => {
    const simple = recipe(2, 0.01 + DELTA_E_TOLERANCE / 2)
    expect(pickBest([recipe(1, 0.2), simple, recipe(4, 0.01)])).toBe(simple)
  })

  it('prefers the closer colour when the difference shows', () => {
    const closest = recipe(4, 0.01)
    expect(pickBest([recipe(2, 0.01 + DELTA_E_TOLERANCE * 2), closest])).toBe(
      closest
    )
  })
})

describe('roundToParts', () => {
  const exact = (parts: Parts): Recipe => {
    const recipeParts = partsOf(FIMO, parts)
    return {
      ingredients: recipeParts.sort((a, b) => b.fraction - a.fraction),
      hex: mixClays(recipeParts).toString().toLowerCase(),
      deltaE: 0,
      quality: 'excellent',
    }
  }

  it('keeps a lopsided chart recipe as it is', () => {
    const recipe = exact({ Y: 80, R: 1 })
    expect(wholeParts(roundToParts(recipe.hex, recipe))).toEqual([80, 1])
  })

  it('scales up when 1 part for the smallest clay would change the colour', () => {
    const recipe = exact({ Y: 3, B: 2 })
    expect(wholeParts(roundToParts(recipe.hex, recipe))).toEqual([3, 2])
  })

  it('uses 1 part for a single clay', () => {
    const recipe = exact({ W: 1 })
    expect(wholeParts(roundToParts(recipe.hex, recipe))).toEqual([1])
  })

  it('stays close to the exact mix', () => {
    const recipe = findBestRecipe('#7e25b3', FIMO)!.exact
    const rounded = roundToParts('#7e25b3', recipe)
    expect(deltaE(new Color(rounded.hex), new Color(recipe.hex))).toBeLessThan(
      0.011
    )
    expect(Math.min(...wholeParts(rounded))).toBeGreaterThanOrEqual(1)
  })

  it('gives up on rounding when the mix can never match its hex', () => {
    const recipe = { ...exact({ Y: 3, B: 2 }), hex: '#ff00ff' }
    const parts = wholeParts(roundToParts(recipe.hex, recipe))
    expect(parts).toHaveLength(2)
    expect(parts.every((parts) => Number.isInteger(parts) && parts >= 1)).toBe(
      true
    )
  })
})

describe('matchQuality', () => {
  it.each([
    [0, 'excellent'],
    [0.03, 'close'],
    [0.07, 'approximate'],
    [0.2, 'rough'],
  ] as const)('rates ΔE %d as %s', (deltaE, quality) => {
    expect(matchQuality(deltaE)).toBe(quality)
  })
})

describe('explainGap', () => {
  it('spots a colour too vivid for the clays', () => {
    const { hex } = findBestRecipe('#00ff40', FIMO)!.exact
    expect(explainGap('#00ff40', hex)).toBe('too-vivid')
  })

  it('spots a colour too light for the clays', () => {
    const greys: Clay[] = [
      { id: 'grey', name: 'Grey', hex: '#808080' },
      { id: 'K', name: 'Black', hex: '#000000' },
    ]
    const { hex } = findBestRecipe('#e0e0e0', greys)!.exact
    expect(explainGap('#e0e0e0', hex)).toBe('too-light')
  })

  it('spots a hue the clays cannot reach', () => {
    const blueAndWhite = PRIMARY.filter(({ id }) => id === 'B' || id === 'W')
    const { hex } = findBestRecipe('#ff8800', blueAndWhite)!.exact
    expect(explainGap('#ff8800', hex)).toBe('hue')
  })
})
