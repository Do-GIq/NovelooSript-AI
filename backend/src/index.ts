import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()
const port = Number(process.env.PORT || 8787)

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Novel2Script-AI Backend'
  })
})

app.listen(port, () => {
  console.log(`Novel2Script backend is running at http://localhost:${port}`)
})