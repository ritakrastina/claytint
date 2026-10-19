import { useTheme } from '../hooks/useTheme'
import styles from './Footer.module.css'

const year = new Date().getFullYear()

export function Footer() {
  const { resolved, setTheme } = useTheme()

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <span>© {year} Rita Krastiņa</span>

        <div className={styles.themeSwitch} role="group" aria-label="Theme">
          <button
            type="button"
            aria-label="Light mode"
            title="Light mode"
            aria-pressed={resolved === 'light'}
            onClick={() => setTheme('light')}
          >
            <SunIcon />
          </button>
          <button
            type="button"
            aria-label="Dark mode"
            title="Dark mode"
            aria-pressed={resolved === 'dark'}
            onClick={() => setTheme('dark')}
          >
            <MoonIcon />
          </button>
        </div>
      </div>
    </footer>
  )
}

const iconProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

function SunIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg {...iconProps}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}
