import { createLazyRoute } from '@tanstack/react-router'
import { Terminal } from './index'

export const TerminalRoute = createLazyRoute('terminal')({
  component: Terminal,
})
