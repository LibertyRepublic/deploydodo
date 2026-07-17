import { cn } from '@/utilities/cn'
import { useMemo, useState } from 'react'

interface ButtonGroupItem<T> {
  label: string
  value: T
}

interface ButtonGroupProps<T> {
  onSelect?: (option: T) => void
  options: ButtonGroupItem<T>[]
  label: string
  value?: T
}

export function ButtonGroup<T>({ onSelect, label, options, value }: ButtonGroupProps<T>) {
  if (options.length < 2) {
    throw new Error('You must pass at least 2 items to ButtonGroup')
  }

  const [innerValue, setInnerValue] = useState(options[0].value)

  const resolvedValue = useMemo(() => value ?? innerValue, [value, innerValue])

  const onOptionSelected = (value: T) => {
    setInnerValue(value)
    onSelect?.(value)
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="font-sans text-base leading-6 text-secondary font-bold">{label}</label>
      <div className="flex rounded-lg border border-neutral-100 overflow-hidden">
        {options.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onOptionSelected(item.value)}
            className={cn(
              'flex-1 py-2 font-manrope text-sm leading-6 transition-colors',
              resolvedValue === item.value
                ? 'bg-secondary text-pure-white font-bold'
                : 'bg-background text-text-secondary font-normal hover:text-high-contrast',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
