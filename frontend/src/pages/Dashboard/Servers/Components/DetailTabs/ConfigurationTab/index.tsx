import { useState } from 'react'
import { GeneralSection } from '@/pages/Dashboard/Servers/Components/DetailTabs/ConfigurationTab/GeneralSection'
import { SentinelSection } from '@/pages/Dashboard/Servers/Components/DetailTabs/ConfigurationTab/SentinelSection'
import { AdvancedSection } from '@/pages/Dashboard/Servers/Components/DetailTabs/ConfigurationTab/AdvancedSection'
import { PrivateKeySection } from '@/pages/Dashboard/Servers/Components/DetailTabs/ConfigurationTab/PrivateKeySection'
import { CaCertificateSection } from '@/pages/Dashboard/Servers/Components/DetailTabs/ConfigurationTab/CaCertificateSection'
import { DockerCleanupSection } from '@/pages/Dashboard/Servers/Components/DetailTabs/ConfigurationTab/DockerCleanupSection'
import { LogDrainsSection } from '@/pages/Dashboard/Servers/Components/DetailTabs/ConfigurationTab/LogDrainsSection'
import { MetricsSection } from '@/pages/Dashboard/Servers/Components/DetailTabs/ConfigurationTab/MetricsSection'
import { Sidebar } from '@/pages/Dashboard/Servers/Components/Sidebar'

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
