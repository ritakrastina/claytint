export const UNITS = ['parts', 'grams', 'ounces'] as const

export type Unit = (typeof UNITS)[number]
export type WeightUnit = Exclude<Unit, 'parts'>

export const WEIGHT_UNITS: Record<
  WeightUnit,
  {
    symbol: string
    gramsPerUnit: number
    step: number
    decimals: number
  }
> = {
  grams: {
    symbol: 'g',
    gramsPerUnit: 1,
    step: 1,
    decimals: 2,
  },
  ounces: {
    symbol: 'oz',
    gramsPerUnit: 28.349523125,
    step: 0.1,
    decimals: 3,
  },
}

export const gramsToUnit = (grams: number, unit: WeightUnit) => {
  const { gramsPerUnit, decimals } = WEIGHT_UNITS[unit]
  return Number((grams / gramsPerUnit).toFixed(decimals))
}

export const formatWeight = (grams: number, unit: WeightUnit) => {
  const { symbol, decimals } = WEIGHT_UNITS[unit]
  const value = gramsToUnit(grams, unit)
  const smallest = 10 ** -decimals // smallest value, e.g., 3 decimals -> 0.001

  return value === 0
    ? `< ${smallest.toFixed(decimals)} ${symbol}`
    : `${value.toFixed(decimals)} ${symbol}`
}

export const formatParts = (parts: number) =>
  `${parts} ${parts === 1 ? 'part' : 'parts'}`
