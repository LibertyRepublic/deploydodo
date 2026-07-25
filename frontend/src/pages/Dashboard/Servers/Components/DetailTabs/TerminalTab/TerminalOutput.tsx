import { type Line, renderOutput } from '@/pages/Dashboard/Servers/Components/DetailTabs/TerminalTab/terminalOutputHelpers'

type LineViewProps = {
  index: number
  line: Line
  currentDir: string
}

export function LineView({ index, line, currentDir }: LineViewProps) {
  return (
    <div className="flex items-start leading-6 py-0.5 min-h-[28px]">
      <span className="w-8 text-right pr-3 text-white/15 select-none font-mono text-sm shrink-0">
        {index + 1}
      </span>
      <div className="flex-1 font-mono text-sm">
        {renderOutput(line, currentDir)}
      </div>
    </div>
  )
}
