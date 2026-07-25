import { colorizeAnsi } from '@/utilities/ansi'

export type LineKind = 'input' | 'stdout' | 'stderr'

export type Line = {
  text: string
  kind: LineKind
}

export function promptText(currentDir: string): string {
  const dir = currentDir === '/root' ? '~' : currentDir
  return `root@deploydodo:${dir}#`
}

export function renderOutput(line: Line, currentDir: string): React.ReactNode {
  if (line.kind === 'input') {
    return (
      <>
        <span className="text-[#5faf5f] select-none">
          {promptText(currentDir)}
        </span>{' '}
        <span className="text-[#e0e0e0]">{line.text}</span>
      </>
    )
  }
  if (line.kind === 'stderr') {
    return (
      <span className="text-[#d75f5f] whitespace-pre-wrap">
        {line.text}
      </span>
    )
  }
  return <span className="whitespace-pre-wrap">{colorizeAnsi(line.text)}</span>
}
