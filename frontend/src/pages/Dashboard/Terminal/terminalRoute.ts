import { createLazyRoute } from '@tanstack/react-router'
import { Terminal } from '@/pages/Dashboard/Terminal/index'

export const TerminalRoute = createLazyRoute('terminal')({
  component: Terminal,
})
