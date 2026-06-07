<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { generateScriptApi } from './api/script'
import logoIcon from './assets/02-transparent.png'
import { demoNovel, demoYamlPreview } from './utils/demoText'
import { clearDraft, getDraftSavedAt, loadDraft, saveDraft } from './utils/draftStorage'
import { createSafeFilename, downloadTextFile } from './utils/download'
import { checkYamlSchema } from './utils/schemaCheck'
import { formatYamlText } from './utils/yamlTools'
import type { ScriptStyle } from './types/script'

const currentView = ref<'home' | 'workspace'>('home')
const title = ref('')
const sourceText = ref('')
const style = ref<ScriptStyle>('film')
const yamlResult = ref('')
const summary = ref('')
const warnings = ref<string[]>([])
const loading = ref(false)
const generationDuration = ref<number | null>(null)
const isFallbackResult = ref(false)
const demoPreviewVisible = ref(false)
const draftSavedAt = ref<string | null>(null)

const wordCount = computed(() => sourceText.value.trim().length)
const demoNovelParagraphs = computed(() => demoNovel.sourceText.split('\n\n').slice(0, 3))
const hasYamlResult = computed(() => yamlResult.value.trim().length > 0)
const schemaCheckResult = computed(() => checkYamlSchema(yamlResult.value))
const draftSavedAtText = computed(() => {
  if (!draftSavedAt.value) return '尚未保存草稿'

  return `上次保存：${formatSavedAt(draftSavedAt.value)}`
})
const generationStatusText = computed(() => {
  if (loading.value) return '生成中'
  if (generationDuration.value !== null) {
    return `生成耗时：${generationDuration.value.toFixed(1)}s`
  }

  return '等待生成'
})

const canGenerate = computed(() => {
  return sourceText.value.trim().length >= 100
})

function resetWorkspace() {
  title.value = ''
  sourceText.value = ''
  yamlResult.value = ''
  summary.value = ''
  warnings.value = []
  generationDuration.value = null
  isFallbackResult.value = false
}

function goWorkspace() {
  resetWorkspace()
  currentView.value = 'workspace'
}

function goHome() {
  currentView.value = 'home'
}

function openDemoPreview() {
  demoPreviewVisible.value = true
}

function fillExampleAndOpen() {
  title.value = demoNovel.title
  style.value = demoNovel.style
  sourceText.value = demoNovel.sourceText
  yamlResult.value = ''
  summary.value = ''
  warnings.value = []
  generationDuration.value = null
  isFallbackResult.value = false
  currentView.value = 'workspace'
}

function useDemoFromPreview() {
  demoPreviewVisible.value = false
  fillExampleAndOpen()
}

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
  resetWorkspace()
}

