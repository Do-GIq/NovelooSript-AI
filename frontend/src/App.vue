<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'

type ScriptStyle = 'film' | 'short_drama' | 'stage'

const title = ref('')
const sourceText = ref('')
const style = ref<ScriptStyle>('film')
const yamlResult = ref('')
const summary = ref('')
const warnings = ref<string[]>([])
const loading = ref(false)

const wordCount = computed(() => sourceText.value.trim().length)

const canGenerate = computed(() => {
  return sourceText.value.trim().length >= 100
})

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  if (!file.name.endsWith('.txt')) {
    ElMessage.warning('当前仅支持上传 txt 文本文件')
    return
  }

  const reader = new FileReader()

  reader.onload = () => {
    sourceText.value = String(reader.result || '')
    ElMessage.success('小说文本读取成功')
  }

  reader.onerror = () => {
    ElMessage.error('文件读取失败，请重试')
  }

  reader.readAsText(file, 'utf-8')
}

function clearText() {
  title.value = ''
  sourceText.value = ''
  yamlResult.value = ''
  summary.value = ''
  warnings.value = []
}

function generateMockYaml() {
  if (!canGenerate.value) {
    ElMessage.warning('请至少输入 100 个字的小说内容')
    return
  }

  loading.value = true
  summary.value = ''
  warnings.value = []

  window.setTimeout(() => {
    yamlResult.value = `title: "${title.value || '未命名剧本'}"
version: "1.0"
source:
  type: "novel"
  chapter_count: 3
  adaptation_style: "${style.value}"
characters:
  - id: "c001"
    name: "林舟"
    role: "protagonist"
    description: "故事主角，性格冷静，但内心有强烈的目标感。"
    personality:
      - "冷静"
      - "执着"
      - "谨慎"
scenes:
  - id: "s001"
    chapter: 1
    title: "雨夜醒来"
    location: "旧城区街道"
    time: "night"
    summary: "林舟在雨夜醒来，发现自己身处陌生城市，故事冲突开始出现。"
    characters:
      - "林舟"
    dialogues:
      - speaker: "林舟"
        text: "这里到底发生了什么？"
        emotion: "confused"
    actions:
      - "林舟扶着墙站起，雨水顺着他的额头滑落。"
  - id: "s002"
    chapter: 2
    title: "神秘来客"
    location: "废弃车站"
    time: "midnight"
    summary: "林舟遇到神秘女子，对方提示他城市异变的真相。"
    characters:
      - "林舟"
      - "神秘女子"
    dialogues:
      - speaker: "神秘女子"
        text: "如果你想活下去，就不要相信这里的时间。"
        emotion: "serious"
    actions:
      - "远处钟声响起，车站灯光忽明忽暗。"
warnings:
  - "当前为前端 Mock 数据，后续将接入后端 AI 接口。"
`

    summary.value = '已生成 YAML 剧本初稿。当前为 Mock 演示数据。'
    warnings.value = ['当前结果为 Mock 数据，后续 PR 会接入真实 AI 生成接口。']
    loading.value = false
    ElMessage.success('Mock YAML 生成成功')
  }, 600)
}
</script>

<template>
  <div class="page">
    <header class="hero">
      <div class="hero-content">
        <p class="tag">Novel2Script-AI</p>
        <h1>AI 小说转 YAML 剧本工具</h1>
        <p class="desc">
          输入 3 个章节以上的小说文本，自动生成角色、场景、对白、动作等结构化剧本初稿。
        </p>
      </div>
    </header>

    <main class="workspace">
      <section class="panel input-panel">
        <div class="panel-title">
          <div>
            <h2>小说输入</h2>
            <p>上传或粘贴小说正文，作为剧本改编的原始内容。</p>
          </div>
          <span>{{ wordCount }} 字</span>
        </div>

        <el-form label-position="top">
          <el-form-item label="作品标题">
            <el-input
              v-model="title"
              placeholder="例如：迷雾城"
              clearable
            />
          </el-form-item>

          <el-form-item label="剧本风格">
            <el-select v-model="style" class="full">
              <el-option label="影视剧本" value="film" />
              <el-option label="短剧剧本" value="short_drama" />
              <el-option label="舞台剧本" value="stage" />
            </el-select>
          </el-form-item>

          <el-form-item label="上传 txt 小说文件">
            <input type="file" accept=".txt" @change="handleFileChange" />
          </el-form-item>

          <el-form-item label="小说正文">
            <el-input
              v-model="sourceText"
              type="textarea"
              :rows="18"
              placeholder="请粘贴至少 3 个章节的小说内容..."
            />
          </el-form-item>

          <div class="actions">
            <el-button @click="clearText">清空</el-button>
            <el-button
              type="primary"
              :loading="loading"
              :disabled="!canGenerate"
              @click="generateMockYaml"
            >
              生成剧本 YAML
            </el-button>
          </div>
        </el-form>
      </section>

      <section class="panel output-panel">
        <div class="panel-title">
          <div>
            <h2>YAML 剧本结果</h2>
            <p>结构化剧本初稿，可用于后续编辑和导出。</p>
          </div>
          <span>Preview</span>
        </div>

        <el-alert
          v-if="summary"
          :title="summary"
          type="success"
          show-icon
          class="alert"
        />

        <el-alert
          v-for="item in warnings"
          :key="item"
          :title="item"
          type="warning"
          show-icon
          class="alert"
        />

        <el-input
          v-model="yamlResult"
          type="textarea"
          :rows="28"
          placeholder="生成后的 YAML 剧本会显示在这里..."
        />
      </section>
    </main>
  </div>
</template>