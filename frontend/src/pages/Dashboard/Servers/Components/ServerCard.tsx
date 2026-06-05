import { Link } from '@tanstack/react-router'

export function ServerCard({ serverId, name, description, status }: { serverId: string; name: string; description: string; status: string }) {
  return (
    <Link
      to="/dashboard/servers/$serverId"
      params={{ serverId }}
      className="w-[320px] border border-neutral-100 rounded-xl p-5 flex flex-col gap-4 hover:border-high-contrast transition-colors duration-150 text-left block"
    >
      <div className="flex flex-col gap-1">
        <h3 className="font-sans font-bold text-base leading-6 text-high-contrast m-0">
          {name}
        </h3>
        <p className="font-sans font-normal text-xs leading-5 text-text-secondary m-0">
          {description}
        </p>
      </div>
      <div className="flex">
        <span className="font-sans font-semibold text-xs leading-4 px-2 py-1 rounded bg-[#eaf6ec] text-[#2e7d32]">
          {status}
        </span>
      </div>
    </Link>
  )
}
