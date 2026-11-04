import { useDeferredValue, useMemo, useState } from 'react'

import { resolvePalette } from '../data/palettes'
import { useStore } from '../store'
import { hslToHex } from '../utils/colour'
import {
  explainGap,
  findBestRecipe,
  type GapReason,
  type Ingredient,
} from '../utils/mixing'
import {
  formatParts,
  formatWeight,
  gramsToUnit,
  WEIGHT_UNITS,
} from '../utils/units'
import { Header } from './Header'
import styles from './MixingGuide.module.css'
import { ClaySwatch } from './ui/ClaySwatch'
import { PaletteIcon, PrintIcon } from './ui/icons'
import { ErrorNote, InfoNote, WarningNote } from './ui/Note'
import { UnitSwitch } from './ui/UnitSwitch'

const GAP_INFO: Record<GapReason, string> = {
  'too-vivid':
    'Target is more vivid than these clays can reach, so this is the closest duller mix.',
  'too-muted':
    'Target is greyer than these clays can reach, so this is the closest brighter mix.',
  'too-light': 'Target is lighter than these clays can reach.',
  'too-dark': 'Target is darker than these clays can reach.',
  hue: "Target is out of these clays' reach, so the mix leans to a nearby hue.",
}

// iOS PWA ignore window.print()
const canPrint =
  typeof navigator === 'undefined' ||
  !('standalone' in navigator && navigator.standalone === true)

export function MixingGuide() {
  const colour = useStore((state) => state.colour)
  const paletteId = useStore((state) => state.paletteId)
  const customClays = useStore((state) => state.customClays)
  const totalGrams = useStore((state) => state.totalGrams)
  const setTotalGrams = useStore((state) => state.setTotalGrams)
  const unit = useStore((state) => state.unit)
  const setUnit = useStore((state) => state.setUnit)

  const [weightDraft, setWeightDraft] = useState<string | null>(null)

  const { name, clays } = resolvePalette(paletteId, customClays)
  // Deferred so the colour picker stays responsive while the recipe is found
  const targetHex = useDeferredValue(hslToHex(colour))
  const bestRecipe = useMemo(
    () => findBestRecipe(targetHex, clays),
    [targetHex, clays]
  )

  // Rounding to whole parts may shift the colour, so show the rounded recipe
  const recipe = unit === 'parts' ? bestRecipe?.rounded : bestRecipe?.exact

  const getAmount = ({ fraction, parts }: Ingredient) =>
    unit === 'parts'
      ? formatParts(parts ?? 0)
      : formatWeight(fraction * totalGrams, unit)

  const getTotalAmount = (ingredients: Ingredient[]) =>
    unit === 'parts'
      ? formatParts(ingredients.reduce((sum, { parts = 0 }) => sum + parts, 0))
      : formatWeight(totalGrams, unit)

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
                style={{ backgroundColor: targetHex }}
              >
                <div className={styles.chip}>
                  Target
                  <span className={styles.hex}>{targetHex}</span>
                </div>
              </div>
              <div
                className={styles.block}
                style={{ backgroundColor: recipe.hex }}
              >
                <div className={styles.chip}>
                  <span className={styles.label}>
                    {recipe.quality === 'rough' && <ErrorNote iconSize={14} />}
                    {recipe.quality === 'approximate' && (
                      <WarningNote iconSize={14} />
                    )}
                    Mix
                  </span>
                  <span className={styles.hex}>{recipe.hex}</span>
                </div>
              </div>
            </div>

            <p className={styles.printPalette}>
              <PaletteIcon width={18} height={18} />
              {name}
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
                <li key={ingredient.clay.id} className={styles.ingredient}>
                  <ClaySwatch
                    hex={ingredient.clay.hex}
                    label={ingredient.clay.name || ingredient.clay.hex}
                  />
                  <span className={styles.amount}>{getAmount(ingredient)}</span>
                </li>
              ))}

              <li className={styles.printTotal}>
                <span className={styles.amount}>
                  {getTotalAmount(recipe.ingredients)}
                </span>
              </li>
            </ul>

            {canPrint && (
              <button
                type="button"
                className={styles.printButton}
                onClick={() => window.print()}
              >
                <PrintIcon width={16} height={16} />
                Print
              </button>
            )}
          </div>

          <footer className={styles.notes}>
            {recipe.quality === 'rough' && (
              <ErrorNote>
                {GAP_INFO[explainGap(targetHex, recipe.hex)]}
              </ErrorNote>
            )}
            {recipe.quality === 'approximate' && (
              <WarningNote>
                {GAP_INFO[explainGap(targetHex, recipe.hex)]}
              </WarningNote>
            )}
            <InfoNote>
              Real clay may look different, so mix a small test chip first.
            </InfoNote>
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
