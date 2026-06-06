import axios from 'axios'
import type {
  GenerateScriptRequest,
  GenerateScriptResponse
} from '../types/script'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787',
  timeout: 60000
})

export async function generateScriptApi(payload: GenerateScriptRequest) {
  const response = await request.post<GenerateScriptResponse>(
    '/api/generate-script',
    payload
  )

  return response.data
}