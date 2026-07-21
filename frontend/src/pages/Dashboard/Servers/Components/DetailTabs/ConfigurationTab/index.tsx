import { useState } from 'react'
import { GeneralSection } from './GeneralSection'
import { SentinelSection } from './SentinelSection'
import { AdvancedSection } from './AdvancedSection'
import { PrivateKeySection } from './PrivateKeySection'
import { CaCertificateSection } from './CaCertificateSection'
import { DockerCleanupSection } from './DockerCleanupSection'
import { LogDrainsSection } from './LogDrainsSection'
import { MetricsSection } from './MetricsSection'
import { Sidebar } from '../../Sidebar'

type ConfigSidebar =
  | 'General'
  | 'Advanced'
  | 'Private Key'
  | 'CA Certificate'
  | 'Docker Cleanup'
  | 'Log Drains'
  | 'Metrics'

const configOptions: ConfigSidebar[] = [
  'General', 'Advanced', 'Private Key', 'CA Certificate',
  'Docker Cleanup', 'Log Drains', 'Metrics',
]

export function ConfigurationTab() {
  const [activeConfigSidebar, setActiveConfigSidebar] = useState<ConfigSidebar>('General')

  return (
    <div className="flex gap-6 items-start">
      <Sidebar options={configOptions} active={activeConfigSidebar} onChange={setActiveConfigSidebar} />

      <div className="flex-1 min-w-0 flex flex-col gap-5">
        {activeConfigSidebar === 'General' && (
          <>
            <GeneralSection />
            <SentinelSection />
          </>
        )}
        {activeConfigSidebar === 'Advanced' && <AdvancedSection />}
        {activeConfigSidebar === 'Private Key' && <PrivateKeySection />}
        {activeConfigSidebar === 'CA Certificate' && <CaCertificateSection />}
        {activeConfigSidebar === 'Docker Cleanup' && <DockerCleanupSection />}
        {activeConfigSidebar === 'Log Drains' && <LogDrainsSection />}
        {activeConfigSidebar === 'Metrics' && <MetricsSection />}
      </div>
    </div>
  )
}
