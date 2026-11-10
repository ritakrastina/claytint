import { useState } from 'react'

import { useRecipe } from '../hooks/useRecipe'
import { useStore } from '../store'
import { saveImage, shareImage } from '../utils/recipeImage'
import { gramsToUnit, WEIGHT_UNITS } from '../utils/units'
import { Header } from './Header'
import styles from './MixingGuide.module.css'
import { ClaySwatch } from './ui/ClaySwatch'
import { DownloadIcon, PaletteIcon, PrintIcon, ShareIcon } from './ui/icons'
import { ErrorNote, InfoNote, WarningNote } from './ui/Note'
import { UnitSwitch } from './ui/UnitSwitch'

// iOS PWA ignores window.print()
const canPrint =
  typeof navigator === 'undefined' ||
  !('standalone' in navigator && navigator.standalone === true)

// Check if browser can share files
const canShare =
  typeof navigator !== 'undefined' &&
  navigator.canShare?.({
    files: [new File([], 'recipe.png', { type: 'image/png' })],
  }) === true

export function MixingGuide() {
  const recipe = useRecipe()
  const unit = useStore((state) => state.unit)
  const setUnit = useStore((state) => state.setUnit)
  const totalGrams = useStore((state) => state.totalGrams)
  const setTotalGrams = useStore((state) => state.setTotalGrams)

  const [weightDraft, setWeightDraft] = useState<string | null>(null)

  return (
    <div className={styles.mixingGuide} data-print-area>
      {recipe ? (
        <>
          <div className={styles.recipe}>
            <div className={styles.printHeader}>
              <Header />
            </div>

            <div className={styles.preview}>
              <div
                className={styles.block}
                style={{ backgroundColor: recipe.targetHex }}
              >
                <div className={styles.chip}>
                  Target
                  <span className={styles.hex}>{recipe.targetHex}</span>
                </div>
              </div>
              <div
                className={styles.block}
                style={{ backgroundColor: recipe.mixHex }}
              >
                <div className={styles.chip}>
                  <span className={styles.label}>
                    {recipe.quality === 'rough' && <ErrorNote iconSize={14} />}
                    {recipe.quality === 'approximate' && (
                      <WarningNote iconSize={14} />
                    )}
                    Mix
                  </span>
                  <span className={styles.hex}>{recipe.mixHex}</span>
                </div>
              </div>
            </div>

            <p className={styles.printPalette}>
              <PaletteIcon width={18} height={18} />
              {recipe.paletteName}
            </p>

            <div className={styles.toolbar}>
              <UnitSwitch value={unit} onChange={setUnit} />

              {unit !== 'parts' && (
                <input
                  className={styles.weight}
                  type="number"
                  inputMode="decimal"
                  min={WEIGHT_UNITS[unit].step}
                  step={WEIGHT_UNITS[unit].step}
                  aria-label="Total weight"
                  value={weightDraft ?? gramsToUnit(totalGrams, unit)}
                  aria-invalid={
                    weightDraft !== null && !(Number(weightDraft) > 0)
                  }
                  onChange={(event) => {
                    setWeightDraft(event.target.value)
                    const value = Number(event.target.value)
                    if (value > 0) {
                      setTotalGrams(value * WEIGHT_UNITS[unit].gramsPerUnit)
                    }
                  }}
                  onBlur={() => setWeightDraft(null)}
                />
              )}
            </div>

            <ul className={styles.ingredients} aria-label="Clays to mix">
              {recipe.ingredients.map((ingredient) => (
                <li key={ingredient.id} className={styles.ingredient}>
                  <ClaySwatch hex={ingredient.hex} label={ingredient.label} />
                  <span className={styles.amount}>{ingredient.amount}</span>
                </li>
              ))}

              <li className={styles.printTotal}>
                <span className={styles.amount}>{recipe.total}</span>
              </li>
            </ul>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => saveImage(recipe)}
              >
                <DownloadIcon width={16} height={16} />
                Save
              </button>

              {canShare && (
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={() => shareImage(recipe)}
                >
                  <ShareIcon width={16} height={16} />
                  Share
                </button>
              )}

              {canPrint && (
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={() => window.print()}
                >
                  <PrintIcon width={16} height={16} />
                  Print
                </button>
              )}
            </div>
          </div>

          <footer className={styles.notes}>
            {recipe.quality === 'rough' && (
              <ErrorNote>{recipe.qualityInfo}</ErrorNote>
            )}
            {recipe.quality === 'approximate' && (
              <WarningNote>{recipe.qualityInfo}</WarningNote>
            )}
            <InfoNote>{recipe.testChipInfo}</InfoNote>
          </footer>
        </>
      ) : (
        <div className={styles.empty}>
          <h3>No clays yet</h3>
          <p>Add your clays in step 1 to get a recipe.</p>
        </div>
      )}
    </div>
  )
}
