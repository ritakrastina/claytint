// Colour chart from STAEDTLER's FIMO professional True Colours mixing guide.
// Swatch colours are the median colour of each printed swatch, so they carry some printing error.

export type Parts = Record<string, number>

export type ChartSwatch = {
  recipe: string
  parts: Parts
  hex: string
}

// main colour wheel: the five base clays and STAEDTLER's mixes of them
const MAIN_COLOURS: Record<string, Parts> = {
  Y: { Y: 1 },
  YI: { Y: 80, R: 1 },
  YII: { Y: 20, R: 1 },
  YIII: { Y: 4, R: 1 },
  YIV: { Y: 2, R: 3 },
  R: { R: 1 },
  RI: { R: 3, M: 2 },
  RII: { R: 1, M: 4 },
  M: { M: 1 },
  MI: { M: 20, B: 1 },
  MII: { M: 4, B: 1 },
  MIII: { M: 3, B: 2 },
  MIV: { M: 3, B: 7 },
  MV: { M: 1, B: 9 },
  B: { B: 1 },
  BI: { B: 9, G: 1 },
  BII: { B: 7, G: 3 },
  BIII: { B: 2, G: 3 },
  G: { G: 1 },
  GI: { G: 9, Y: 1 },
  GII: { G: 2, Y: 3 },
  GIII: { G: 1, Y: 9 },
  GIV: { G: 1, Y: 40 },
  GV: { G: 1, Y: 120 },
}

// amount of white (W) or black (K) added to main colour
const COLUMNS: { label: string; parts: Parts; main: number }[] = [
  { label: '20 W + 1', parts: { W: 20 }, main: 1 },
  { label: '4 W + 1', parts: { W: 4 }, main: 1 },
  { label: '1 W + 1', parts: { W: 1 }, main: 1 },
  { label: '', parts: {}, main: 1 }, // main colour
  { label: '1 K + 80', parts: { K: 1 }, main: 80 },
  { label: '1 K + 20', parts: { K: 1 }, main: 20 },
  { label: '1 K + 5', parts: { K: 1 }, main: 5 },
]

// prettier-ignore
const ROWS: [string, (string | null)[]][] = [
  ['Y',    ['#fff15e', '#ffe437', '#ffe10d', null,        '#b9ba09', '#8b8f23', '#4f5b2a']],
  ['YI',   ['#ffea72', '#ffde2f', '#ffd000', '#fdc300', '#b8b135', '#808627', '#596229']],
  ['YII',  ['#ffe463', '#fece43', '#fbbb1f', '#f39100', '#c09614', '#8b822e', '#45542b']],
  ['YIII', ['#ffdb7c', '#fbbe5d', '#f18824', '#ec6617', '#c46b19', '#8a6425', '#5c5128']],
  ['YIV',  ['#fac39d', '#f39768', '#ec672e', '#e6310e', '#b7411d', '#893d23', '#4d3225']],
  ['R',    ['#f7c4d4', '#ef7994', '#e94265', null,        '#b72b35', '#892d35', '#4a2a32']],
  ['RI',   ['#f6b8ce', '#ee799e', '#ea507d', '#ce1041', '#b42b46', '#8a3544', '#563139']],
  ['RII',  ['#efb3d2', '#e785b5', '#db5097', '#d30165', '#a61d54', '#79254c', '#4d3146']],
  ['M',    ['#ecb1d2', '#de7cb0', '#d24995', null,        '#9e1e67', '#793560', '#4a2842']],
  ['MI',   ['#e3b7d6', '#c47db4', '#af519a', '#981876', '#851e70', '#702c63', '#422943']],
  ['MII',  ['#dbbfdd', '#b698c7', '#976aab', '#623486', '#573674', '#523063', '#422847']],
  ['MIII', ['#d2cde8', '#ada3d1', '#7c6eb0', '#544496', '#42367b', '#3e346a', '#2a2745']],
  ['MIV',  ['#c8d9f1', '#90afdc', '#648bc7', '#134094', '#143f86', '#143968', '#112e4b']],
  ['MV',   ['#c1e1f6', '#7ac6eb', '#328fce', '#005ca9', '#00548a', '#004d72', '#06314e']],
  ['B',    ['#abd9e9', '#60bee5', '#00aadb', null,        '#00689d', '#005073', '#013e4b']],
  ['BI',   ['#a3d8e7', '#60c3d9', '#00afd2', '#0079aa', '#00688a', '#00566a', '#003b45']],
  ['BII',  ['#a9dae0', '#4bbdc9', '#00abb9', '#0090a7', '#006d81', '#00565e', '#1c3b3b']],
  ['BIII', ['#a4d7d8', '#64c2c7', '#00a19d', '#009089', '#008282', '#005b5b', '#1b3834']],
  ['G',    ['#a0d4c7', '#52bbab', '#00a994', null,        '#007161', '#005a49', '#1e3c33']],
  ['GI',   ['#afd8bd', '#8bc9ad', '#00a86e', '#008547', '#00703a', '#005a34', '#11452d']],
  ['GII',  ['#b8d47c', '#95c455', '#63b339', '#15a237', '#2f9437', '#3c7832', '#2c512d']],
  ['GIII', ['#dbe283', '#bbd042', '#a2c619', '#7cb926', '#77b038', '#6d8f27', '#44592c']],
  ['GIV',  ['#f3eb6f', '#e8e348', '#dedd00', '#c7d300', '#a1ab1e', '#808c27', '#45542b']],
  ['GV',   ['#f7ed74', '#f9ec56', '#f2e500', '#dedc00', '#c0ba00', '#8b8f23', '#4f5e2b']],
]

// white, black and greys
const GREYS: [string, Parts, string][] = [
  ['W', { W: 1 }, '#fcfcfc'],
  ['1 K + 80 W', { K: 1, W: 80 }, '#cac9cc'],
  ['1 K + 20 W', { K: 1, W: 20 }, '#a6a5a9'],
  ['1 K + 10 W', { K: 1, W: 10 }, '#858488'],
  ['1 K + 5 W', { K: 1, W: 5 }, '#66666b'],
  ['1 K + 1 W', { K: 1, W: 1 }, '#4a4a4f'],
  ['K', { K: 1 }, '#29292d'],
]

const addParts = (a: Parts, b: Parts, scale: number): Parts => {
  const sum = { ...a }
  for (const [id, amount] of Object.entries(b)) {
    sum[id] = (sum[id] ?? 0) + amount * scale
  }
  return sum
}

const total = (parts: Parts) =>
  Object.values(parts).reduce((sum, amount) => sum + amount, 0)

// Every chart swatch, with its recipe expanded to base clay amounts
export const FIMO_CHART: ChartSwatch[] = [
  ...ROWS.flatMap(([name, hexes]) => {
    const main = MAIN_COLOURS[name]
    return COLUMNS.flatMap(({ label, parts, main: amount }, i) => {
      const hex = hexes[i]
      if (!hex) return []
      return {
        recipe: label ? `${label} ${name}` : name,
        // scale the main colour's recipe to `amount` parts in total
        parts: addParts(parts, main, amount / total(main)),
        hex,
      }
    })
  }),
  ...GREYS.map(([recipe, parts, hex]) => ({ recipe, parts, hex })),
]
