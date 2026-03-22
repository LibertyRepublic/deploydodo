import { cn } from '@/utilities/cn'
import { type InputHTMLAttributes, type ReactNode } from 'react'

type TextInputProps = {
  label: string
  suffix?: ReactNode
  helperText?: string
  errorMessage?: string
  hasError?: boolean
} & InputHTMLAttributes<HTMLInputElement>

export function TextInput({
  label,
  id,
  suffix,
  helperText,
  errorMessage,
  hasError = false,
  ...props
}: TextInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-2 w-full">
      <label htmlFor={inputId} className="font-sans font-normal text-base leading-6 text-secondary">
        {label}
      </label>
      <div className="relative w-full">
        <input
          id={inputId}
          className={cn(
            'w-full bg-background border border-neutral-100 rounded-lg px-3 py-2 font-manrope font-normal text-sm leading-6 text-secondary outline-none transition-[border-color] duration-150 placeholder:text-text-secondary focus:border-secondary',
            { 'pr-14': suffix, 'border-error!': hasError },
          )}
          {...props}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">{suffix}</div>
        )}
      </div>
      {helperText && (
        <p className={cn('font-sans font-normal text-sm leading-6 text-secondary')}>{helperText}</p>
      )}
      {hasError && errorMessage && (
        <p className={cn('font-sans font-normal text-sm leading-6 text-error')}>{errorMessage}</p>
      )}
    </div>
  )
}
