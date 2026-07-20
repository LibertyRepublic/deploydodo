import { Button } from '@/components/Button'
import { Table, type Column } from '@/components/Table'
import { DotsHorizontalIcon, ChevronUpIcon, DotsVerticalIcon } from '@/assets/svg'
import { mockManagedResources, type ManagedResource } from './mockData'
import { SectionCard } from '..'

const resourceColumns: Column<ManagedResource>[] = [
  { header: '#', width: 'w-12', cell: (r) => r.id },
  {
    header: 'Service name',
    cell: (r) => (
      <span className="font-sans font-semibold text-sm text-high-contrast">{r.name}</span>
    ),
  },
  {
    header: 'Status',
    cell: (r) => (
      <span className="font-manrope font-semibold text-xs px-2 py-0.5 rounded bg-[#eaf6ec] text-[#2e7d32]">
        {r.status}
      </span>
    ),
  },
  {
    header: 'Runtime',
    cell: (r) => (
      <span className="font-manrope font-semibold text-xs px-2 py-0.5 rounded bg-neutral-200 text-text-secondary">
        {r.runtime}
      </span>
    ),
  },
  {
    header: 'Deployed',
    cell: (r) => <span className="font-sans text-sm text-text-secondary">{r.deployed}</span>,
  },
  {
    header: '',
    width: 'w-12',
    cellClassName: 'text-center',
    cell: () => (
      <Button variant="ghost" type="button" aria-label="Row options" className="!p-0">
        <DotsVerticalIcon className="size-4" />
      </Button>
    ),
  },
]

export function ResourcesTab() {
  return (
    <div className="flex flex-col gap-6">
      <SectionCard>
        <div className="flex items-center justify-between">
          <h2 className="font-sans font-bold text-xl leading-7 text-high-contrast m-0">Managed</h2>
          <div className="flex items-center gap-4 text-text-secondary">
            <Button variant="ghost" type="button" aria-label="More options">
              <DotsHorizontalIcon className="size-5" />
            </Button>
            <Button variant="ghost" type="button" aria-label="Collapse section">
              <ChevronUpIcon className="size-4" />
            </Button>
          </div>
        </div>

        <Table columns={resourceColumns} data={mockManagedResources} />
      </SectionCard>

      <SectionCard>
        <div className="flex items-center justify-between">
          <h2 className="font-sans font-bold text-xl leading-7 text-high-contrast m-0">Unmanaged</h2>
          <div className="flex items-center gap-4 text-text-secondary">
            <Button variant="ghost" type="button" aria-label="More options">
              <DotsHorizontalIcon className="size-5" />
            </Button>
            <Button variant="ghost" type="button" aria-label="Collapse section">
              <ChevronUpIcon className="size-4" />
            </Button>
          </div>
        </div>

        <Table
          columns={resourceColumns.slice(0, -1)}
          data={[]}
          emptyState={
            <div className="py-12 flex items-center justify-center">
              <span className="font-sans font-normal text-sm text-text-secondary">
                No unmanaged resources found{' '}
                <button type="button" className="text-primary hover:underline font-semibold cursor-pointer">
                  adding a resource
                </button>
              </span>
            </div>
          }
        />
      </SectionCard>
    </div>
  )
}
