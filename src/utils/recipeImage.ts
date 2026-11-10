import {
  ERROR_ICON_PATH,
  INFO_ICON_PATH,
  PALETTE_ICON_PATH,
  WARNING_ICON_PATH,
} from '../components/ui/icons'
import type { RecipeCard } from '../hooks/useRecipe'

// Layout
//
//    0 ┌───────────────────────────────────────┐
//      │ Header                                │
//  190 │  ┌─────────────────────────────────┐  │ CARD_TOP
//      │  │ Card                            │  │
//  230 │  │  ┌───────────────────────────┐  │  │ CONTENT_TOP
//      │  │  │ Preview                   │  │  │ MIN/MAX_PREVIEW_HEIGHT
//      │  │  ├───────────────────────────┤  │  │
//      │  │  │ Palette name              │  │  │ PALETTE_ROW_HEIGHT
//      │  │  ├───────────────────────────┤  │  │
//      │  │  │ Ingredient rows           │  │  │ MIN/MAX_INGREDIENT_HEIGHT
//      │  │  │ Total                     │  │  │
//      │  │  │ (free space)              │  │  │ NOTES_MARGIN_TOP at least
//      │  │  ├───────────────────────────┤  │  │
//      │  │  │ Notes                     │  │  │ NOTES_PADDING_TOP
// 1380 │  │  └───────────────────────────┘  │  │ CONTENT_BOTTOM
// 1420 │  └─────────────────────────────────┘  │ CARD_BOTTOM
//      │ Footer                                │
// 1500 └───────────────────────────────────────┘
//      0  48 88                          912   1000
//         │  │                           │
//         │  └ CONTENT_LEFT              └ CONTENT_RIGHT
//         └ IMAGE_MARGIN

// Image size 2:3
const IMAGE_WIDTH = 1000
const IMAGE_HEIGHT = 1500
const IMAGE_MARGIN = 48

const CARD_TOP = 190
const CARD_BOTTOM = 1420
const CARD_PADDING = 40

const CONTENT_LEFT = IMAGE_MARGIN + CARD_PADDING
const CONTENT_RIGHT = IMAGE_WIDTH - CONTENT_LEFT
const CONTENT_WIDTH = CONTENT_RIGHT - CONTENT_LEFT
const CONTENT_TOP = CARD_TOP + CARD_PADDING
const CONTENT_BOTTOM = CARD_BOTTOM - CARD_PADDING

const RADIUS = 32
const RADIUS_SM = 16

const PALETTE_ROW_HEIGHT = 72

const NOTE_LINE_HEIGHT = 36
const NOTE_GAP = 12
const NOTE_ICON_SIZE = 28
const NOTE_TEXT_LEFT = CONTENT_LEFT + NOTE_ICON_SIZE + 8
const NOTES_MARGIN_TOP = 8
const NOTES_PADDING_TOP = 20

const MIN_PREVIEW_HEIGHT = 200
const MAX_PREVIEW_HEIGHT = 360

const MIN_INGREDIENT_HEIGHT = 28
const MAX_INGREDIENT_HEIGHT = 92
const INGREDIENT_PADDING_INLINE = 32

// Light theme from index.css
const COLOURS = {
  bg: '#efefec',
  surface: '#ffffff',
  text: '#1f221f',
  muted: '#686c66',
  warning: '#a36a00',
  error: '#b3361f',
  border: '#e0e1dc',
  chip: 'rgb(255 255 255 / 80%)',
}

const TITLE_TINTS = ['#c86f33', '#938c3c', '#2f8a8c', '#7d58a8']

const SANS = 'system-ui, sans-serif'
const SERIF = "ui-serif, 'Iowan Old Style', 'Palatino Linotype', Georgia, serif"
const MONO = 'ui-monospace, Menlo, Consolas, monospace'

