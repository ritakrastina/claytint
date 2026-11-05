import { useEffect, useState } from 'react'

// Light/ dark/ system (not saved, follows the OS)
type Theme = 'light' | 'dark' | 'system'

const KEY = 'theme'
const chrome = { light: '#efefec', dark: '#151615' }

// False while prerendering at build time (see vite.config.ts)
const isBrowser = typeof document !== 'undefined'

// index.html applies the saved choice before first paint, so this reads it back from <html>.
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = isBrowser ? document.documentElement.dataset.theme : undefined
    return (saved as Theme | undefined) ?? 'system'
  })

  useEffect(() => {
    if (theme === 'system') delete document.documentElement.dataset.theme
    else document.documentElement.dataset.theme = theme

    for (const meta of document.querySelectorAll<HTMLMetaElement>(
      'meta[name="theme-color"]'
    )) {
      const own = meta.media.includes('dark') ? 'dark' : 'light'
      meta.content = chrome[theme === 'system' ? own : theme]
    }

    try {
      if (theme === 'system') localStorage.removeItem(KEY)
      else localStorage.setItem(KEY, theme)
    } catch {
      // Storage blocked (private mode etc.)
    }
  }, [theme])

  return { theme, setTheme }
}
