export interface Hsl {
  h: number // hue (0–360)
  s: number // saturation (0–100)
  l: number // lightness (0–100)
}

export const hslToHex = ({ h, s, l }: Hsl): string => {
  const saturation = s / 100
  const lightness = l / 100
  const amplitude = saturation * Math.min(lightness, 1 - lightness)

  const channelHex = (n: number) => {
    const k = (n + h / 30) % 12
    const value =
      lightness - amplitude * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, '0')
  }

  return `#${channelHex(0)}${channelHex(8)}${channelHex(4)}`
}

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

export const hexToHsl = (hex: string): Hsl | null => {
  const match = HEX_PATTERN.exec(hex.trim())
  if (!match) return null

  const digits =
    match[1].length === 3
      ? [...match[1]].map((digit) => digit + digit).join('')
      : match[1]

  // red, green, blue
  const [r, g, b] = [0, 2, 4].map(
    (i) => parseInt(digits.slice(i, i + 2), 16) / 255
  )

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  const lightness = (max + min) / 2

  if (delta === 0) {
    // gray
    return { h: 0, s: 0, l: lightness * 100 }
  }

  const saturation = delta / (1 - Math.abs(2 * lightness - 1))

  let hue: number
  if (max === r) {
    hue = ((g - b) / delta) % 6
  } else if (max === g) {
    hue = (b - r) / delta + 2
  } else {
    hue = (r - g) / delta + 4
  }

  return { h: (hue * 60 + 360) % 360, s: saturation * 100, l: lightness * 100 }
}
