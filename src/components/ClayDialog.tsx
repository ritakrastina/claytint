import { useState } from 'react'

import type { ClayDraft } from '../data/palettes'
import { useStore } from '../store'
import styles from './ClayDialog.module.css'
import { Field } from './ui/Field'
import { HexInput } from './ui/HexInput'
import { CloseIcon } from './ui/icons'

interface ClayDialogProps {
  id: string
  draft?: ClayDraft
  onClose: () => void
}

export function ClayDialog({ id, draft, onClose }: ClayDialogProps) {
  return (
    <dialog
      id={id}
      className={styles.dialog}
      closedby="any"
      aria-labelledby={`${id}-title`}
      onClose={onClose}
    >
      {draft && <ClayDialogContent id={id} draft={draft} />}
    </dialog>
  )
}

function ClayDialogContent({ id, draft }: { id: string; draft: ClayDraft }) {
  const clays = useStore((state) => state.customClays)
  const saveClay = useStore((state) => state.saveClay)
  const removeClay = useStore((state) => state.removeClay)
  const [hex, setHex] = useState(draft.hex)
  const [name, setName] = useState(draft.name)

  const isDuplicate = clays.some(
    (clay) => clay.hex === hex && clay.id !== draft.id
  )

  return (
    <>
      <header className={styles.header}>
        <h3 id={`${id}-title`} className={styles.title}>
          {draft.id ? 'Edit clay' : 'Add clay'}
        </h3>
        <button
          type="button"
          className={styles.close}
          commandfor={id}
          command="close"
          aria-label="Close"
        >
          <CloseIcon width={16} height={16} />
        </button>
      </header>

      <form
        id={`${id}-form`}
        method="dialog"
        className={styles.form}
        onSubmit={() => saveClay({ ...draft, hex, name: name.trim() })}
      >
        <Field label="Colour">
          <HexInput value={hex} onChange={setHex} />
        </Field>
        <Field label="Name">
          <input
            className={styles.textInput}
            type="text"
            value={name}
            placeholder={hex}
            autoComplete="off"
            onChange={(event) => setName(event.target.value)}
          />
        </Field>

        {isDuplicate && (
          <p className={styles.error} role="alert">
            This colour is already added to your palette.
          </p>
        )}
      </form>

      <footer className={styles.footer}>
        {draft.id && (
          <button
            type="button"
            className={styles.remove}
            commandfor={id}
            command="close"
            onClick={() => draft.id && removeClay(draft.id)}
          >
            Remove
          </button>
        )}
        <button
          type="submit"
          form={`${id}-form`}
          className={styles.save}
          disabled={isDuplicate}
        >
          {draft.id ? 'Save' : 'Add'}
        </button>
      </footer>
    </>
  )
}
