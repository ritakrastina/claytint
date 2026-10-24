export type Clay = {
  id: string
  name: string
  hex: string
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
    info: "This palette uses truly pure colours, real clays are less saturated, so mixes will only be approximate. Primary colours have limited mixing capabilities, many bright colours can't be reached.",
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
    info: 'This palette uses truly pure colours, real clays are less saturated, so mixes will only be approximate. CMYK colours allow clean mixes and offer the widest range of colours from just three colour clays.',
    clays: [
      { id: 'C', hex: '#00ffff', name: 'Cyan' },
      { id: 'M', hex: '#ff00ff', name: 'Magenta' },
      { id: 'Y', hex: '#ffff00', name: 'Yellow' },
      { id: 'W', hex: '#ffffff', name: 'White' },
      { id: 'K', hex: '#000000', name: 'Black' },
    ],
  },
]

// Approximate representation of branded clay palettes
export const BRAND_PALETTES: Palette[] = [
  {
    id: 'fimo-professional-tc',
    name: 'FIMO professional - True Colours',
    info: "Approximate representation of FIMO professional True Colours clays, calibrated against STAEDTLER's mixing chart.",
    clays: [
      { id: 'Y', hex: '#ffdc00', name: 'True yellow' },
      { id: 'R', hex: '#e10017', name: 'True red' },
      { id: 'M', hex: '#b5177a', name: 'True magenta' },
      { id: 'B', hex: '#0070b4', name: 'True blue' },
      { id: 'G', hex: '#009777', name: 'True green' },
      { id: 'W', hex: '#fcfcfc', name: 'White' },
      { id: 'K', hex: '#29292d', name: 'Black' },
    ],
  },
]

export const CUSTOM_PALETTE: Palette = {
  id: 'custom',
  name: 'My palette',
  info: 'Add the clays you own. The closer each colour matches the real clay, the more accurate mixing results can be achieved. Include black and white to adjust lightness.',
  clays: [],
}

export const PALETTES: Palette[] = [
  ...GENERAL_PALETTES,
  ...BRAND_PALETTES,
  CUSTOM_PALETTE,
]
