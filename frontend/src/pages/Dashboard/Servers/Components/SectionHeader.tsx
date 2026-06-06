
export function SectionHeader({ title, subtitle, right, }: { title: React.ReactNode; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          {typeof title === 'string' ? (
            <h2 className="font-sans font-semibold text-xl leading-7 text-high-contrast m-0">
              {title}
            </h2>
          ) : (
            title
          )}
        </div>
        {subtitle && (
          <p className="font-sans font-normal text-sm leading-5 text-text-secondary m-0">
            {subtitle}
          </p>
        )}
      </div>
      {right && <div className="flex items-center gap-2 shrink-0">{right}</div>}
    </div>
  )
}
