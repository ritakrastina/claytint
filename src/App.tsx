import styles from './App.module.css'
import { About } from './components/About'
import { ColourPicker } from './components/ColourPicker'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { MixingGuide } from './components/MixingGuide'
import { PaletteSelector } from './components/PaletteSelector'
import { Step } from './components/ui/Step'

export function App() {
  return (
    <div className={styles.app}>
      <Header />

      <main className={styles.main}>
        <div className={styles.steps}>
          <Step eyebrow="Step 1" title="Choose Your Clay">
            <PaletteSelector />
          </Step>

          <Step eyebrow="Step 2" title="Pick a Colour">
            <ColourPicker />
          </Step>

          <Step eyebrow="Step 3" title="Get Your Recipe">
            <MixingGuide />
          </Step>
        </div>
      </main>

      <About />

      <Footer />
    </div>
  )
}
