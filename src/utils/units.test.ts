import { describe, expect, it } from 'vitest'

import { formatParts, formatWeight, gramsToUnit, WEIGHT_UNITS } from './units'

describe('gramsToUnit', () => {
  it('rounds to 2 decimals for grams and 3 for ounces', () => {
    expect(gramsToUnit(56.699, 'grams')).toBe(56.7)
    expect(gramsToUnit(25, 'ounces')).toBe(0.882)
  })

  it.each([0.125, 1, 1.5, 2, 3.333])(
    'reads %d oz back unchanged after storing it as grams',
    (ounces) => {
      const grams = ounces * WEIGHT_UNITS.ounces.gramsPerUnit
      expect(gramsToUnit(grams, 'ounces')).toBe(ounces)
    }
  )
})

describe('formatWeight', () => {
  it("shows each unit's decimals and symbol", () => {
    expect(formatWeight(25, 'grams')).toBe('25.00 g')
    expect(formatWeight(25, 'ounces')).toBe('0.882 oz')
  })

  it('never shows a tiny amount as 0', () => {
    expect(formatWeight(0.004, 'grams')).toBe('< 0.01 g')
    expect(formatWeight(0.01, 'ounces')).toBe('< 0.001 oz')
  })

  it('still shows the smallest amount that does not round to 0', () => {
    expect(formatWeight(0.13, 'grams')).toBe('0.13 g')
    expect(formatWeight(0.13, 'ounces')).toBe('0.005 oz')
    expect(formatWeight(0.015, 'ounces')).toBe('0.001 oz')
  })
})

describe('formatParts', () => {
  it('uses the singular only for one part', () => {
    expect(formatParts(1)).toBe('1 part')
    expect(formatParts(2)).toBe('2 parts')
  })
})
