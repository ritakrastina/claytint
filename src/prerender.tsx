import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'

import { App } from './App'

// Renders the app in its default state for index.html at build time
// (prerender plugin in vite.config.ts)
export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>
  )
}
