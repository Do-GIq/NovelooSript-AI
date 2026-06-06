import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { z } from 'zod'
import { generateScriptYaml } from './services/scriptGenerator.js'

const app = express()
const port = Number(process.env.PORT || 8787)

app.use(cors())
app.use(express.json({ limit: '10mb' }))

const generateScriptSchema = z.object({
  title: z.string().optional(),
  sourceText: z.string().min(100, '小说正文至少需要 100 个字符'),
  style: z.enum(['film', 'short_drama', 'stage']).default('film')
})

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Novel2Script-AI Backend'
  })
})

app.post('/api/generate-script', async (req, res) => {
  const parsed = generateScriptSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({
      message: '参数错误',
      errors: parsed.error.flatten()
    })
    return
  }

  const result = await generateScriptYaml(parsed.data)

  res.json(result)
})

app.listen(port, () => {
  console.log(`Novel2Script backend is running at http://localhost:${port}`)
})