import { cn } from '@/utilities/cn'

export function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('border border-neutral-100 rounded-xl p-6 flex flex-col gap-6', className)}>
      {children}
    </div>
  )
}
