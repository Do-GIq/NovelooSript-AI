<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { generateScriptApi } from './api/script'
import { createSafeFilename, downloadTextFile } from './utils/download'
import type { ScriptStyle } from './types/script'

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
              @click="generateScript"
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

          <el-button
            size="small"
            type="success"
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