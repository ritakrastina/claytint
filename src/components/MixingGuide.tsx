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
import { Header } from './Header'
import styles from './MixingGuide.module.css'
import { ClaySwatch } from './ui/ClaySwatch'
import { PaletteIcon, PrintIcon } from './ui/icons'
import { ErrorNote, InfoNote, WarningNote } from './ui/Note'

const GAP_INFO: Record<GapReason, string> = {
  'too-vivid':
    'Target is more vivid than these clays can reach, so this is the closest duller mix.',
  'too-muted':
    'Target is greyer than these clays can reach, so this is the closest brighter mix.',
  'too-light': 'Target is lighter than these clays can reach.',
  'too-dark': 'Target is darker than these clays can reach.',
  hue: "Target is out of these clays' reach, so the mix leans to a nearby hue.",
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
                    aria-label="Total weight"
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
