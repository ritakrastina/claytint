import styles from './App.module.css'
import { ColourPicker } from './components/ColourPicker'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { PaletteSelector } from './components/PaletteSelector'
import { Step } from './components/ui/Step'
import { useStore } from './store'
import { hslToHex } from './utils/colour'

export function App() {
  const colour = hslToHex(useStore((state) => state.colour))

  return (
    <div className={styles.app}>
      <Header />

      <main className={styles.main}>
        <div className={styles.steps}>
          <Step eyebrow="Step 1" title="My Clay">
            <PaletteSelector />
          </Step>
          <Step eyebrow="Step 2" title="Pick a Colour">
            <ColourPicker />
          </Step>
          <Step eyebrow="Step 3" title="Mixing Guide">
            Coming soon: a mixing recipe for {colour}
          </Step>
        </div>
      </main>

      <Footer />
    </div>
  )
}
