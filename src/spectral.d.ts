// Type definitions from spectral.js issue#16

declare module 'spectral.js' {
  /**
   * The size of the spectral data arrays (number of samples).
   */
  export const SIZE: 38

  /**
   * The gamma value used for companding and uncompanding.
   */
  export const GAMMA: 2.4

  /**
   * Represents a color and provides methods for conversions between various color spaces
   * and for color operations like mixing and gamut mapping.
   */
  export class Color {
    /**
     * Creates a Color instance from a CSS color string.
     * @param cssColorString A string representing a CSS color (e.g., "#FF0000", "rgb(255,0,0)").
     * The string is parsed to sRGB values.
     */
    constructor(cssColorString: string)

    /**
     * Creates a Color instance from an sRGB array.
     * @param sRGBArray An array of three numbers representing sRGB values [r, g, b],
     * where each component is typically in the range 0-255.
     */
    constructor(sRGBArray: [number, number, number])

    /**
     * Creates a Color instance from an array of spectral reflectance (R) values.
     * The length of this array must be equal to `spectral.SIZE` (38).
     * @param rValuesArray An array of `spectral.SIZE` numbers representing spectral reflectance values.
     */
    constructor(rValuesArray: number[])

    /**
     * The sRGB representation of the color, as an array [r, g, b] (0-255 range).
     */
    sRGB: [number, number, number]

    /**
     * The linear RGB representation of the color, as an array [r, g, b] (0-1 range).
     */
    lRGB: [number, number, number]

    /**
     * The spectral reflectance values (R) of the color. An array of `spectral.SIZE` numbers.
     */
    R: number[]

    /**
     * The XYZ color space representation, as an array [X, Y, Z].
     */
    XYZ: [number, number, number]

    /**
     * Gets the OKLab color space representation [L, a, b].
     * @readonly
     */
    get OKLab(): [number, number, number]

    /**
     * Gets the OKLCh color space representation [L, C, h].
     * @readonly
     */
    get OKLCh(): [number, number, number]

    /**
     * Gets the array of Kubelka-Munk KS values computed from R.
     * @readonly
     */
    get KS(): number[]

    /**
     * Gets the luminance value (Y from XYZ), ensured to be at least `Number.EPSILON`.
     * @readonly
     */
    get luminance(): number

    /**
     * Gets or sets the tinting strength of the color. Defaults to 1.
     */
    tintingStrength: number

    /**
     * Checks if the color is within the sRGB gamut.
     * @param options Optional parameters.
     * @param options.epsilon Tolerance for checking gamut boundaries. Defaults to 0.
     * @returns True if the color is in gamut, false otherwise.
     */
    inGamut(options?: { epsilon?: number }): boolean

    /**
     * Maps the color to a valid sRGB gamut.
     * @param options Optional parameters.
     * @param options.method Method for gamut mapping: 'clip' or 'map'. Defaults to 'map'.
     * @returns A new Color instance that is in gamut.
     * @throws {TypeError} If the specified method is unknown.
     */
    toGamut(options?: { method?: 'clip' | 'map' }): Color

    /**
     * Converts the color to a string representation (e.g., hex or rgb).
     * The color is gamut-mapped if it's out of gamut before conversion.
     * @param options Optional parameters.
     * @param options.format Output format: 'hex' or 'rgb'. Defaults to 'hex'.
     * @param options.method Gamut mapping method: 'clip' or 'map'. Defaults to 'map'.
     * @returns The string representation of the color.
     * @throws {TypeError} If the specified method or format is unknown.
     */
    toString(options?: {
      format?: 'hex' | 'rgb'
      method?: 'map' | 'clip'
    }): string
  }

  /**
   * Mixes multiple colors using a model based on the Kubelka–Munk theory.
   * Each argument is an array [Color, factor], where factor determines the color's influence.
   * @param colors An array of [Color, number] tuples.
   * @returns The resulting mixed Color.
   */
  export function mix(...colors: [Color, number][]): Color

  /**
   * Generates a palette of colors transitioning between two colors.
   * @param a The starting Color.
   * @param b The ending Color.
   * @param size The number of colors in the palette.
   * @returns An array of Color objects forming the palette.
   */
  export function palette(a: Color, b: Color, size: number): Color[]

  /**
   * Interpolates between multiple colors based on a parameter t.
   * Each color is provided as an array [Color, position], where position is its point in the gradient (0-1).
   * @param t Interpolation parameter (0-1).
   * @param colors Colors with their positions in the gradient.
   * @returns The interpolated Color.
   */
  export function gradient(t: number, ...colors: [Color, number][]): Color

  /**
   * Parses a CSS color string (hex or rgb) and returns an array of components [R, G, B, A].
   * Alpha (A) defaults to 1 if omitted in the string.
   * @param str The CSS color string to parse.
   * @returns An array [R, G, B, A] with values typically 0-255 for R, G, B and 0-1 for A (though spectral.js uses 0-255 for A from hex).
   *          The Color class constructor uses the first 3 components.
   * @throws May throw an error or return an undefined-like result if parsing fails (behavior not fully specified for failure in provided docs).
   */
  export function parse(str: string): [number, number, number, number]

  /**
   * Computes the Delta E (Euclidean distance) between two OKLab colors.
   * @param OKLab1 First OKLab color [L, a, b].
   * @param OKLab2 Second OKLab color [L, a, b].
   * @return The distance between the two colors.
   */
  export function deltaEOK(
    OKLab1: [number, number, number],
    OKLab2: [number, number, number]
  ): number

