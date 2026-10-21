import type { ReactNode } from 'react'

import styles from './Field.module.css'

interface FieldProps {
  label: string
  value?: string
  children: ReactNode
}

export function Field({ label, value, children }: FieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>
        {label}
        {value && (
          <span className={styles.value} aria-hidden>
            {value}
          </span>
        )}
      </span>
      {children}
    </label>
  )
}
