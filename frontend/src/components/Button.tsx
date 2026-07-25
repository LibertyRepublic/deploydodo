import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/utilities/cn'

type ButtonProps = {
  variant?: 'primary' | 'ghost' | 'outline'
  fullWidth?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  variant = 'primary',
  fullWidth = false,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'flex items-center justify-center px-4 py-2 rounded-lg font-manrope font-bold text-sm leading-6 text-center whitespace-nowrap overflow-hidden transition-opacity duration-150 hover:opacity-[0.88] active:opacity-75 disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'primary' && 'bg-secondary text-pure-white',
        variant === 'ghost' && 'bg-transparent text-secondary',
        variant === 'outline' && 'bg-transparent border border-text-secondary text-secondary',
        fullWidth ? 'w-full' : '',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
