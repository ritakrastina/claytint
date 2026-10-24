import type { Clay } from '../../data/palettes'
import styles from './ClaySwatch.module.css'

interface ClaySwatchProps {
  clay: Clay
}

export function ClaySwatch({ clay }: ClaySwatchProps) {
  return (
    <>
      <span className={styles.swatch} style={{ backgroundColor: clay.hex }} />
      {clay.name || clay.hex}
    </>
  )
}
