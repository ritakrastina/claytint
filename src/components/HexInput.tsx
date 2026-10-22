import { useState } from 'react'

import { normaliseHex } from '../utils/colour'
import styles from './HexInput.module.css'

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
      <input
        type="color"
        className={styles.swatch}
        value={value}
        aria-label="Choose colour"
        onChange={(event) => {
          setDraft(null)
          onChange(event.target.value)
        }}
      />
    </span>
  )
}
