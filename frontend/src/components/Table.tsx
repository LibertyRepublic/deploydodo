import { type ReactNode } from 'react'
import { cn } from '@/utilities/cn'

export type Column<T> = {
  header: string
  width?: string | number
  widthClassName?: string
  cell: (row: T, index: number) => ReactNode
  cellClassName?: string
  headerClassName?: string
}

type TableProps<T> = {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  className?: string
  keyFrom?: (row: T, index: number) => string | number
  emptyState?: ReactNode
}

function ColumnDivider() {
  return <span className="absolute right-0 top-2 bottom-2 w-px bg-neutral-100" />
}

export function Table<T>({
  columns,
  data,
  onRowClick,
  className,
  keyFrom,
  emptyState,
}: TableProps<T>) {
  const isLast = (i: number) => i === columns.length - 1

  return (
    <div className={cn('border border-neutral-100 rounded-xl overflow-hidden', className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-neutral-200 border-b border-neutral-100">
            {columns.map((col, i) => (
              <th
                key={col.header}
                className={cn(
                  'relative px-4 py-2.5 text-left font-manrope font-bold text-xs text-text-secondary uppercase tracking-wide',
                  col.widthClassName,
                  col.headerClassName,
                )}
                style={col.width !== undefined ? { width: col.width } : undefined}
              >
                {col.header}
                {!isLast(i) && <ColumnDivider />}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && emptyState ? (
            <tr>
              <td colSpan={columns.length} className="p-0">
                {emptyState}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={keyFrom?.(row, index) ?? index}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-b border-neutral-100 last:border-b-0 transition-colors hover:bg-neutral-200/40',
                  onRowClick && 'cursor-pointer',
                )}
              >
                {columns.map((col, i) => (
                  <td
                    key={col.header}
                    className={cn(
                      'relative px-4 py-3 font-manrope text-sm text-text-secondary',
                      col.cellClassName,
                    )}
                  >
                    {col.cell(row, index)}
                    {!isLast(i) && <ColumnDivider />}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
