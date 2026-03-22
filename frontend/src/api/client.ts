import createClient from 'openapi-fetch'
import type { paths } from './schema'

// Vite proxies /api → http://localhost:3000 in dev.
// In production the backend serves the frontend directly.
export const api = createClient<paths>({ baseUrl: '/' })
