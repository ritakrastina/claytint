import { useState } from 'react'

import type { Clay, ClayDraft } from '../data/palettes'
import styles from './ClayDialog.module.css'
import { Field } from './Field'
import { HexInput } from './HexInput'

interface ClayDialogProps {
  id: string
  draft?: ClayDraft
  clays: Clay[]
  onSave: (draft: ClayDraft) => void
  onRemove: (id: string) => void
  onClose: () => void
}

export function ClayDialog({ id, draft, onClose, ...rest }: ClayDialogProps) {
  return (
    <dialog
      id={id}
      className={styles.dialog}
      closedby="any"
      aria-labelledby={`${id}-title`}
      onClose={onClose}
    >
      {draft && <ClayDialogContent id={id} draft={draft} {...rest} />}
    </dialog>
  )
}

interface ClayDialogContentProps extends Omit<
  ClayDialogProps,
  'draft' | 'onClose'
> {
  draft: ClayDraft
}

function ClayDialogContent({
  id,
  draft,
  clays,
  onSave,
  onRemove,
}: ClayDialogContentProps) {
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
          <IconClose />
        </button>
      </header>

      <form
        id={`${id}-form`}
        method="dialog"
        className={styles.form}
        onSubmit={() => onSave({ ...draft, hex, name: name.trim() })}
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
            onClick={() => draft.id && onRemove(draft.id)}
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

const IconClose = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 -960 960 960"
    height="16px"
    width="16px"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z" />
  </svg>
)
