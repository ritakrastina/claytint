import type { ReactNode } from 'react'

import { ErrorIcon, InfoIcon, WarningIcon } from './icons'
import styles from './Note.module.css'

type NoteVariant = 'info' | 'warning' | 'error'

interface NoteProps {
  id?: string
  iconSize?: number
  children?: ReactNode
}

const ICONS = { info: InfoIcon, warning: WarningIcon, error: ErrorIcon }

function Note({
  variant,
  id,
  iconSize = 16,
  children,
}: NoteProps & { variant: NoteVariant }) {
  const Icon = ICONS[variant]
  const icon = (
    <Icon className={styles[variant]} width={iconSize} height={iconSize} />
  )

  if (!children) return icon

  return (
    <p id={id} className={`${styles.note} ${styles[variant]}`}>
      {icon}
      <span>{children}</span>
    </p>
  )
}

export const InfoNote = (props: NoteProps) => <Note variant="info" {...props} />

export const WarningNote = (props: NoteProps) => (
  <Note variant="warning" {...props} />
)

export const ErrorNote = (props: NoteProps) => (
  <Note variant="error" {...props} />
)
