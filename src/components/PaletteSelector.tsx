import { useState } from 'react'

import {
  BRAND_PALETTES,
  CUSTOM_PALETTE,
  GENERAL_PALETTES,
  type ClayDraft,
} from '../data/palettes'
import { usePalette } from '../hooks/usePalette'
import { DEFAULT_COLOUR, hslToHex } from '../utils/colour'
import { ClayDialog } from './ClayDialog'
import styles from './PaletteSelector.module.css'
import { ClaySwatch } from './ui/ClaySwatch'
import { Field } from './ui/Field'

export function PaletteSelector() {
  const { palette, selectPalette, saveClay, removeClay } = usePalette()
  const [clayDraft, setClayDraft] = useState<ClayDraft>()

  const isCustom = palette.id === CUSTOM_PALETTE.id

  return (
    <div className={styles.paletteSelector}>
      <div className={styles.fieldWrapper}>
        <Field label="Palette">
          <select
            className={styles.select}
            aria-describedby="palette-info"
            value={palette.id}
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
          <InfoIcon />
          {palette.info}
        </p>
      </div>

      <ul className={styles.swatches} aria-label={`${palette.name} swatches`}>
        {palette.clays.map((clay) => (
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
              <PlusIcon />
              Add Clay
            </button>
          </li>
        )}
      </ul>

      {isCustom && (
        <ClayDialog
          id="clay-dialog"
          draft={clayDraft}
          clays={palette.clays}
          onSave={saveClay}
          onRemove={removeClay}
          onClose={() => setClayDraft(undefined)}
        />
      )}
    </div>
  )
}

const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 -960 960 960"
    height="16px"
    width="16px"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M508.5-291.5Q520-303 520-320v-160q0-17-11.5-28.5T480-520q-17 0-28.5 11.5T440-480v160q0 17 11.5 28.5T480-280q17 0 28.5-11.5Zm0-320Q520-623 520-640t-11.5-28.5Q497-680 480-680t-28.5 11.5Q440-657 440-640t11.5 28.5Q463-600 480-600t28.5-11.5ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
  </svg>
)

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 -960 960 960"
    height="24px"
    width="24px"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M440-440H240q-17 0-28.5-11.5T200-480q0-17 11.5-28.5T240-520h200v-200q0-17 11.5-28.5T480-760q17 0 28.5 11.5T520-720v200h200q17 0 28.5 11.5T760-480q0 17-11.5 28.5T720-440H520v200q0 17-11.5 28.5T480-200q-17 0-28.5-11.5T440-240v-200Z" />
  </svg>
)
