// Platform feature checks

// iOS PWA ignores window.print()
export const canPrint =
  typeof navigator === 'undefined' ||
  !('standalone' in navigator && navigator.standalone === true)

// Whether the browser can share files
export const canShare =
  typeof navigator !== 'undefined' &&
  navigator.canShare?.({
    files: [new File([], 'file.png', { type: 'image/png' })],
  }) === true

const isIOS =
  typeof navigator !== 'undefined' &&
  (/iPhone|iPad/.test(navigator.userAgent) ||
    (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1))

// iOS downloads go to Files but Share can save to Photos,
// so keep Save as fallback if Share is not possible
export const canSave = !(isIOS && canShare)
