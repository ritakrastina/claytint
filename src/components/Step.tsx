import { useId } from 'react'
import type { ReactNode } from 'react'

import styles from './Step.module.css'

interface StepProps {
  eyebrow: string
  title: string
  children: ReactNode
}

export function Step({ eyebrow, title, children }: StepProps) {
  const titleId = useId()

  return (
    <section className={styles.step} aria-labelledby={titleId}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  )
}
