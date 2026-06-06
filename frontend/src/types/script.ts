export type ScriptStyle = 'film' | 'short_drama' | 'stage'

export interface GenerateScriptRequest {
  title?: string
  sourceText: string
  style: ScriptStyle
}

export interface GenerateScriptResponse {
  yaml: string
  summary: string
  warnings: string[]
  fallback: boolean
}