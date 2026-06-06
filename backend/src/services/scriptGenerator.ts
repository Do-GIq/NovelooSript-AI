import type { GenerateScriptInput, GenerateScriptResult } from '../types.js'
import { buildScriptPrompt } from '../prompts/scriptPrompt.js'

function yamlString(value: string) {
  return JSON.stringify(value)
}

function cleanYaml(content: string) {
  return content
    .replace(/^```(?:yaml|yml)?\s*/i, '')
    .replace(/```$/i, '')
    .trim()
}

function createFallbackYaml(
  input: GenerateScriptInput,
  reason: string
): GenerateScriptResult {
  const title = input.title?.trim() || '未命名剧本'

  const yaml = `title: ${yamlString(title)}
version: "1.0"
source:
  type: "novel"
  chapter_count: 3
  adaptation_style: ${yamlString(input.style)}
characters:
  - id: "c001"
    name: "主角"
    role: protagonist
    description: "根据小说文本生成的主角占位信息"
    personality:
      - "坚韧"
      - "谨慎"
      - "有目标感"
scenes:
  - id: "s001"
    chapter: 1
    title: "故事开端"
    location: "未明确地点"
    time: "unknown"
    summary: "系统未成功调用大模型，因此生成备用剧本结构。"
    characters:
      - "主角"
    dialogues:
      - speaker: "主角"
        text: "真正的剧本内容将在 AI 接口配置完成后生成。"
        emotion: "calm"
    actions:
      - "主角站在场景中央，故事即将开始。"
warnings:
  - ${yamlString(reason)}
`

  return {
    yaml,
    summary: '当前返回的是备用 YAML 示例。请检查后端大模型 API 配置。',
    warnings: [reason],
    fallback: true
  }
}

export async function generateScriptYaml(
  input: GenerateScriptInput
): Promise<GenerateScriptResult> {
  const apiKey = process.env.LLM_API_KEY
  const baseUrl = process.env.LLM_BASE_URL
  const model = process.env.LLM_MODEL

  if (!apiKey || !baseUrl || !model) {
    return createFallbackYaml(input, '未配置 LLM_API_KEY、LLM_BASE_URL 或 LLM_MODEL')
  }

  try {
    const endpoint = `${baseUrl.replace(/\/$/, '')}/chat/completions`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              '你是专业小说改编编剧，只输出合法 YAML，不输出 Markdown 代码块。'
          },
          {
            role: 'user',
            content: buildScriptPrompt(input)
          }
        ],
        temperature: 0.3
      })
    })

    if (!response.ok) {
      return createFallbackYaml(
        input,
        `大模型接口请求失败，HTTP 状态码：${response.status}`
      )
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content

    if (!content || typeof content !== 'string') {
      return createFallbackYaml(input, '大模型接口没有返回有效内容')
    }

    return {
      yaml: cleanYaml(content),
      summary: 'AI 已根据小说内容生成 YAML 剧本初稿。',
      warnings: [],
      fallback: false
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误'

    return createFallbackYaml(input, `大模型调用异常：${message}`)
  }
}