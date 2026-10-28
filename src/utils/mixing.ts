import { Color, mix } from 'spectral.js'

import { FIMO_BLACK, FIMO_WHITE, type Clay } from '../data/palettes'

export type Ingredient = {
  clay: Clay
  fraction: number
  parts?: number
}

export type Recipe = {
  ingredients: Ingredient[] // sorted by fraction, largest first
  hex: string // predicted colour of the mix
  deltaE: number // OKLab distance from the target (0.02 ≈ just noticeable)
  quality: MatchQuality // deltaE as a rating for display
}

export type BestRecipe = { exact: Recipe; rounded: Recipe }

export type MatchQuality = 'excellent' | 'close' | 'approximate' | 'rough'

export type GapReason =
  'too-vivid' | 'too-muted' | 'too-light' | 'too-dark' | 'hue'

// Mixes within this distance of the closest one look the same, so the one with fewer clays wins
export const DELTA_E_TOLERANCE = 0.015

// Smaller amounts are left out of recipes (0.1 g in 50 g)
const MIN_FRACTION = 0.002

// Logit range for the search: about 1 part in 1000 at either end
const LOGIT_RANGE = 7

// Whole parts within this distance of the exact mix look the same as it
const ROUNDING_TOLERANCE = 0.01

// Most multiples of the smallest clay tried before settling for the closest rounding
const MAX_SMALLEST_PARTS = 20

const colourCache = new Map<string, Color>()

const toColour = (hex: string, strength = 1): Color => {
  const key = `${hex}:${strength}`
  let colour = colourCache.get(key)
  if (!colour) {
    colour = new Color(hex)
    colour.tintingStrength = strength
    colourCache.set(key, colour)
  }
  return colour
}

export const deltaE = (a: Color, b: Color): number => {
  const [l1, a1, b1] = a.OKLab
  const [l2, a2, b2] = b.OKLab
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2)
}

// spectral.js weighs each colour by its luminance, so dark clays barely tint a mix,
// but real black clay is strong. Near-black clays without a calibrated strength get
// the strength that makes 1 part in 6 with white as dark as with FIMO black.
const findBlackStrength = (hex: string): number => {
  const [lightness, chroma] = toColour(hex).OKLCh
  if (chroma >= 0.04 || lightness >= 0.4) return 1

  const greyLightness = (black: Color) =>
    mix([black, Math.sqrt(1 / 6)], [toColour(FIMO_WHITE.hex), Math.sqrt(5 / 6)])
      .OKLab[0]
  const goal = greyLightness(toColour(FIMO_BLACK.hex, FIMO_BLACK.strength))

  // bisect on log(strength); the mix gets darker as strength grows
  let [low, high] = [0, Math.log(100)]
  for (let i = 0; i < 30; i++) {
    const middle = (low + high) / 2
    const strength = Math.exp(middle)
    if (greyLightness(toColour(hex, strength)) > goal) low = middle
    else high = middle
  }
  return Math.exp((low + high) / 2)
}

const strengthCache = new Map<string, number>()

const clayColour = (clay: Clay): Color => {
  let strength = clay.strength ?? strengthCache.get(clay.hex)
  if (strength === undefined) {
    strength = findBlackStrength(clay.hex)
    strengthCache.set(clay.hex, strength)
  }
  return toColour(clay.hex, strength)
}

// Predicts the colour of clays mixed by weight
export const mixClays = (ingredients: Ingredient[]): Color =>
  // spectral.js squares the factor, so pass √fraction to keep amounts linear in weight
  mix(
    ...ingredients.map(({ clay, fraction }): [Color, number] => [
      clayColour(clay),
      Math.sqrt(fraction),
    ])
  )

// Colour of a mix and how close it is to the target
const describeMix = (mixed: Color, target: Color) => {
  const distance = deltaE(mixed, target)
  return {
    hex: mixed.toString().toLowerCase(),
    deltaE: distance,
    quality: matchQuality(distance),
  }
}

const softmax = (logits: number[]): number[] => {
  const max = Math.max(...logits)
  const exps = logits.map((logit) => Math.exp(logit - max))
  const sum = exps.reduce((total, value) => total + value, 0)
  return exps.map((value) => value / sum)
}

const makeRecipe = (
  target: Color,
  clays: Clay[],
  fractions: number[]
): Recipe => {
  const kept = clays
    .map((clay, i) => ({ clay, fraction: fractions[i] }))
    .filter(({ fraction }) => fraction >= MIN_FRACTION)
  const total = kept.reduce((sum, { fraction }) => sum + fraction, 0)
  const ingredients = kept
    .map(({ clay, fraction }) => ({ clay, fraction: fraction / total }))
    .sort((a, b) => b.fraction - a.fraction)

  return { ingredients, ...describeMix(mixClays(ingredients), target) }
}

