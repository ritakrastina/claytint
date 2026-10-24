import 'react'

// Invoker Commands API (https://developer.mozilla.org/docs/Web/API/Invoker_Commands_API) for HTML <dialog> element
declare module 'react' {
  interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
    command?: 'show-modal' | 'close'
    commandfor?: string
  }
}
