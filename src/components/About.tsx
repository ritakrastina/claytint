import type { ReactNode } from 'react'

import styles from './About.module.css'
import {
  DownloadIcon,
  FlameIcon,
  FlaskIcon,
  HeartIcon,
  PaletteIcon,
  ScreenIcon,
  TagIcon,
} from './ui/icons'

type Item = {
  icon: ReactNode
  title: string
  text: string
}

const ITEMS: Item[] = [
  {
    icon: <ScreenIcon width={20} height={20} />,
    title: 'Screens vary',
    text: 'Calibration, brightness, Night Shift, True Tone and even room lighting change how colours look.',
  },
  {
    icon: <PaletteIcon width={20} height={20} />,
    title: 'How mixing works',
    text: 'Recipes are predicted with spectral.js using Kubelka-Munk pigment theory. The closest match with the fewest clays wins.',
  },
  {
    icon: <FlaskIcon width={20} height={20} />,
    title: 'Guides, not formulas',
    text: 'Recipes are a starting point. Clay brand, batch and how precisely you measure all affect the result. Always mix a test chip first.',
  },
  {
    icon: <FlameIcon width={20} height={20} />,
    title: 'Baking shifts colour',
    text: "Oven temperature and baking time can shift colours. Follow the manufacturer's baking instructions.",
  },
  {
    icon: <HeartIcon width={20} height={20} />,
    title: 'Free hobby project',
    text: 'Made for my own clay work and shared in case it helps. No ads, no cookies, just anonymous visit counts. Your clays and settings stay only in this browser. Provided as-is.',
  },
  {
    icon: <TagIcon width={20} height={20} />,
    title: 'Not affiliated',
    text: 'ClayTint is independent and not affiliated with or endorsed by STAEDTLER. FIMO is their trademark. Brand colours are my best-guess approximations.',
  },
  {
    icon: <DownloadIcon width={20} height={20} />,
    title: 'Works as an app',
    text: 'Add ClayTint to your device: look for the "Add to Home Screen", "Install" or "Share" option in the browser\'s menu. Recipes work offline.',
  },
]

export function About() {
  return (
    <aside className={styles.about}>
      <ul className={styles.list}>
        {ITEMS.map((item) => (
          <li key={item.title}>
            <strong className={styles.itemTitle}>
              {item.icon}
              {item.title}
            </strong>
            <p className={styles.itemText}>{item.text}</p>
          </li>
        ))}
      </ul>
    </aside>
  )
}
