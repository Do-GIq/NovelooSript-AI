import type { ScriptStyle } from '../types/script'

const DRAFT_KEY = 'novel2script-draft'

export interface ScriptDraft {
  title: string
  style: ScriptStyle
  sourceText: string
  yamlResult: string
  summary: string
  warnings: string[]
  isFallbackResult: boolean
  generationDuration: number | null
  savedAt: string
}

export function saveDraft(draft: Omit<ScriptDraft, 'savedAt'>) {
  const nextDraft: ScriptDraft = {
    ...draft,
    savedAt: new Date().toISOString()
  }

  localStorage.setItem(DRAFT_KEY, JSON.stringify(nextDraft))

  return nextDraft
}

export function loadDraft() {
  const rawDraft = localStorage.getItem(DRAFT_KEY)

  if (!rawDraft) return null

  try {
    return JSON.parse(rawDraft) as ScriptDraft
  } catch (error) {
    console.error(error)
    return null
  }
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY)
}

export function getDraftSavedAt() {
  return loadDraft()?.savedAt ?? null
}
