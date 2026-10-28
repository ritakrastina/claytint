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
import styles from './MixingGuide.module.css'
import { ClaySwatch } from './ui/ClaySwatch'
import { PrintIcon } from './ui/icons'
import { ErrorNote, InfoNote, WarningNote } from './ui/Note'

const GAP_INFO: Record<GapReason, string> = {
  'too-vivid':
    'Target colour is more vivid than these clays can mix, so the mix is a duller version of it.',
  'too-muted':
    'Target colour is greyer than these clays can mix, so the mix is a more saturated version of it.',
  'too-light': 'Target colour is lighter than these clays can mix.',
  'too-dark': 'Target colour is darker than these clays can mix.',
  hue: "This shade is out of these clays' reach, so the mix leans towards a neighbouring hue.",
}

const formatParts = (parts: number) =>
  `${parts} ${parts === 1 ? 'part' : 'parts'}`

export function MixingGuide() {
  const colour = useStore((state) => state.colour)
  const paletteId = useStore((state) => state.paletteId)
  const customClays = useStore((state) => state.customClays)
  const weight = useStore((state) => state.weight)
  const setWeight = useStore((state) => state.setWeight)
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
      : `${(fraction * weight).toFixed(2)} g`

  const getTotalAmount = (ingredients: Ingredient[]) =>
    unit === 'parts'
      ? formatParts(ingredients.reduce((sum, { parts = 0 }) => sum + parts, 0))
      : `${weight.toFixed(2)} g`

  return (
    <div className={styles.mixingGuide}>
      {recipe ? (
        <>
          <div className={styles.recipe} data-print-area>
            <header className={styles.printHeader}>
              <p className={styles.printTitle}>
                ClayTint - colour mixing guide
              </p>
              <p>Palette: {name}</p>
            </header>

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

            <div className={styles.toolbar}>
              <fieldset className={styles.switch} aria-label="Show amounts as">
                <label>
                  <input
                    type="radio"
                    name="unit"
                    checked={unit === 'parts'}
                    onChange={() => setUnit('parts')}
                  />
                  Parts
                </label>
                <label>
                  <input
                    type="radio"
                    name="unit"
                    checked={unit === 'grams'}
                    onChange={() => setUnit('grams')}
                  />
                  Grams
                </label>
              </fieldset>

              {unit === 'grams' && (
                <div className={styles.weight}>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={1}
                    step={1}
                    aria-label="Target weight"
                    value={weightDraft ?? weight}
                    aria-invalid={
                      weightDraft !== null && !(Number(weightDraft) > 0)
                    }
                    onChange={(event) => {
                      setWeightDraft(event.target.value)
                      const grams = Number(event.target.value)
                      if (grams > 0) setWeight(grams)
                    }}
                    onBlur={() => setWeightDraft(null)}
                  />
                  <span>g</span>
                </div>
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

            <button
              type="button"
              className={styles.printButton}
              onClick={() => window.print()}
            >
              <PrintIcon width={16} height={16} />
              Print
            </button>
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
              Display colours are approximate. Mix a small test batch first.
            </InfoNote>
          </footer>
        </>
      ) : (
        <div className={styles.empty}>
          <h3>No clays to mix yet</h3>
          <p>
            Add the clays you own in step 1 and your mixing recipe appears here.
          </p>
        </div>
      )}
    </div>
  )
}
