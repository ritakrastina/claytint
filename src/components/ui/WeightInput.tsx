import { useState } from 'react'

import { gramsToUnit, WEIGHT_UNITS, type WeightUnit } from '../../utils/units'
import styles from './WeightInput.module.css'

interface WeightInputProps {
  grams: number
  unit: WeightUnit
  onChange: (grams: number) => void
}

export function WeightInput({ grams, unit, onChange }: WeightInputProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const { step, gramsPerUnit } = WEIGHT_UNITS[unit]

  return (
    <input
      className={styles.weight}
      type="number"
      inputMode="decimal"
      min={step}
      step={step}
      aria-label="Total weight"
      value={draft ?? gramsToUnit(grams, unit)}
      aria-invalid={draft !== null && !(Number(draft) > 0)}
      onChange={(event) => {
        setDraft(event.target.value)
        const value = Number(event.target.value)
        if (value > 0) onChange(value * gramsPerUnit)
      }}
      onBlur={() => setDraft(null)}
    />
  )
}
