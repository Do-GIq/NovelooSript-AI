const INVALID_FILENAME_CHARS = /[\\/:*?"<>|]/g

export function createSafeFilename(rawName: string, extension: string) {
  const baseName = rawName
    .trim()
    .replace(INVALID_FILENAME_CHARS, '_')
    .replace(/\s+/g, '_')

  const safeBaseName = baseName || 'novel-script'

  return `${safeBaseName}.${extension}`
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob(['\uFEFF', content], {
    type: 'text/yaml;charset=utf-8'
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}