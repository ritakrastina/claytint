import { useState, type PointerEvent } from 'react'

import { DEFAULT_COLOUR, hexToHsl, hslToHex, type Hsl } from '../utils/colour'
import styles from './ColourPicker.module.css'
import { Field } from './Field'
import { HexInput } from './HexInput'

interface ColourPickerProps {
  onChange: (hex: string) => void
}

export function ColourPicker({ onChange }: ColourPickerProps) {
  const [hsl, setHsl] = useState(DEFAULT_COLOUR)

  const hex = hslToHex(hsl)
  const pureColour = `hsl(${hsl.h} ${hsl.s}% 50%)`
  const lightnessLabel = `${Math.round(hsl.l)}%`

  // Overlay a translucent black or white layer over the wheel to adjust the lightness (default 50%)
  const overlayStyle =
    hsl.l < 50
      ? { backgroundColor: 'black', opacity: (50 - hsl.l) / 50 }
      : { backgroundColor: 'white', opacity: (hsl.l - 50) / 50 }

  // Position the marker on the wheel based on the hue and saturation values
  const angle = (hsl.h * Math.PI) / 180
  const markerStyle = {
    left: `${50 + (Math.sin(angle) * hsl.s) / 2}%`,
    top: `${50 - (Math.cos(angle) * hsl.s) / 2}%`,
    backgroundColor: hex,
  }

  const setNewColour = (hsl: Hsl) => {
    setHsl(hsl)
    onChange(hslToHex(hsl))
  }

  const handleColourWheelPick = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const radius = rect.width / 2
    const dx = event.clientX - rect.left - radius
    const dy = event.clientY - rect.top - radius
    // Hue angle clockwise from the top
    const h = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360
    // Saturation gradient from the center
    const s = Math.min(Math.hypot(dx, dy) / radius, 1) * 100
    setNewColour({ ...hsl, h, s })
  }

  return (
    <div className={styles.colourPicker}>
      <div
        className={styles.wheel}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          handleColourWheelPick(event)
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            handleColourWheelPick(event)
          }
        }}
      >
        <div className={styles.overlay} style={overlayStyle} />
        <div className={styles.marker} style={markerStyle} />
      </div>

      <Field label="Lightness" value={lightnessLabel}>
        <input
          className={styles.slider}
          type="range"
          min={0}
          max={100}
          step={1}
          value={hsl.l}
          aria-valuetext={lightnessLabel}
          onChange={(event) =>
            setNewColour({ ...hsl, l: Number(event.target.value) })
          }
          style={{
            background: `linear-gradient(to right, black, ${pureColour}, white)`,
          }}
        />
      </Field>

      <Field label="Hex">
        <HexInput
          value={hex}
          onChange={(hex) => {
            const hsl = hexToHsl(hex)
            if (hsl) setNewColour(hsl)
          }}
        />
      </Field>
    </div>
  )
}
