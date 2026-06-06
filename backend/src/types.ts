export type ScriptStyle = 'film' | 'short_drama' | 'stage'

export interface GenerateScriptInput {
  title?: string
  sourceText: string
  style: ScriptStyle
}

export interface GenerateScriptResult {
  yaml: string
  summary: string
  warnings: string[]
  fallback: boolean
}