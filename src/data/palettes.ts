export type Clay = {
  id: string
  name: string
  hex: string
  strength?: number
}

export type ClayDraft = Omit<Clay, 'id'> & { id?: string }

export type Palette = {
  id: string
  name: string
  info: string
  clays: Clay[]
}

// Pure, idealised colours, real clays are less saturated
export const GENERAL_PALETTES: Palette[] = [
  {
    id: 'primary',
    name: 'Primary',
    info: "Pure screen colours. Real clays are less vivid, so recipes are approximate. Primaries can't reach many bright colours.",
    clays: [
      { id: 'R', hex: '#ff0000', name: 'Red' },
      { id: 'Y', hex: '#ffff00', name: 'Yellow' },
      { id: 'B', hex: '#0000ff', name: 'Blue' },
      { id: 'W', hex: '#ffffff', name: 'White' },
      { id: 'K', hex: '#000000', name: 'Black' },
    ],
  },
  {
    id: 'cmyk',
    name: 'CMYK',
    info: 'Pure screen colours. Real clays are less vivid, so recipes are approximate. CMYK gives the widest range from just three colours.',
    clays: [
      { id: 'C', hex: '#00ffff', name: 'Cyan' },
      { id: 'M', hex: '#ff00ff', name: 'Magenta' },
      { id: 'Y', hex: '#ffff00', name: 'Yellow' },
      { id: 'W', hex: '#ffffff', name: 'White' },
      { id: 'K', hex: '#000000', name: 'Black' },
    ],
  },
]

export const FIMO_WHITE: Clay = {
  id: 'W',
  hex: '#fcfcfc',
  name: 'White',
  strength: 1,
}

export const FIMO_BLACK: Clay = {
  id: 'K',
  hex: '#29292d',
  name: 'Black',
  strength: 5.77,
}

// Approximate representation of branded clay palettes
export const BRAND_PALETTES: Palette[] = [
  {
    id: 'fimo-professional-tc',
    name: 'FIMO professional - True Colours',
    info: "Best-guess FIMO professional True Colours, calibrated against STAEDTLER's mixing chart.",
    // Hexes and strengths are fitted to STAEDTLER's mixing chart by scripts/calibrate-fimo.ts
    clays: [
      { id: 'Y', hex: '#ebcd00', name: 'True yellow', strength: 1.14 },
      { id: 'R', hex: '#d22a3a', name: 'True red', strength: 1.81 },
      { id: 'M', hex: '#b92873', name: 'True magenta', strength: 1.65 },
      { id: 'B', hex: '#006cc2', name: 'True blue', strength: 1.35 },
      { id: 'G', hex: '#11715c', name: 'True green', strength: 1.76 },
      FIMO_WHITE,
      FIMO_BLACK,
    ],
  },
]

export const CUSTOM_PALETTE: Palette = {
  id: 'custom',
  name: 'My palette',
  info: 'Add the clays you own and match each colour as closely as you can. Include black and white to mix lighter and darker shades.',
  clays: [],
}

export const MAX_CUSTOM_CLAYS = 20

export const PALETTES: Palette[] = [
  ...GENERAL_PALETTES,
  ...BRAND_PALETTES,
  CUSTOM_PALETTE,
]

export const resolvePalette = (
  paletteId: string,
  customClays: Clay[]
): Palette =>
  paletteId === CUSTOM_PALETTE.id
    ? { ...CUSTOM_PALETTE, clays: customClays }
    : (PALETTES.find(({ id }) => id === paletteId) ?? PALETTES[0])
