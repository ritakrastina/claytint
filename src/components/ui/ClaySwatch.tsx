import styles from './ClaySwatch.module.css'

interface ClaySwatchProps {
  hex: string
  label: string
}

export function ClaySwatch({ hex, label }: ClaySwatchProps) {
  return (
    <>
      <span className={styles.swatch} style={{ backgroundColor: hex }} />
      {label}
    </>
  )
}
