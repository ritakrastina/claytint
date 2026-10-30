import styles from './Header.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title} aria-label="ClayTint">
        Clay
        <span className={styles.tint}>
          <span>T</span>
          <span>i</span>
          <span>n</span>
          <span>t</span>
        </span>
      </h1>
      <p className={styles.description}>Polymer clay colour mixing recipes</p>
    </header>
  )
}
