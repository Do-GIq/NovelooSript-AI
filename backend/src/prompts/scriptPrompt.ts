import type { GenerateScriptInput } from '../types.js'

const styleNameMap: Record<GenerateScriptInput['style'], string> = {
  film: '影视剧本',
  short_drama: '短剧剧本',
  stage: '舞台剧本'
}

export function buildScriptPrompt(input: GenerateScriptInput) {
  const safeText = input.sourceText.slice(0, 18000)

  return `
你是一名专业编剧助手。你的任务是把小说文本改编成结构化 YAML 剧本初稿。

请严格遵守以下要求：

1. 只能输出 YAML 内容。
2. 不要输出 Markdown 代码块。
3. 不要解释，不要寒暄。
4. 字段结构必须稳定，方便前端解析、编辑和导出。
5. 保留小说的核心人物、冲突、场景和情节推进。
6. 将小说叙事转换为剧本结构，包括角色、场景、对白、动作。
7. 如果原文不足 3 个章节，也要尽量生成，但要在 warnings 中说明。
8. YAML 中字符串请尽量使用双引号，避免格式错误。

剧本风格：${styleNameMap[input.style]}
作品标题：${input.title || '未命名作品'}

请使用下面的 YAML Schema：

title: string
version: "1.0"
source:
  type: "novel"
  chapter_count: number
  adaptation_style: string
characters:
  - id: string
    name: string
    role: protagonist | antagonist | supporting | narrator | unknown
    description: string
    personality:
      - string
scenes:
  - id: string
    chapter: number
    title: string
    location: string
    time: string
    summary: string
    characters:
      - string
    dialogues:
      - speaker: string
        text: string
        emotion: string
    actions:
      - string
warnings:
  - string

小说正文如下：

${safeText}
`
}