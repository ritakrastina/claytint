import { describe, expect, it } from 'vitest'

import { getLayoutSizes, truncateText, wrapText } from './recipeImage'

// Every character is 10 wide
const ctx = {
  measureText: (text: string) => ({ width: text.length * 10 }),
} as unknown as CanvasRenderingContext2D

describe('getLayoutSizes', () => {
  const freeHeight = 900

  it('fits the free height for every clay count up to the custom palette cap', () => {
    for (let rowCount = 2; rowCount <= 21; rowCount++) {
      const { rowHeight, previewHeight } = getLayoutSizes(rowCount, freeHeight)
      expect(rowHeight * rowCount + previewHeight).toBeLessThanOrEqual(
        freeHeight
      )
      expect(previewHeight).toBeGreaterThanOrEqual(200)
      expect(rowHeight).toBeGreaterThanOrEqual(28)
    }
  })

  it('caps the preview height for short recipes', () => {
    expect(getLayoutSizes(2, freeHeight).previewHeight).toBe(360)
  })

  it('gives few clays taller rows than many clays', () => {
    expect(getLayoutSizes(3, freeHeight).rowHeight).toBeGreaterThan(
      getLayoutSizes(21, freeHeight).rowHeight
    )
  })
})

describe('truncateText', () => {
  it('keeps text that fits', () => {
    expect(truncateText(ctx, 'Red', 30)).toBe('Red')
  })

  it('shortens text that does not fit, within the width', () => {
    const result = truncateText(ctx, 'Very long clay name', 80)
    expect(result).toBe('Very...')
    expect(ctx.measureText(result).width).toBeLessThanOrEqual(80)
  })
})

describe('wrapText', () => {
  it('breaks lines between words', () => {
    expect(wrapText(ctx, 'mix a small test chip', 110)).toEqual([
      'mix a small',
      'test chip',
    ])
  })

  it('keeps a word longer than the width on its own line', () => {
    expect(wrapText(ctx, 'a verylongword b', 50)).toEqual([
      'a',
      'verylongword',
      'b',
    ])
  })
})
