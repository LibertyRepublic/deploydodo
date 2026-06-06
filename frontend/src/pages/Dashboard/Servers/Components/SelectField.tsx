import { cn } from '@/utilities/cn'

export function SelectField({ id, label, value, onChange, children, className, }: { id: string; label: string; value: string; onChange: React.ChangeEventHandler<HTMLSelectElement>; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="font-sans font-normal text-base leading-6 text-secondary">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          className="w-full bg-background border border-neutral-100 rounded-lg px-3 py-2 font-manrope font-normal text-sm leading-6 text-secondary outline-none appearance-none pr-10 focus:border-secondary transition-[border-color] duration-150"
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-secondary">
          <svg className="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  )
}
