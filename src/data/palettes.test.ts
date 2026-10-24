import { describe, expect, it } from 'vitest'

import { PALETTES } from './palettes'

describe('PALETTES', () => {
  it('has unique ids', () => {
    const ids = PALETTES.map((palette) => palette.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  describe.each(PALETTES)('$name', ({ clays }) => {
    it('uses lowercase #rrggbb hexes', () => {
      for (const { hex } of clays) expect(hex).toMatch(/^#[0-9a-f]{6}$/)
    })

    it('has no duplicate hexes', () => {
      const hexes = clays.map(({ hex }) => hex)
      expect(new Set(hexes).size).toBe(hexes.length)
    })

    it('has unique clay ids', () => {
      const ids = clays.map(({ id }) => id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })
})
