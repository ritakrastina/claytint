export type Clay = {
  name: string
  hex: string
}

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
      { hex: '#ff0000', name: 'Red' },
      { hex: '#ffff00', name: 'Yellow' },
      { hex: '#0000ff', name: 'Blue' },
      { hex: '#ffffff', name: 'White' },
      { hex: '#000000', name: 'Black' },
    ],
  },
  {
    id: 'cmyk',
    name: 'CMYK',
    info: 'This palette uses truly pure colours, real clays are less saturated, so mixes will only be approximate. CMYK colours allow clean mixes and offer the widest range of colours from just three colour clays.',
    clays: [
      { hex: '#00ffff', name: 'Cyan' },
      { hex: '#ff00ff', name: 'Magenta' },
      { hex: '#ffff00', name: 'Yellow' },
      { hex: '#ffffff', name: 'White' },
      { hex: '#000000', name: 'Black' },
    ],
  },
]

// Approximate representation of branded clay palettes
export const BRAND_PALETTES: Palette[] = [
  {
    id: 'fimo-professional',
    name: 'FIMO professional - True Colours',
    info: "Approximate representation of FIMO professional True Colours clays, calibrated against STAEDTLER's mixing chart.",
    clays: [
      { hex: '#ffdc00', name: 'True yellow' },
      { hex: '#e10017', name: 'True red' },
      { hex: '#b5177a', name: 'True magenta' },
      { hex: '#0070b4', name: 'True blue' },
      { hex: '#009777', name: 'True green' },
      { hex: '#fcfcfc', name: 'White' },
      { hex: '#29292d', name: 'Black' },
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
