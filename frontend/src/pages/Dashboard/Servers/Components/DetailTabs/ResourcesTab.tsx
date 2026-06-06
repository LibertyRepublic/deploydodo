import { SectionCard } from '..'

export function ResourcesTab() {
  const managed = [
    { id: 1, name: 'Github Servo', status: 'Available', runtime: 'Static', deployed: '15mins' },
    { id: 2, name: 'Database', status: 'Available', runtime: 'Static', deployed: '15mins' },
    { id: 3, name: 'Routing unit', status: 'Available', runtime: 'Static', deployed: '15mins' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <SectionCard>
        <div className="flex items-center justify-between">
          <h2 className="font-sans font-bold text-xl leading-7 text-high-contrast m-0">Managed</h2>
          <div className="flex items-center gap-4 text-text-secondary">
            <button type="button" className="hover:text-high-contrast outline-none cursor-pointer" aria-label="More options">
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
              </svg>
            </button>
            <button type="button" className="hover:text-high-contrast outline-none cursor-pointer" aria-label="Collapse section">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 15l-6-6-6 6" />
              </svg>
            </button>
          </div>
        </div>

        <div className="border border-neutral-100 rounded-xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-neutral-200 border-b border-neutral-100">
                <th className="px-4 py-2.5 text-left font-manrope font-bold text-xs text-text-secondary uppercase tracking-wide border-r-inset w-12">#</th>
                <th className="px-4 py-2.5 text-left font-manrope font-bold text-xs text-text-secondary uppercase tracking-wide border-r-inset">Service name</th>
                <th className="px-4 py-2.5 text-left font-manrope font-bold text-xs text-text-secondary uppercase tracking-wide border-r-inset">Status</th>
                <th className="px-4 py-2.5 text-left font-manrope font-bold text-xs text-text-secondary uppercase tracking-wide border-r-inset">Runtime</th>
                <th className="px-4 py-2.5 text-left font-manrope font-bold text-xs text-text-secondary uppercase tracking-wide border-r-inset">Deployed</th>
                <th className="px-4 py-2.5 text-left font-manrope font-bold text-xs text-text-secondary uppercase tracking-wide w-12"></th>
              </tr>
            </thead>
            <tbody>
              {managed.map((res) => (
                <tr key={res.id} className="border-b border-neutral-100 last:border-b-0 hover:bg-neutral-200/40 transition-colors">
                  <td className="px-4 py-3 font-manrope text-sm text-text-secondary border-r-inset">{res.id}</td>
                  <td className="px-4 py-3 font-sans font-semibold text-sm text-high-contrast border-r-inset">{res.name}</td>
                  <td className="px-4 py-3 border-r-inset">
                    <span className="font-manrope font-semibold text-xs px-2 py-0.5 rounded bg-[#eaf6ec] text-[#2e7d32]">
                      {res.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-r-inset">
                    <span className="font-manrope font-semibold text-xs px-2 py-0.5 rounded bg-neutral-200 text-text-secondary">
                      {res.runtime}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-text-secondary border-r-inset">{res.deployed}</td>
                  <td className="px-4 py-3 text-center">
                    <button type="button" className="text-text-secondary hover:text-high-contrast outline-none cursor-pointer" aria-label="Row options">
                      <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="flex items-center justify-between">
          <h2 className="font-sans font-bold text-xl leading-7 text-high-contrast m-0">Unmanaged</h2>
          <div className="flex items-center gap-4 text-text-secondary">
            <button type="button" className="hover:text-high-contrast outline-none cursor-pointer" aria-label="More options">
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
              </svg>
            </button>
            <button type="button" className="hover:text-high-contrast outline-none cursor-pointer" aria-label="Collapse section">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 15l-6-6-6 6" />
              </svg>
            </button>
          </div>
        </div>

        <div className="border border-neutral-100 rounded-xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-neutral-200 border-b border-neutral-100">
                <th className="px-4 py-2.5 text-left font-manrope font-bold text-xs text-text-secondary uppercase tracking-wide border-r-inset w-12">#</th>
                <th className="px-4 py-2.5 text-left font-manrope font-bold text-xs text-text-secondary uppercase tracking-wide border-r-inset">Service name</th>
                <th className="px-4 py-2.5 text-left font-manrope font-bold text-xs text-text-secondary uppercase tracking-wide border-r-inset">Status</th>
                <th className="px-4 py-2.5 text-left font-manrope font-bold text-xs text-text-secondary uppercase tracking-wide border-r-inset">Runtime</th>
                <th className="px-4 py-2.5 text-left font-manrope font-bold text-xs text-text-secondary uppercase tracking-wide">Deployed</th>
              </tr>
            </thead>
          </table>
          <div className="py-12 flex items-center justify-center border-t border-neutral-100">
            <span className="font-sans font-normal text-sm text-text-secondary">
              No unmanaged resources found{' '}
              <button type="button" className="text-primary hover:underline font-semibold cursor-pointer">
                adding a resource
              </button>
            </span>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
