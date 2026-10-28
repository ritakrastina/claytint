// Tunes the FIMO True Colours clays so mixing predictions match STAEDTLER's
// printed mixing chart (src/data/fimoChart.ts).
//
// Each clay has two numbers the mixing model depends on: its colour (hex) and
// its strength (how much it tints a mix). We can't measure those directly, so
// this script guesses them: it nudges one number at a time, re-mixes every
// chart recipe, and keeps the nudge if the mixes got closer to the printed
// swatches. Nudges start big and get smaller, until nothing helps any more.
//
// Run with `npx jiti scripts/calibrate-fimo.ts`, then copy the printed clays
// into src/data/palettes.ts. It starts from the current values there, so
// running it again without changing anything gives the same result.
import { Color } from 'spectral.js'

import { FIMO_CHART } from '../src/data/fimoChart'
import { BRAND_PALETTES, type Clay } from '../src/data/palettes'
import { deltaE, mixClays } from '../src/utils/mixing'

// Copies of the FIMO clays that we're free to change
const fimo = BRAND_PALETTES.find(({ id }) => id === 'fimo-professional-tc')!
const clays: Clay[] = fimo.clays.map((clay) => ({ strength: 1, ...clay }))
const clayById = (id: string) => clays.find((clay) => clay.id === id)!

// The chart as recipes (clay + share of the mix) and the printed colour
const swatches = FIMO_CHART.map(({ recipe, parts, hex }) => {
  const total = Object.values(parts).reduce((sum, amount) => sum + amount, 0)
  return {
    recipe,
    ingredients: Object.entries(parts).map(([id, amount]) => ({
      clay: clayById(id),
      fraction: amount / total,
    })),
    printed: new Color(hex),
  }
})

// How far each predicted mix is from its printed swatch (0 = identical)
const errors = () =>
  swatches.map(({ ingredients, printed }) =>
    deltaE(mixClays(ingredients), printed)
  )

// One number to make as small as possible: the average error
const score = () => {
  const all = errors()
  return all.reduce((sum, error) => sum + error, 0) / all.length
}

let bestScore = score()
console.log('Average error before:', bestScore.toFixed(4))

// Changes a clay, keeps the change if the score improved, otherwise undoes it
const tryChange = (clay: Clay, change: Partial<Clay>): boolean => {
  const old = { ...clay }
  Object.assign(clay, change)
  const newScore = score()
  if (newScore < bestScore) {
    bestScore = newScore
    return true
  }
  Object.assign(clay, old)
  return false
}

const nudgeHex = (hex: string, channel: number, amount: number) => {
  const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  rgb[channel] = Math.max(0, Math.min(255, rgb[channel] + amount))
  return '#' + rgb.map((value) => value.toString(16).padStart(2, '0')).join('')
}

for (const step of [16, 8, 4, 2, 1]) {
  let improved = true
  while (improved) {
    improved = false
    for (const clay of clays) {
      // Nudge red, green and blue up and down by `step`. White and black are
      // printed on the chart as they are, so their hexes are already known.
      if (clay.id !== 'W' && clay.id !== 'K') {
        for (const channel of [0, 1, 2]) {
          for (const amount of [step, -step]) {
            const hex = nudgeHex(clay.hex, channel, amount)
            if (tryChange(clay, { hex })) improved = true
          }
        }
      }

      // Nudge the strength up and down (by 25% for step 16, ~1.5% for step 1).
      // White stays at 1: only strengths relative to each other matter.
      if (clay.id !== 'W') {
        for (const factor of [1 + step / 64, 1 / (1 + step / 64)]) {
          const strength = clay.strength! * factor
          if (tryChange(clay, { strength })) improved = true
        }
      }
    }
  }
  console.log(`Step ${step}: average error ${bestScore.toFixed(4)}`)
}

const worst = errors()
  .map((error, i) => ({ recipe: swatches[i].recipe, error: +error.toFixed(4) }))
  .sort((a, b) => b.error - a.error)
console.log('Worst matches:', worst.slice(0, 5))

console.log('\nClays for src/data/palettes.ts:')
for (const { id, hex, name, strength } of clays) {
  console.log(
    `{ id: '${id}', hex: '${hex}', name: '${name}', strength: ${strength!.toFixed(2)} },`
  )
}