  /**
   * Maps a color into a valid gamut using a binary search over chroma values.
   * @param color The Color instance to be gamut-mapped.
   * @param options Options for gamut mapping.
   * @param options.jnd Just-noticeable difference threshold. Defaults to 0.03.
   * @param options.e Epsilon for binary search termination. Defaults to 0.0001.
   * @return A new Color instance within gamut.
   */
  export function gamutMap(
    color: Color,
    options?: { jnd?: number; e?: number }
  ): Color

  /**
   * Computes the Kubelka–Munk absorption/scattering parameter KS for a given spectral reflectance R.
   * @param R The spectral reflectance value.
   * @return The computed KS value.
   */
  export function KS(R: number): number

  /**
   * Computes the Kubelka–Munk mixing coefficient KM from a given KS value.
   * @param KS The KS value (absorption/scattering parameter).
   * @return The computed KM mixing coefficient.
   */
  export function KM(KS: number): number

  /**
   * Applies the inverse companding (linearization) to a sRGB value (0-1 range).
   * @param x The sRGB value in the range [0, 1].
   * @return The uncompanded (linear) value.
   */
  export function uncompand(x: number): number

  /**
   * Applies the companding function to a linear RGB value (0-1 range).
   * @param x The linear value.
   * @return The companded sRGB value in the range [0, 1].
   */
  export function compand(x: number): number

  /**
   * Converts sRGB values (components 0-255) to linear RGB values (components 0-1).
   * @param sRGB Array of sRGB component values [r, g, b].
   * @return The corresponding linear RGB values [r, g, b].
   */
  export function sRGB_to_lRGB(
    sRGB: [number, number, number]
  ): [number, number, number]

  /**
   * Converts linear RGB values (components 0-1) to sRGB values (components 0-255).
   * @param lRGB Array of linear RGB values [r, g, b].
   * @return The corresponding sRGB values [r, g, b], rounded.
   */
  export function lRGB_to_sRGB(
    lRGB: [number, number, number]
  ): [number, number, number]

  /**
   * Converts XYZ color space values to linear RGB values.
   * @param XYZ XYZ representation [X, Y, Z].
   * @return The corresponding linear RGB values [r, g, b].
   */
  export function XYZ_to_lRGB(
    XYZ: [number, number, number]
  ): [number, number, number]

  /**
   * Converts linear RGB values to XYZ color space.
   * @param lRGB Linear RGB values [r, g, b].
   * @return The corresponding XYZ values [X, Y, Z].
   */
  export function lRGB_to_XYZ(
    lRGB: [number, number, number]
  ): [number, number, number]

  /**
   * Converts linear RGB values directly to OKLab by first converting to XYZ.
   * @param lRGB Linear RGB values [r, g, b].
   * @return The corresponding OKLab values [L, a, b].
   */
  export function lRGB_to_OKLab(
    lRGB: [number, number, number]
  ): [number, number, number]

  /**
   * Converts XYZ values to OKLab color space.
   * @param XYZ XYZ representation [X, Y, Z].
   * @return The resulting OKLab values [L, a, b].
   */
  export function XYZ_to_OKLab(
    XYZ: [number, number, number]
  ): [number, number, number]

  /**
   * Converts OKLab values to XYZ color space.
   * @param OKLab OKLab representation [L, a, b].
   * @return The resulting XYZ values [X, Y, Z].
   */
  export function OKLab_to_XYZ(
    OKLab: [number, number, number]
  ): [number, number, number]

  /**
   * Converts OKLab values to OKLCh color space.
   * @param OKLab OKLab representation [L, a, b].
   * @return An array [L, C, H] representing the OKLCh color. H is in degrees (0-360).
   */
  export function OKLab_to_OKLCh(
    OKLab: [number, number, number]
  ): [number, number, number]

  /**
   * Converts OKLCh values to OKLab color space.
   * @param OKLCh An array [L, C, H] representing the OKLCh color. H is in degrees.
   * @return The resulting OKLab values [L, a, b].
   */
  export function OKLCh_to_OKLab(
    OKLCh: [number, number, number]
  ): [number, number, number]

  /**
   * Converts spectral reflectance values (R) to XYZ using CIE color matching functions.
   * @param R Array of spectral reflectance values (length `spectral.SIZE`).
   * @return The resulting XYZ values [X, Y, Z].
   */
  export function R_to_XYZ(R: number[]): [number, number, number]

  /**
   * Converts linear RGB values to spectral reflectance values (R).
   * @param lRGB Linear RGB values [r, g, b].
   * @return The resulting spectral reflectance values (array of length `spectral.SIZE`).
   */
  export function lRGB_to_R(lRGB: [number, number, number]): number[]

  /**
   * Checks if all values in the provided linear RGB array are within gamut.
   * This is a standalone utility function. The Color class has its own inGamut method.
   * @param lRGB Array of linear RGB values [r, g, b].
   * @param options Options for the check.
   * @param options.epsilon Tolerance value. Defaults to 0.
   * @return True if all values are within the range [-epsilon, 1+epsilon].
   */
  export function inGamut(
    lRGB: [number, number, number],
    options?: { epsilon?: number }
  ): boolean
}