// Long recipes shrink the colour preview
export const getLayoutSizes = (rowCount: number, freeHeight: number) => {
  const fitted = Math.floor((freeHeight - MIN_PREVIEW_HEIGHT) / rowCount)
  const rowHeight = Math.max(
    MIN_INGREDIENT_HEIGHT,
    Math.min(MAX_INGREDIENT_HEIGHT, fitted)
  )
  const previewHeight = Math.min(
    MAX_PREVIEW_HEIGHT,
    freeHeight - rowHeight * rowCount
  )
  return { rowHeight, previewHeight }
}

export const truncateText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) => {
  let truncated = text
  let end = text.length
  while (end > 0 && ctx.measureText(truncated).width > maxWidth) {
    end--
    truncated = `${text.slice(0, end).trimEnd()}...`
  }
  return truncated
}

export const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) => {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    const candidate = line ? `${line} ${word}` : word
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  lines.push(line)
  return lines
}

const drawIcon = (
  ctx: CanvasRenderingContext2D,
  path: string,
  colour: string,
  x: number,
  y: number,
  size: number
) => {
  ctx.save()
  ctx.fillStyle = colour
  ctx.translate(x, y)
  ctx.scale(size / 24, size / 24)
  ctx.fill(new Path2D(path))
  ctx.restore()
}

const drawDivider = (ctx: CanvasRenderingContext2D, y: number) => {
  ctx.beginPath()
  ctx.moveTo(CONTENT_LEFT, y)
  ctx.lineTo(CONTENT_RIGHT, y)
  ctx.stroke()
}

const drawHeader = (ctx: CanvasRenderingContext2D) => {
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  ctx.font = `700 80px ${SERIF}`
  ctx.fillStyle = COLOURS.text
  ctx.fillText('Clay', IMAGE_MARGIN, 112)

  let x = IMAGE_MARGIN + ctx.measureText('Clay').width
  for (const [index, letter] of [...'Tint'].entries()) {
    ctx.fillStyle = TITLE_TINTS[index]
    ctx.fillText(letter, x, 112)
    x += ctx.measureText(letter).width
  }

  ctx.font = `500 20px ${SANS}`
  ctx.fillStyle = COLOURS.muted
  ctx.letterSpacing = '2px'
  ctx.fillText('POLYMER CLAY COLOUR MIXING RECIPES', IMAGE_MARGIN, 156)
  ctx.letterSpacing = '0px'
}

const drawCard = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = COLOURS.surface
  ctx.beginPath()
  ctx.roundRect(
    IMAGE_MARGIN,
    CARD_TOP,
    IMAGE_WIDTH - IMAGE_MARGIN * 2,
    CARD_BOTTOM - CARD_TOP,
    RADIUS
  )
  ctx.fill()
  ctx.stroke()
}

const drawPreviewChip = (
  ctx: CanvasRenderingContext2D,
  right: number,
  top: number,
  label: string,
  hex: string
) => {
  const width = 156
  ctx.fillStyle = COLOURS.chip
  ctx.beginPath()
  ctx.roundRect(right - width, top, width, 84, RADIUS_SM)
  ctx.fill()

  const textRight = right - 16
  ctx.fillStyle = COLOURS.text
  ctx.textAlign = 'right'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `600 20px ${SANS}`
  ctx.letterSpacing = '1px'
  ctx.fillText(label, textRight, top + 34)
  const labelWidth = ctx.measureText(label).width
  ctx.letterSpacing = '0px'
  ctx.font = `26px ${MONO}`
  ctx.fillText(hex.toUpperCase(), textRight, top + 68)

  return textRight - labelWidth
}

