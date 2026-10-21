import { useState } from 'react'

import styles from './App.module.css'
import { ColourPicker } from './components/ColourPicker'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Step } from './components/Step'

export function App() {
  const [colour, setColour] = useState<string>()

  return (
    <div className={styles.app}>
      <Header />

      <main className={styles.main}>
        <div className={styles.steps}>
          <Step eyebrow="Step 1" title="My Clay">
            Coming soon: pick the clays you own
          </Step>
          <Step eyebrow="Step 2" title="Pick a Colour">
            <ColourPicker onChange={setColour} />
          </Step>
          <Step eyebrow="Step 3" title="Mixing Guide">
            Coming soon: a mixing recipe for {colour ?? 'your colour'}
          </Step>
        </div>
      </main>

      <Footer />
    </div>
  )
}
