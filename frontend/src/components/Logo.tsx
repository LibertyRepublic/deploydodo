import { LogoIcon } from '@/assets/icons'

type LogoProps = {
  size?: 'sm' | 'lg'
  className?: string
}

export function Logo({ size = 'sm', className }: LogoProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className ?? ''}`}>
      <div className="w-9 h-9 bg-primary-darker rounded-[10.8px] flex items-center justify-center shrink-0">
        <LogoIcon />
      </div>
      <span
        className={`font-sans font-semibold text-high-contrast whitespace-nowrap leading-none ${size === 'lg' ? 'text-2xl' : 'text-base'}`}
      >
        DeployDodo
      </span>
    </div>
  )
}
