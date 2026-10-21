import { describe, expect, it } from 'vitest'

import { hexToHsl, hslToHex } from './colour'

// Fully saturated colours at 50% lightness, every 60° around the wheel.
const WHEEL_COLOURS = [
  { h: 0, hex: '#ff0000' },
  { h: 60, hex: '#ffff00' },
  { h: 120, hex: '#00ff00' },
  { h: 180, hex: '#00ffff' },
  { h: 240, hex: '#0000ff' },
  { h: 300, hex: '#ff00ff' },
]

const roundTrip = (hex: string) => {
  const hsl = hexToHsl(hex)
  return hsl && hslToHex(hsl)
}

describe('hslToHex', () => {
  it.each(WHEEL_COLOURS)('converts hue $h to $hex', ({ h, hex }) => {
    expect(hslToHex({ h, s: 100, l: 50 })).toBe(hex)
  })

  it('converts black, white and grey', () => {
    expect(hslToHex({ h: 0, s: 100, l: 0 })).toBe('#000000')
    expect(hslToHex({ h: 0, s: 100, l: 100 })).toBe('#ffffff')
    expect(hslToHex({ h: 0, s: 0, l: 50 })).toBe('#808080')
  })

  it('treats hue 360 as hue 0', () => {
    expect(hslToHex({ h: 360, s: 100, l: 50 })).toBe('#ff0000')
  })

  it('pads single-digit channels', () => {
    expect(hslToHex({ h: 0, s: 100, l: 1 })).toBe('#050000')
  })
})

describe('hexToHsl', () => {
  it.each(WHEEL_COLOURS)('converts $hex to hue $h', ({ h, hex }) => {
    expect(hexToHsl(hex)).toEqual({ h, s: 100, l: 50 })
  })

  it('converts grey', () => {
    const grey = hexToHsl('#808080')
    expect(grey?.h).toBe(0)
    expect(grey?.s).toBe(0)
    expect(grey?.l).toBeCloseTo(50.2, 1)
  })

  it('converts a mixed colour', () => {
    const teal = hexToHsl('#2f8a8c')
    expect(teal?.h).toBeCloseTo(181.3, 1)
    expect(teal?.s).toBeCloseTo(49.7, 1)
    expect(teal?.l).toBeCloseTo(36.7, 1)
  })

  it.each(['#f00', 'ff0000', '#FF0000', '  #ff0000  '])(
    'accepts %j',
    (input) => {
      expect(hexToHsl(input)).toEqual(hexToHsl('#ff0000'))
    }
  )

  it.each(['', '#12', '#12345', '#1234567', '#ggg', 'red'])(
    'returns null for %j',
    (input) => {
      expect(hexToHsl(input)).toBeNull()
    }
  )
})

describe('round trip', () => {
  it.each([
    '#c8603f',
    '#2f8a8c',
    '#7d58a8',
    '#000000',
    '#ffffff',
    '#808080',
    '#010203',
  ])('keeps %s unchanged', (hex) => {
    expect(roundTrip(hex)).toBe(hex)
  })

  it('returns lowercase hex', () => {
    expect(roundTrip('#C8603F')).toBe('#c8603f')
  })
})
