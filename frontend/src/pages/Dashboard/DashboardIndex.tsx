import { PlusIcon } from '@/assets/icons'

export function DashboardIndex() {
  return (
    <div className="flex items-end justify-between">
      <div className="flex flex-col gap-2">
        <h1 className="font-sans font-semibold text-[40px] leading-12 tracking-[-0.5px] text-high-contrast m-0">
          Dashboard
        </h1>
        <p className="font-sans font-normal text-base leading-6 text-text-secondary m-0">
          View your projects and resources at a glance
        </p>
      </div>
      <button className="flex items-center gap-2 pl-2 pr-4 py-2 border border-text-secondary rounded-lg hover:bg-neutral-200 transition-colors">
        <PlusIcon className="size-4 shrink-0" />
        <span className="font-manrope font-bold text-sm leading-6 text-high-contrast">
          New
        </span>
      </button>
    </div>
  )
}