async function generateScript() {
  if (!canGenerate.value) {
    ElMessage.warning('请至少输入 100 个字的小说内容')
    return
  }

  loading.value = true
  generationDuration.value = null
  summary.value = ''
  warnings.value = []
  yamlResult.value = ''
  isFallbackResult.value = false
  const startTime = performance.now()

  try {
    const result = await generateScriptApi({
      title: title.value.trim(),
      sourceText: sourceText.value.trim(),
      style: style.value
    })

    yamlResult.value = result.yaml
    summary.value = result.summary
    warnings.value = result.warnings
    isFallbackResult.value = result.fallback

    if (result.fallback) {
      ElMessage.warning('当前返回备用 YAML，请检查后端 AI 配置')
    } else {
      ElMessage.success('AI 剧本生成成功')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('生成失败，请确认后端服务是否启动')
  } finally {
    generationDuration.value = (performance.now() - startTime) / 1000
    loading.value = false
  }
}

async function copyYaml() {
  if (!hasYamlResult.value) return

  try {
    await navigator.clipboard.writeText(yamlResult.value)
    ElMessage.success('YAML 已复制')
  } catch (error) {
    console.error(error)
    ElMessage.error('复制失败，请手动复制')
  }
}

function formatYaml() {
  if (!hasYamlResult.value) return

  yamlResult.value = formatYamlText(yamlResult.value)
  ElMessage.success('YAML 已格式化')
}

function formatSavedAt(savedAt: string) {
  const date = new Date(savedAt)

  if (Number.isNaN(date.getTime())) return savedAt

  const pad = (value: number) => String(value).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`
}

function handleSaveDraft() {
  if (!title.value.trim() && !sourceText.value.trim() && !yamlResult.value.trim()) {
    ElMessage.warning('暂无可保存内容')
    return
  }

  const draft = saveDraft({
    title: title.value,
    style: style.value,
    sourceText: sourceText.value,
    yamlResult: yamlResult.value,
    summary: summary.value,
    warnings: warnings.value,
    isFallbackResult: isFallbackResult.value,
    generationDuration: generationDuration.value
  })

  draftSavedAt.value = draft.savedAt
  ElMessage.success('草稿已保存')
}

function handleRestoreDraft() {
  const draft = loadDraft()

  if (!draft) {
    ElMessage.warning('暂无本地草稿')
    return
  }

  title.value = draft.title
  style.value = draft.style
  sourceText.value = draft.sourceText
  yamlResult.value = draft.yamlResult
  summary.value = draft.summary
  warnings.value = draft.warnings
  isFallbackResult.value = draft.isFallbackResult
  generationDuration.value = draft.generationDuration
  draftSavedAt.value = draft.savedAt

  ElMessage.success('草稿已恢复')
}

function handleClearDraft() {
  clearDraft()
  draftSavedAt.value = null
  ElMessage.success('草稿已清除')
}

function exportYaml() {
  if (!hasYamlResult.value) {
    ElMessage.warning('暂无可导出的 YAML 内容')
    return
  }

  const filename = createSafeFilename(title.value || 'novel-script', 'yaml')

  downloadTextFile(filename, yamlResult.value)

  ElMessage.success('YAML 文件已导出')
}

onMounted(() => {
  draftSavedAt.value = getDraftSavedAt()
})
</script>

<template>
  <div class="page">
    <section v-if="currentView === 'home'" class="home-view">
      <header class="site-header home-header">
        <div class="brand">
          <img :src="logoIcon" alt="" class="brand-logo" />
          <span>Novel2Script-AI</span>
        </div>

        <nav class="header-nav" aria-label="页面导航">
          <a href="#guide">流程</a>
          <a href="#about">输出</a>
        </nav>
      </header>

      <main class="home-main">
        <section class="home-hero" aria-labelledby="home-title">
          <div class="hero-copy">
            <p class="hero-kicker">小说改编工作台</p>
            <h1 id="home-title">把小说整理成可编辑的 YAML 剧本</h1>
            <p>
              粘贴正文或上传 txt 文件，选择剧本风格后生成角色、场景、对白和动作结构。适合先得到干净初稿，再继续人工修订。
            </p>
          </div>

          <div class="hero-actions">
            <el-button class="hero-primary" type="primary" @click="goWorkspace">
              开始创作
            </el-button>
            <el-button class="hero-secondary" @click="openDemoPreview">
              查看示例
            </el-button>
          </div>
        </section>

        <section id="guide" class="feature-section" aria-label="工具流程">
          <article class="feature-card">
            <span class="feature-icon">输入</span>
            <h2>导入小说正文</h2>
            <p>支持直接粘贴正文，也可以上传 UTF-8 编码的 txt 文件。</p>
          </article>

          <article class="feature-card">
            <span class="feature-icon">改编</span>
            <h2>选择剧本风格</h2>
            <p>在影视、短剧、舞台剧之间切换，让生成结构贴近后续用途。</p>
          </article>

          <article id="about" class="feature-card">
            <span class="feature-icon">交付</span>
            <h2>导出 YAML 初稿</h2>
            <p>结果保留在右侧编辑器中，可以检查、修订并导出为文件。</p>
          </article>
        </section>
      </main>
    </section>

    <section v-else class="workspace-view">
      <header class="site-header workspace-header">
        <div class="brand">
          <img :src="logoIcon" alt="" class="brand-logo" />
          <span>Novel2Script-AI</span>
        </div>

        <div class="workspace-status">
          <span>{{ wordCount }} 字</span>
          <span>YAML 工作台</span>
        </div>

        <button class="back-home" type="button" @click="goHome">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M15 18l-6-6 6-6"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          返回首页
        </button>
      </header>

      <main class="workspace">
        <section class="panel input-panel" aria-labelledby="input-title">
          <div class="panel-title">
            <div>
              <h2 id="input-title">小说输入</h2>
              <p>上传或粘贴小说正文，补充标题和目标剧本风格。</p>
            </div>
          </div>

          <div class="draft-panel" aria-label="本地草稿">
            <div>
              <h3>本地草稿</h3>
              <p>{{ draftSavedAtText }}</p>
            </div>

            <div class="draft-actions">
              <el-button @click="handleSaveDraft">
                保存草稿
              </el-button>
              <el-button @click="handleRestoreDraft">
                恢复草稿
              </el-button>
              <el-button @click="handleClearDraft">
                清除草稿
              </el-button>
            </div>
          </div>

          <el-form label-position="top" class="script-form">
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
              <label class="upload-dropzone" for="novel-upload">
                <input
                  id="novel-upload"
                  class="native-file"
                  type="file"
                  accept=".txt"
                  @change="handleFileChange"
                />
                <span class="upload-title">
                  拖入 txt 文件，或<strong>点击选择文件</strong>
                </span>
                <span class="upload-note">仅支持 .txt 格式，建议使用 UTF-8 编码</span>
              </label>
            </el-form-item>

            <el-form-item label="小说正文">
              <el-input
                v-model="sourceText"
                type="textarea"
                :rows="10"
                placeholder="请粘贴至少 100 字的小说内容..."
              />
            </el-form-item>

            <div class="actions">
              <el-button class="example-button" @click="fillExampleAndOpen">
                填入示例
              </el-button>
              <el-button class="clear-button" @click="clearText">
                清空
              </el-button>
              <el-button
                class="generate-button"
                type="primary"
                :loading="loading"
                :disabled="!canGenerate"
                @click="generateScript"
              >
                生成剧本 YAML
              </el-button>
            </div>
          </el-form>
        </section>

        <section class="panel output-panel" aria-labelledby="output-title">
          <div class="panel-title output-title">
            <div>
              <h2 id="output-title">YAML 剧本结果</h2>
              <p>生成后可以直接检查结构、继续编辑，或导出为 YAML 文件。</p>
            </div>

            <div class="output-actions">
              <el-button
                class="copy-button"
                :disabled="!hasYamlResult"
                @click="copyYaml"
              >
                复制
              </el-button>
              <el-button
                class="format-button"
                :disabled="!hasYamlResult"
                @click="formatYaml"
              >
                格式化
              </el-button>
              <el-button
                class="export-button"
                :disabled="!hasYamlResult"
                @click="exportYaml"
              >
                导出 YAML
              </el-button>
            </div>
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

          <div class="yaml-editor">
            <div class="editor-toolbar">
              <span>script.yaml</span>
              <div class="editor-meta">
                <span class="generation-status">{{ generationStatusText }}</span>
                <span>YAML</span>
              </div>
            </div>
            <el-input
              v-model="yamlResult"
              type="textarea"
              :rows="24"
              placeholder="生成后的 YAML 剧本会显示在这里..."
            />
          </div>

          <div class="schema-card" aria-label="Schema 完整度检查">
            <div class="schema-header">
              <div>
                <h3>Schema 检查</h3>
                <p v-if="!hasYamlResult">生成剧本后可查看 Schema 完整度</p>
                <p v-else>
                  已通过 {{ schemaCheckResult.passedCount }} / {{ schemaCheckResult.totalCount }} 项
                </p>
              </div>

              <span
                class="schema-score"
                :class="{ 'schema-score-empty': !hasYamlResult }"
              >
                {{ hasYamlResult ? `${schemaCheckResult.score}%` : '--' }}
              </span>
            </div>

            <div v-if="hasYamlResult" class="schema-items">
              <span
                v-for="item in schemaCheckResult.items"
                :key="item.keyword"
                class="schema-item"
                :class="item.passed ? 'schema-item-pass' : 'schema-item-missing'"
              >
                {{ item.label }}
              </span>
            </div>
          </div>
        </section>
      </main>
    </section>

    <el-dialog
      v-model="demoPreviewVisible"
      class="demo-dialog"
      align-center
      append-to-body
      width="920px"
    >
      <template #header>
        <div class="demo-dialog-header">
          <h2>示例预览</h2>
          <p>查看小说输入和 YAML 剧本输出的对应关系。</p>
        </div>
      </template>

      <div class="demo-preview-grid">
        <article class="demo-preview-card">
          <h3>示例小说片段</h3>
          <div class="demo-text-preview">
            <p v-for="paragraph in demoNovelParagraphs" :key="paragraph">
              {{ paragraph }}
            </p>
          </div>
        </article>

        <article class="demo-preview-card code-card">
          <h3>YAML 输出示例</h3>
          <pre class="demo-yaml-preview"><code>{{ demoYamlPreview }}</code></pre>
        </article>
      </div>

      <template #footer>
        <div class="demo-dialog-footer">
          <el-button @click="demoPreviewVisible = false">
            关闭
          </el-button>
          <el-button type="primary" @click="useDemoFromPreview">
            使用该示例开始创作
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
