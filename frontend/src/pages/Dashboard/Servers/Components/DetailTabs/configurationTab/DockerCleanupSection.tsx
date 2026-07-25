import { useState } from 'react'
import { Button } from '@/components/Button'
import { Toggle } from '@/components/Toggle'
import { FileDownloadIcon, AlertTriangleIcon, DotsHorizontalIcon, ChevronUpIcon } from '@/assets/icons'
import { TextInput } from '@/components/TextInput'
import { Table, type Column } from '@/components/Table'
import { mockExecutions } from '@/pages/Dashboard/Servers/Components/DetailTabs/mockData'
import { SectionCard } from '@/pages/Dashboard/Servers/Components/index'

type ExecutionRow = {
  id: number
  started: string
  ended: string
  runtime: string
  finished: string
  status: string
}

const executionColumns: Column<ExecutionRow>[] = [
  { header: '#', width: 'w-12', cell: (row) => row.id, cellClassName: '!py-3' },
  { header: 'Started', cell: (row) => row.started, cellClassName: '!py-3' },
  { header: 'Ended', cell: (row) => row.ended, cellClassName: '!py-3' },
  {
    header: 'Status',
    cellClassName: '!py-3',
    cell: (row) => (
      <span className="font-manrope font-semibold text-xs px-2 py-0.5 rounded bg-[#eaf6ec] text-[#2e7d32]">
        {row.status}
      </span>
    ),
  },
  { header: 'Runtime', cell: (row) => row.runtime, cellClassName: '!py-3' },
  { header: 'Finished', cell: (row) => row.finished, cellClassName: '!py-3' },
  {
    header: '',
    width: 'w-12',
    cellClassName: 'text-center !py-3',
    cell: () => (
      <Button variant="ghost" type="button" aria-label="Download log" className="!p-0">
        <FileDownloadIcon className="size-4" />
      </Button>
    ),
  },
]

export function DockerCleanupSection() {
  const [forceDockerCleanup, setForceDockerCleanup] = useState(true)
  const [cleanupSchedule, setCleanupSchedule] = useState('')
  const [danglingVolumes, setDanglingVolumes] = useState(true)
  const [deleteUnusedNetworks, setDeleteUnusedNetworks] = useState(true)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-sans font-bold text-3xl text-high-contrast m-0">Docker Cleanup</h2>
          <span className="font-sans font-normal text-sm text-text-secondary">
            Configure Docker cleanup settings for your server.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant='outline' onClick={() => {}}>Start clean up</Button>
          <Button type="button" onClick={() => {}}>Save</Button>
        </div>
      </div>

      <SectionCard>
        <div className="flex flex-col gap-4">
          <h3 className="font-sans font-bold text-lg text-high-contrast m-0">Cleanup Configuration</h3>

          <TextInput
            label="Docker cleanup frequency"
            name="cleanupSchedule"
            value={cleanupSchedule}
            onChange={(e) => setCleanupSchedule(e.target.value)}
          />

          <div className="flex items-center justify-between">
            <span className="font-sans font-normal text-sm text-high-contrast">
              Force Docker Cleanup
            </span>
            <Toggle enabled={forceDockerCleanup} onToggle={() => setForceDockerCleanup(!forceDockerCleanup)} />
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="flex flex-col gap-4">
          <h3 className="font-sans font-bold text-lg text-high-contrast m-0">Advanced</h3>

          <div className="bg-[rgba(255,113,62,0.08)] border border-[rgba(255,113,62,0.2)] rounded-xl p-4 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <AlertTriangleIcon className="size-4 text-primary shrink-0" />
              <span className="font-sans font-bold text-sm text-primary">Alert title</span>
            </div>
            <p className="font-sans font-normal text-xs leading-5 text-high-contrast m-0">
              Pull request #9999 merged after a successful build
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="flex items-center justify-between border border-neutral-100/50 rounded-xl p-4 bg-white">
              <span className="font-sans font-normal text-sm text-high-contrast">Delete Unused Volumes</span>
              <Toggle enabled={danglingVolumes} onToggle={() => setDanglingVolumes(!danglingVolumes)} />
            </div>
            <div className="flex items-center justify-between border border-neutral-100/50 rounded-xl p-4 bg-white">
              <span className="font-sans font-normal text-sm text-high-contrast">Delete Unused Networks</span>
              <Toggle enabled={deleteUnusedNetworks} onToggle={() => setDeleteUnusedNetworks(!deleteUnusedNetworks)} />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="flex items-center justify-between">
          <h3 className="font-sans font-bold text-lg text-high-contrast m-0">Recent executions</h3>
          <div className="flex items-center gap-4 text-text-secondary">
            <Button variant="ghost" type="button" aria-label="More options">
              <DotsHorizontalIcon className="size-5" />
            </Button>
            <Button variant="ghost" type="button" aria-label="Collapse section">
              <ChevronUpIcon className="size-4" />
            </Button>
          </div>
        </div>

        <Table columns={executionColumns} data={mockExecutions} />
      </SectionCard>
    </div>
  )
}
