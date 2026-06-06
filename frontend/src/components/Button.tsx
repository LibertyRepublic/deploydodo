import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = {
  variant?: 'primary' | 'ghost'
  fullWidth?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({ variant = 'primary', fullWidth = false, children, className, ...props }: ButtonProps) {
  return (
    <button
      className={[
        'flex items-center justify-center px-4 py-2 rounded-lg font-manrope font-bold text-sm leading-6 text-center whitespace-nowrap overflow-hidden transition-opacity duration-150 hover:opacity-[0.88] active:opacity-75',
        variant === 'primary' ? 'bg-secondary text-pure-white' : 'bg-transparent text-secondary',
        fullWidth ? 'w-full' : '',
        className ?? '',
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
