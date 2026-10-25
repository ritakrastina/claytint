import { useTheme } from '../hooks/useTheme'
import styles from './Footer.module.css'
import { MoonIcon, SunIcon } from './ui/icons'

const year = new Date().getFullYear()

export function Footer() {
  const { theme, setTheme } = useTheme()

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <span>© {year} Rita Krastiņa</span>

        <div className={styles.themeSwitch} role="group" aria-label="Theme">
          <button
            type="button"
            aria-label="Light mode"
            title="Light mode"
            aria-pressed={theme === 'light'}
            onClick={() => setTheme('light')}
          >
            <SunIcon width={16} height={16} />
          </button>
          <button
            type="button"
            aria-label="Dark mode"
            title="Dark mode"
            aria-pressed={theme === 'dark'}
            onClick={() => setTheme('dark')}
          >
            <MoonIcon width={16} height={16} />
          </button>
        </div>
      </div>
    </footer>
  )
}
