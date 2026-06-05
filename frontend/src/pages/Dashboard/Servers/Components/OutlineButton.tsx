import { cn } from '@/utilities/cn'

export function OutlineButton({ children, onClick, className, }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 border border-text-secondary rounded-lg px-4 py-1.5 font-manrope font-bold text-sm leading-6 text-high-contrast hover:bg-neutral-200 transition-colors duration-150',
        className
      )}
    >
      {children}
    </button>
  )
}
