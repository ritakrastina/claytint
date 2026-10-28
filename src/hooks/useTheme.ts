import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const KEY = 'theme'
const darkQuery = '(prefers-color-scheme: dark)'
const chrome: Record<Theme, string> = { light: '#efefec', dark: '#151615' }

const parse = (value: string | undefined): Theme | undefined => {
  return value === 'light' || value === 'dark' ? value : undefined
}

// False while prerendering at build time (see vite.config.ts)
const isBrowser = typeof document !== 'undefined'

// Light/dark choice. Follows the OS until the user picks one, then remembers it.
// index.html applies the saved choice before first paint, so this reads it back from <html>.
export function useTheme() {
  const [theme, setThemeState] = useState<Theme | undefined>(() =>
    isBrowser ? parse(document.documentElement.dataset.theme) : undefined
  )
  const [systemDark, setSystemDark] = useState(
    () => isBrowser && matchMedia(darkQuery).matches
  )

  useEffect(() => {
    const query = matchMedia(darkQuery)
    const onChange = () => setSystemDark(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (theme) document.documentElement.dataset.theme = theme
    else delete document.documentElement.dataset.theme

    for (const meta of document.querySelectorAll<HTMLMetaElement>(
      'meta[name="theme-color"]'
    )) {
      const own: Theme = meta.media.includes('dark') ? 'dark' : 'light'
      meta.content = chrome[theme ?? own]
    }
  }, [theme])

  const setTheme = (next: Theme) => {
    setThemeState(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // Storage blocked (private mode etc.)
    }
  }

  return {
    theme: theme ?? (systemDark ? 'dark' : 'light'),
    setTheme,
  }
}
