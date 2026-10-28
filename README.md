# ClayTint

Polymer clay colour recipes, published on [claytint.com](https://claytint.com/).

Choose the clays you own (a brand palette or your own custom colours), pick a target colour, and get a recipe to match it.

## Features & Technologies

A client-side, installable single-page application:

- **React 19 + TypeScript**: Built and bundled with Vite.
- **Zustand**: A single store, persisted to `localStorage`, holds your palette, custom clays and chosen colour.
- **[Spectral.js](https://github.com/rvanwijnen/spectral.js)**: Pigment-style (Kubelka-Munk) colour mixing, so blends behave like real clay rather than screen colours.
- **CSS Modules**: Per-component styles on a design system of CSS variables (tokens), with light and dark themes.
- **PWA**: Works offline and can be installed to a phone or desktop home screen.

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # Vitest
npm run build   # type-check and build to dist/
```

Pushing to `main` deploys to GitHub Pages.

## Credits

Colour mixing uses [Spectral.js](https://github.com/rvanwijnen/spectral.js) by Ronald van Wijnen (MIT licence).

## Disclaimer

ClayTint is independent and not affiliated with or endorsed by STAEDTLER. FIMO is their trademark. Brand colours here are my own best-guess approximations.
