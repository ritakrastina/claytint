import { UNITS, type Unit } from '../../utils/units'
import styles from './UnitSwitch.module.css'

interface UnitSwitchProps {
  value: Unit
  onChange: (unit: Unit) => void
}

export function UnitSwitch({ value, onChange }: UnitSwitchProps) {
  return (
    <fieldset className={styles.switch} aria-label="Show amounts as">
      {UNITS.map((unit) => (
        <label key={unit}>
          <input
            type="radio"
            name="unit"
            checked={value === unit}
            onChange={() => onChange(unit)}
          />
          {unit}
        </label>
      ))}
    </fieldset>
  )
}