const drawPreview = (
  ctx: CanvasRenderingContext2D,
  top: number,
  height: number,
  { targetHex, mixHex, quality }: RecipeCard
) => {
  const splitX = CONTENT_LEFT + CONTENT_WIDTH / 2

  ctx.beginPath()
  ctx.roundRect(CONTENT_LEFT, top, CONTENT_WIDTH, height, RADIUS_SM)

  ctx.save()
  ctx.clip()
  ctx.fillStyle = targetHex
  ctx.fillRect(CONTENT_LEFT, top, CONTENT_WIDTH / 2, height)
  ctx.fillStyle = mixHex
  ctx.fillRect(splitX, top, CONTENT_WIDTH / 2, height)
  ctx.restore()

  ctx.stroke()

  const chipTop = top + 24
  drawPreviewChip(ctx, splitX - 24, chipTop, 'TARGET', targetHex)
  const mixLabelLeft = drawPreviewChip(
    ctx,
    CONTENT_RIGHT - 24,
    chipTop,
    'MIX',
    mixHex
  )

  // Poor quality icon
  const iconSize = 24
  const iconLeft = mixLabelLeft - iconSize - 6
  const iconTop = chipTop + 12
  if (quality === 'rough') {
    drawIcon(ctx, ERROR_ICON_PATH, COLOURS.error, iconLeft, iconTop, iconSize)
  }
  if (quality === 'approximate') {
    drawIcon(
      ctx,
      WARNING_ICON_PATH,
      COLOURS.warning,
      iconLeft,
      iconTop,
      iconSize
    )
  }
}

const drawPalette = (
  ctx: CanvasRenderingContext2D,
  middle: number,
  name: string
) => {
  const iconSize = 32
  const textLeft = CONTENT_LEFT + iconSize + 8
  const iconTop = middle - iconSize / 2
  drawIcon(
    ctx,
    PALETTE_ICON_PATH,
    COLOURS.muted,
    CONTENT_LEFT,
    iconTop,
    iconSize
  )

  ctx.fillStyle = COLOURS.muted
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.font = `28px ${SANS}`
  ctx.fillText(
    truncateText(ctx, name, CONTENT_RIGHT - textLeft),
    textLeft,
    middle
  )
}

