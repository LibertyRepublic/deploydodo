import { cn } from '@/utilities/cn'

export function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'w-10 h-6 rounded-full p-1 transition-colors duration-200 outline-none flex items-center shrink-0 cursor-pointer',
        enabled ? 'bg-primary' : 'bg-neutral-200'
      )}
    >
      <div
        className={cn(
          'w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
          enabled ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </button>
  )
}
