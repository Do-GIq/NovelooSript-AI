<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { generateScriptApi } from './api/script'
import logoIcon from './assets/02-transparent.png'
import { createSafeFilename, downloadTextFile } from './utils/download'
import type { ScriptStyle } from './types/script'

const currentView = ref<'home' | 'workspace'>('home')
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

function resetWorkspace() {
  title.value = ''
  sourceText.value = ''
  yamlResult.value = ''
  summary.value = ''
  warnings.value = []
}

function goWorkspace() {
  resetWorkspace()
  currentView.value = 'workspace'
}

function goHome() {
  currentView.value = 'home'
}

function fillExampleAndOpen() {
  title.value = '雾港来信'
  sourceText.value =
    '第一章 雾港的清晨，邮差林澈在旧码头发现了一封没有署名的信。信纸被海风吹得发皱，上面只写着一句话：今晚十二点，请到灯塔来。\n\n第二章 林澈带着信来到灯塔，发现失踪多年的剧团演员苏晚正在那里等他。她说这座城市即将被一桩旧案重新唤醒，而他们必须在天亮前找到当年的证词。\n\n第三章 两人穿过废弃剧院，在后台找到一只铁盒。盒子里有半截录音带和一张泛黄的剧照，照片背面写着：真正的主角，从来没有登台。'
  yamlResult.value = ''
  summary.value = ''
  warnings.value = []
  currentView.value = 'workspace'
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
  summary.value = ''
  warnings.value = []
  yamlResult.value = ''

  try {
    const result = await generateScriptApi({
      title: title.value.trim(),
      sourceText: sourceText.value.trim(),
      style: style.value
    })

    yamlResult.value = result.yaml
    summary.value = result.summary
    warnings.value = result.warnings

    if (result.fallback) {
      ElMessage.warning('当前返回备用 YAML，请检查后端 AI 配置')
    } else {
      ElMessage.success('AI 剧本生成成功')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('生成失败，请确认后端服务是否启动')
  } finally {
    loading.value = false
  }
}

function exportYaml() {
  if (!yamlResult.value.trim()) {
    ElMessage.warning('暂无可导出的 YAML 内容')
    return
  }

  const filename = createSafeFilename(title.value || 'novel-script', 'yaml')

  downloadTextFile(filename, yamlResult.value)

  ElMessage.success('YAML 文件已导出')
}
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
            <el-button class="hero-secondary" @click="fillExampleAndOpen">
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

            <el-button
              class="export-button"
              :disabled="!yamlResult.trim()"
              @click="exportYaml"
            >
              导出 YAML
            </el-button>
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
              <span>YAML</span>
            </div>
            <el-input
              v-model="yamlResult"
              type="textarea"
              :rows="24"
              placeholder="生成后的 YAML 剧本会显示在这里..."
            />
          </div>
        </section>
      </main>
    </section>
  </div>
</template>
