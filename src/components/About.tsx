import { useId, type ReactNode } from 'react'

import styles from './About.module.css'
import {
  FlameIcon,
  FlaskIcon,
  HeartIcon,
  ScreenIcon,
  TagIcon,
} from './ui/icons'

type Note = {
  icon: ReactNode
  title: string
  text: string
}

const NOTES: Note[] = [
  {
    icon: <FlaskIcon width={20} height={20} />,
    title: 'Guides, not formulas',
    text: 'Recipes are a starting point. Clay type, exact colour and accurate measurements all affect the result. Mix a small test chip first.',
  },
  {
    icon: <ScreenIcon width={20} height={20} />,
    title: 'Screens vary',
    text: 'Display calibration, brightness, Night Shift or True Tone and even room lighting all change how a colour looks.',
  },
  {
    icon: <FlameIcon width={20} height={20} />,
    title: 'Baking shifts colour',
    text: "Clay colours can change with oven temperature and baking time. Follow the manufacturer's baking instructions.",
  },
  {
    icon: <HeartIcon width={20} height={20} />,
    title: 'Free hobby project',
    text: 'Made for my own clay work and shared in case it helps. No ads, accounts or tracking. Your palette is saved only in this browser. Provided as-is.',
  },
  {
    icon: <TagIcon width={20} height={20} />,
    title: 'Not affiliated',
    text: 'ClayTint is independent and not affiliated with or endorsed by STAEDTLER. FIMO is their trademark. Brand colours here are my own best-guess approximations.',
  },
]

export function About() {
  const titleId = useId()

  return (
    <section aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        Good to know
      </h2>

      <ul className={styles.notes}>
        {NOTES.map((note) => (
          <li key={note.title} className={styles.note}>
            <h3 className={styles.noteTitle}>
              {note.icon}
              {note.title}
            </h3>
            <p className={styles.noteText}>{note.text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
