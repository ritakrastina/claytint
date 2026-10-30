import { useState } from 'react'

import { normaliseHex } from '../../utils/colour'
import styles from './HexInput.module.css'
import { ColorPickerIcon } from './icons'

interface HexInputProps {
  value: string // valid hex - "#rrggbb"
  onChange: (hex: string) => void
}

export function HexInput({ value, onChange }: HexInputProps) {
  const [draft, setDraft] = useState<string | null>(null)

  return (
    <span className={styles.hexRow}>
      <input
        className={styles.hexInput}
        type="text"
        value={draft ?? value}
        maxLength={7}
        spellCheck={false}
        autoComplete="off"
        aria-invalid={draft !== null && !normaliseHex(draft)}
        onChange={(event) => {
          setDraft(event.target.value)
          const hex = normaliseHex(event.target.value)
          if (hex) onChange(hex)
        }}
        onBlur={() => setDraft(null)}
      />
      <span className={styles.swatch}>
        <input
          type="color"
          className={styles.swatchInput}
          value={value}
          aria-label="Choose colour"
          onChange={(event) => {
            setDraft(null)
            onChange(event.target.value)
          }}
        />
        <ColorPickerIcon className={styles.swatchIcon} width={16} height={16} />
      </span>
    </span>
  )
}