const drawIngredients = (
  ctx: CanvasRenderingContext2D,
  top: number,
  rowHeight: number,
  { ingredients, total }: RecipeCard
) => {
  const fontSize = Math.min(32, Math.round(rowHeight * 0.55))
  const swatchRadius = Math.min(24, rowHeight * 0.36)
  const rowLeft = CONTENT_LEFT + INGREDIENT_PADDING_INLINE
  const rowRight = CONTENT_RIGHT - INGREDIENT_PADDING_INLINE
  const labelLeft = rowLeft + swatchRadius * 2 + 24

  ctx.textBaseline = 'middle'

  ingredients.forEach(({ hex, label, amount }, index) => {
    const rowTop = top + rowHeight * index
    const middle = rowTop + rowHeight / 2
    if (index > 0) drawDivider(ctx, rowTop)

    ctx.fillStyle = hex
    ctx.beginPath()
    ctx.arc(rowLeft + swatchRadius, middle, swatchRadius, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = COLOURS.text
    ctx.textAlign = 'right'
    ctx.font = `${fontSize}px ${MONO}`
    ctx.fillText(amount, rowRight, middle)
    const maxLabelWidth =
      rowRight - ctx.measureText(amount).width - 24 - labelLeft

    ctx.textAlign = 'left'
    ctx.font = `${fontSize}px ${SANS}`
    ctx.fillText(truncateText(ctx, label, maxLabelWidth), labelLeft, middle)
  })

  const totalTop = top + rowHeight * ingredients.length
  const totalMiddle = totalTop + rowHeight / 2
  drawDivider(ctx, totalTop)

  ctx.fillStyle = COLOURS.text
  ctx.textAlign = 'right'
  ctx.font = `600 ${fontSize}px ${MONO}`
  ctx.fillText(total, rowRight, totalMiddle)
}

const drawNotes = (
  ctx: CanvasRenderingContext2D,
  { quality, qualityInfo, testChipInfo }: RecipeCard
) => {
  ctx.font = `24px ${SANS}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'

  const wrap = (text: string) =>
    wrapText(ctx, text, CONTENT_RIGHT - NOTE_TEXT_LEFT)

  const notes = [
    { lines: wrap(testChipInfo), colour: COLOURS.muted, icon: INFO_ICON_PATH },
  ]

  if (quality === 'rough') {
    notes.unshift({
      lines: wrap(qualityInfo),
      colour: COLOURS.error,
      icon: ERROR_ICON_PATH,
    })
  }

  if (quality === 'approximate') {
    notes.unshift({
      lines: wrap(qualityInfo),
      colour: COLOURS.warning,
      icon: WARNING_ICON_PATH,
    })
  }

  const height = notes.reduce(
    (sum, { lines }) => sum + NOTE_GAP + lines.length * NOTE_LINE_HEIGHT,
    0
  )
  const top = CONTENT_BOTTOM - height - NOTES_PADDING_TOP
  drawDivider(ctx, top)

  let y = top + NOTES_PADDING_TOP
  for (const { colour, icon, lines } of notes) {
    y += NOTE_GAP
    // Icon lined up with the first line
    const iconTop = y + (NOTE_LINE_HEIGHT - NOTE_ICON_SIZE) / 2
    drawIcon(ctx, icon, colour, CONTENT_LEFT, iconTop, NOTE_ICON_SIZE)
    ctx.fillStyle = colour
    for (const line of lines) {
      ctx.fillText(line, NOTE_TEXT_LEFT, y + NOTE_LINE_HEIGHT / 2)
      y += NOTE_LINE_HEIGHT
    }
  }
  return top
}

const drawFooterUrl = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = COLOURS.text
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `500 28px ${SANS}`
  ctx.fillText(
    'claytint.com',
    IMAGE_WIDTH / 2,
    (CARD_BOTTOM + IMAGE_HEIGHT) / 2
  )
}

const drawRecipeImage = (recipe: RecipeCard) => {
  const canvas = document.createElement('canvas')
  canvas.width = IMAGE_WIDTH
  canvas.height = IMAGE_HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available')

  ctx.strokeStyle = COLOURS.border
  ctx.lineWidth = 2
  ctx.fillStyle = COLOURS.bg
  ctx.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT)

  drawHeader(ctx)
  drawCard(ctx)

  // Draw notes first, so the preview and ingredients can use the remaining space
  const notesTop = drawNotes(ctx, recipe)
  const { rowHeight, previewHeight } = getLayoutSizes(
    recipe.ingredients.length + 1, // ingredients + total
    notesTop - CONTENT_TOP - PALETTE_ROW_HEIGHT - NOTES_MARGIN_TOP
  )
  const paletteTop = CONTENT_TOP + previewHeight

  drawPreview(ctx, CONTENT_TOP, previewHeight, recipe)
  drawPalette(ctx, paletteTop + PALETTE_ROW_HEIGHT / 2, recipe.paletteName)
  drawIngredients(ctx, paletteTop + PALETTE_ROW_HEIGHT, rowHeight, recipe)
  drawFooterUrl(ctx)

  return canvas
}

const toPngFile = (recipe: RecipeCard) => {
  const fileName = `claytint-recipe-${recipe.targetHex.slice(1)}.png`

  return new Promise<File | null>((resolve) =>
    drawRecipeImage(recipe).toBlob(
      (blob) =>
        resolve(blob && new File([blob], fileName, { type: 'image/png' })),
      'image/png'
    )
  )
}

const download = (file: File) => {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  link.click()
  // Cleanup after 10s
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

export const saveImage = async (recipe: RecipeCard) => {
  const file = await toPngFile(recipe)
  if (file) download(file)
}

export const shareImage = async (recipe: RecipeCard) => {
  const file = await toPngFile(recipe)
  if (!file) return

  await navigator
    .share({ files: [file], title: 'ClayTint recipe' })
    .catch(() => {})
}
