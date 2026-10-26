import { useState } from 'react'

import {
  BRAND_PALETTES,
  CUSTOM_PALETTE,
  GENERAL_PALETTES,
  resolvePalette,
  type ClayDraft,
} from '../data/palettes'
import { useStore } from '../store'
import { DEFAULT_COLOUR, hslToHex } from '../utils/colour'
import { ClayDialog } from './ClayDialog'
import styles from './PaletteSelector.module.css'
import { ClaySwatch } from './ui/ClaySwatch'
import { Field } from './ui/Field'
import { InfoIcon, PlusIcon } from './ui/icons'

export function PaletteSelector() {
  const paletteId = useStore((state) => state.paletteId)
  const customClays = useStore((state) => state.customClays)
  const selectPalette = useStore((state) => state.selectPalette)
  const [clayDraft, setClayDraft] = useState<ClayDraft>()

  const selectedPalette = resolvePalette(paletteId, customClays)
  const isCustom = selectedPalette.id === CUSTOM_PALETTE.id

  return (
    <div className={styles.paletteSelector}>
      <div className={styles.fieldWrapper}>
        <Field label="Palette">
          <select
            className={styles.select}
            aria-describedby="palette-info"
            value={selectedPalette.id}
            onChange={(event) => selectPalette(event.target.value)}
          >
            <optgroup label="General">
              {GENERAL_PALETTES.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Brands">
              {BRAND_PALETTES.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Custom">
              <option value={CUSTOM_PALETTE.id}>{CUSTOM_PALETTE.name}</option>
            </optgroup>
          </select>
        </Field>

        <p id="palette-info" className={styles.info}>
          <InfoIcon width={16} height={16} />
          {selectedPalette.info}
        </p>
      </div>

      <ul
        className={styles.swatches}
        aria-label={`${selectedPalette.name} swatches`}
      >
        {selectedPalette.clays.map((clay) => (
          <li key={clay.id}>
            {isCustom ? (
              <button
                type="button"
                className={styles.chipButton}
                aria-label={`Edit ${clay.name || clay.hex}`}
                commandfor="clay-dialog"
                command="show-modal"
                onClick={() => setClayDraft(clay)}
              >
                <ClaySwatch hex={clay.hex} label={clay.name || clay.hex} />
              </button>
            ) : (
              <div className={styles.chip}>
                <ClaySwatch hex={clay.hex} label={clay.name} />
              </div>
            )}
          </li>
        ))}

        {isCustom && (
          <li>
            <button
              type="button"
              className={styles.chipButtonAdd}
              commandfor="clay-dialog"
              command="show-modal"
              onClick={() =>
                setClayDraft({ hex: hslToHex(DEFAULT_COLOUR), name: '' })
              }
            >
              <PlusIcon width={24} height={24} />
              Add Clay
            </button>
          </li>
        )}
      </ul>

      {isCustom && (
        <ClayDialog
          id="clay-dialog"
          draft={clayDraft}
          onClose={() => setClayDraft(undefined)}
        />
      )}
    </div>
  )
}
