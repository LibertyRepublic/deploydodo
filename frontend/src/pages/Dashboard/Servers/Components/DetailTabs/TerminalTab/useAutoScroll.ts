import { useEffect, useRef } from 'react'
import { type Line } from '@/pages/Dashboard/Servers/Components/DetailTabs/TerminalTab/terminalOutputHelpers'

export function useAutoScroll(lines: Line[]) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const c = containerRef.current
    if (c) c.scrollTop = c.scrollHeight
  }, [lines])

  return containerRef
}
