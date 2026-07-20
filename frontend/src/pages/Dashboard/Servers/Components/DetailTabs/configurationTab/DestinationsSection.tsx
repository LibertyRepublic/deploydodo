import { OutlineButton } from '../..'

export function DestinationsSection() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-sans font-bold text-3xl text-high-contrast m-0">Destination</h2>
          <span className="font-sans font-normal text-sm text-text-secondary">
            Destinations are used to segregate resources by network.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <OutlineButton onClick={() => { }}>Add</OutlineButton>
          <OutlineButton onClick={() => { }}>Find Destinations</OutlineButton>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="border border-neutral-100 rounded-xl p-5 flex flex-col gap-3 bg-white w-64">
          <div className="flex flex-col gap-2">
            <h3 className="font-sans font-bold text-lg text-high-contrast m-0">DeployDodo</h3>
            <div className="flex flex-col gap-1 text-sm text-text-secondary">
              <div>
                <span className="font-sans font-bold text-high-contrast text-sm">Server IP: </span>
                <span className="font-sans text-sm text-text-secondary">host.docker.internal</span>
              </div>
              <div>
                <span className="font-sans font-bold text-high-contrast text-sm">Docker Network: </span>
                <span className="font-sans text-sm text-text-secondary">DeployDodo</span>
              </div>
            </div>
          </div>
          <span className="font-manrope font-semibold text-xs px-2 py-0.5 rounded bg-[#eaf6ec] text-[#2e7d32] w-fit">
            Currently used
          </span>
        </div>
      </div>
    </div>
  )
}
