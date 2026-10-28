import styles from './Header.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>
        Clay<span>Tint</span>
      </h1>
      <p className={styles.description}>Polymer clay colour mixing recipes</p>
    </header>
  )
}