const nelderMead = (
  f: (x: number[]) => number,
  start: number[],
  maxEvaluations: number
): number[] => {
  const dim = start.length
  const clamp = (x: number[]) =>
    x.map((v) => Math.max(-LOGIT_RANGE, Math.min(LOGIT_RANGE, v)))

  let simplex = [
    start,
    ...start.map((_, i) => start.map((v, j) => (i === j ? v + 1.5 : v))),
  ]
    .map(clamp)
    .map((x) => ({ x, value: f(x) }))
  let evaluations = simplex.length

  const combine = (a: number[], b: number[], t: number) =>
    clamp(a.map((v, i) => v + t * (b[i] - v)))

  while (evaluations < maxEvaluations) {
    simplex.sort((a, b) => a.value - b.value)
    const best = simplex[0]
    const worst = simplex[dim]
    if (worst.value - best.value < 1e-7) break

    const centroid = start.map(
      (_, i) =>
        simplex.slice(0, dim).reduce((sum, { x }) => sum + x[i], 0) / dim
    )
    const tryPoint = (t: number) => {
      const x = combine(centroid, worst.x, t)
      evaluations++
      return { x, value: f(x) }
    }

    const reflected = tryPoint(-1)
    if (reflected.value < best.value) {
      const expanded = tryPoint(-2)
      simplex[dim] = expanded.value < reflected.value ? expanded : reflected
    } else if (reflected.value < simplex[dim - 1].value) {
      simplex[dim] = reflected
    } else {
      const contracted = tryPoint(reflected.value < worst.value ? -0.5 : 0.5)
      if (contracted.value < Math.min(worst.value, reflected.value)) {
        simplex[dim] = contracted
      } else {
        // shrink towards the best point
        simplex = simplex.map(({ x }, i) => {
          if (i === 0) return simplex[0]
          const shrunk = combine(best.x, x, 0.5)
          evaluations++
          return { x: shrunk, value: f(shrunk) }
        })
      }
    }
  }

  return simplex.reduce((a, b) => (b.value < a.value ? b : a)).x
}

// Finds the best proportions of the given clays, searching in log-ratio space so
// lopsided mixes (1 part to 120) are as easy to reach as even ones
const optimise = (
  target: Color,
  clays: Clay[],
  startFractions?: number[]
): Recipe => {
  if (clays.length === 1) return makeRecipe(target, clays, [1])

  // logits relative to the first clay, which stays at 0
  const toFractions = (x: number[]) => softmax([0, ...x])
  const error = (x: number[]) => {
    const fractions = toFractions(x)
    const ingredients = clays.map((clay, i) => ({
      clay,
      fraction: fractions[i],
    }))
    return deltaE(mixClays(ingredients), target)
  }

  let start: number[]
  if (startFractions) {
    const base = Math.max(startFractions[0], 1e-3)
    start = startFractions
      .slice(1)
      .map((fraction) => Math.log(Math.max(fraction, 1e-3) / base))
  } else if (clays.length === 2) {
    // scan the ratio first, as the error can have more than one dip
    const steps = 15
    start = [-LOGIT_RANGE]
    let bestError = Infinity
    for (let i = 0; i < steps; i++) {
      const x = [-LOGIT_RANGE + (2 * LOGIT_RANGE * i) / (steps - 1)]
      const value = error(x)
      if (value < bestError) [start, bestError] = [x, value]
    }
  } else {
    start = clays.slice(1).map(() => 0)
  }

  // restarting from the result helps when the simplex collapsed early
  const maxEvaluations = 60 * clays.length ** 2
  const x = nelderMead(
    error,
    nelderMead(error, start, maxEvaluations),
    maxEvaluations
  )
  return makeRecipe(target, clays, toFractions(x))
}

