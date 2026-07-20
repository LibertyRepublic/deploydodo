import { useState } from 'react'
import { Sidebar } from '..'
import { GeneralSection } from './configurationTab/GeneralSection'
import { SentinelSection } from './configurationTab/SentinelSection'
import { AdvancedSection } from './configurationTab/AdvancedSection'
import { PrivateKeySection } from './configurationTab/PrivateKeySection'
import { CaCertificateSection } from './configurationTab/CaCertificateSection'
import { DockerCleanupSection } from './configurationTab/DockerCleanupSection'
import { LogDrainsSection } from './configurationTab/LogDrainsSection'
import { MetricsSection } from './configurationTab/MetricsSection'

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