// Best mix for each number of clays, fewest clays first.
// The last one is the closest colour these clays can make.
export const findRecipes = (targetHex: string, clays: Clay[]): Recipe[] => {
  if (clays.length === 0) return []
  const target = toColour(targetHex)

  const candidates = [
    ...clays.map((clay) => optimise(target, [clay])),
    ...clays.flatMap((a, i) =>
      clays.slice(i + 1).map((b) => optimise(target, [a, b]))
    ),
  ]

  // Closest colour using every clay, started from the best singles and pairs
  const seeds = [...candidates]
    .sort((a, b) => a.deltaE - b.deltaE)
    .slice(0, 3)
    .map(({ ingredients }) =>
      clays.map(
        (clay) =>
          (ingredients.find((ingredient) => ingredient.clay === clay)
            ?.fraction ?? 0) + 0.01
      )
    )
  let current: Recipe = [undefined, ...seeds]
    .map((seed) => optimise(target, clays, seed))
    .reduce((a, b) => (b.deltaE < a.deltaE ? b : a))
  candidates.push(current)

  // Leave out one clay at a time, whichever loses the least
  while (current.ingredients.length > 2) {
    const { ingredients } = current
    current = ingredients
      .map((_, skip) => {
        const remaining = ingredients.filter((_, i) => i !== skip)
        return optimise(
          target,
          remaining.map(({ clay }) => clay),
          remaining.map(({ fraction }) => fraction)
        )
      })
      .reduce((a, b) => (b.deltaE < a.deltaE ? b : a))
    candidates.push(current)
  }

  // Indexed by clay count, so the gaps drop out and the order comes for free
  const byCount: Recipe[] = []
  for (const recipe of candidates) {
    const best = byCount[recipe.ingredients.length]
    if (!best || recipe.deltaE < best.deltaE) {
      byCount[recipe.ingredients.length] = recipe
    }
  }
  return byCount.filter(Boolean)
}

// The closest mix, using fewer clays when that looks the same
export const pickBest = (recipes: Recipe[]): Recipe | null => {
  if (recipes.length === 0) return null
  const closest = Math.min(...recipes.map((recipe) => recipe.deltaE))
  return (
    recipes.find((recipe) => recipe.deltaE <= closest + DELTA_E_TOLERANCE) ??
    null
  )
}

// The recipe in whole parts. The smallest clay is at least 1 part.
// Rounding to whole parts could change the mix colour.
export const roundToParts = (targetHex: string, recipe: Recipe): Recipe => {
  const target = toColour(targetHex)
  const exactColour = toColour(recipe.hex)
  const smallest = recipe.ingredients[recipe.ingredients.length - 1].fraction

  // Bounded so a mix that never gets within tolerance (or a NaN) can't hang the
  // page; the closest rounding found is used instead
  let closest: { result: Recipe; distance: number } | undefined
  for (
    let smallestParts = 1;
    smallestParts <= MAX_SMALLEST_PARTS;
    smallestParts++
  ) {
    const parts = recipe.ingredients.map(({ fraction }) =>
      Math.round((fraction / smallest) * smallestParts)
    )
    const total = parts.reduce((sum, amount) => sum + amount, 0)
    const ingredients = recipe.ingredients.map(({ clay }, i) => ({
      clay,
      fraction: parts[i] / total,
      parts: parts[i],
    }))
    const mixed = mixClays(ingredients)
    const distance = deltaE(mixed, exactColour)
    const result = { ingredients, ...describeMix(mixed, target) }
    if (distance <= ROUNDING_TOLERANCE) return result
    if (!closest || distance < closest.distance) closest = { result, distance }
  }
  return closest!.result
}

// The best recipe, exact (for weights) and rounded (for whole parts)
export const findBestRecipe = (
  targetHex: string,
  clays: Clay[]
): BestRecipe | null => {
  const exact = pickBest(findRecipes(targetHex, clays))
  return exact && { exact, rounded: roundToParts(targetHex, exact) }
}

export const matchQuality = (deltaE: number): MatchQuality => {
  if (deltaE < 0.02) return 'excellent'
  if (deltaE < 0.05) return 'close'
  if (deltaE < 0.1) return 'approximate'
  return 'rough'
}

// Main way the mix differs from the target: lightness, chroma or hue
export const explainGap = (targetHex: string, mixHex: string): GapReason => {
  const target = toColour(targetHex)
  const mixed = toColour(mixHex)
  const [targetL, targetC] = target.OKLCh
  const [mixL, mixC] = mixed.OKLCh

  const lightness = targetL - mixL
  const chroma = targetC - mixC
  // hue difference expressed as a distance, so it compares with the other two
  const hue = Math.sqrt(
    Math.max(0, deltaE(target, mixed) ** 2 - lightness ** 2 - chroma ** 2)
  )

  const largest = Math.max(Math.abs(lightness), Math.abs(chroma), hue)
  if (largest === hue) return 'hue'
  if (largest === Math.abs(chroma))
    return chroma > 0 ? 'too-vivid' : 'too-muted'
  return lightness > 0 ? 'too-light' : 'too-dark'
}
