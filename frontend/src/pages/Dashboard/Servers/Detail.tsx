import { useState } from 'react'
import { createLazyRoute, Link, useParams } from '@tanstack/react-router'
import { TabTransition } from '@/components/Animated'
import { ConfigurationTab } from './Components/DetailTabs/ConfigurationTab'
import { ProxyTab } from './Components/DetailTabs/ProxyTab'
import { ResourcesTab } from './Components/DetailTabs/ResourcesTab'
import { TerminalTab } from './Components/DetailTabs/TerminalTab'
import { SecurityTab } from './Components/DetailTabs/SecurityTab'
import { TabButton } from '@/components/TabButton'
import { ArrowBackIcon, PauseIcon, RestartIcon } from '@/assets/icons'
import { Button } from '@/components/Button'

export const ServerDetailRoute = createLazyRoute('server-detail')({
  component: ServerDetail,
})

type Tab = 'Configuration' | 'Proxy' | 'Resources' | 'Terminal' | 'Security'

export function ServerDetail() {
  const [activeTab, setActiveTab] = useState<Tab>('Configuration')
  const { serverId } = useParams({ from: '/dashboard/servers/$serverId' })

  const tabs: Tab[] = ['Configuration', 'Proxy', 'Resources', 'Terminal', 'Security']

  function renderTabContent() {
    switch (activeTab) {
      case 'Configuration':
        return <ConfigurationTab />
      case 'Proxy':
        return <ProxyTab />
      case 'Resources':
        return <ResourcesTab />
      case 'Security':
        return <SecurityTab />
      default:
        return null
    }
  }

  const isTerminal = activeTab === 'Terminal'

  return (
    <div className="flex flex-col">
      <Link
        to="/dashboard/servers"
        className="inline-flex items-center gap-2 font-sans font-normal text-sm leading-6 text-text-secondary hover:text-high-contrast transition-colors duration-150 w-fit mb-5"
      >
        <ArrowBackIcon width={16} height={16} />
        Back to Servers
      </Link>

      <div className="flex items-center gap-3 mb-5">
        <h1 className="font-sans font-semibold text-[40px] leading-none tracking-[-0.5px] text-high-contrast m-0">
          Localhost
        </h1>
        <span className="font-manrope font-semibold text-xs leading-4 px-2 py-1 rounded-md bg-[#eaf6ec] text-[#2e7d32]">
          Currently used
        </span>
      </div>

      <div className="sticky top-0 z-10 bg-white pt-4 flex items-end justify-between border-b border-neutral-100">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <TabButton key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
              {tab}
            </TabButton>
          ))}
        </div>
        {activeTab === 'Proxy' && (
          <div className="flex gap-2 pb-2">
            <Button variant="outline" className='gap-2' onClick={() => {}}>
              <PauseIcon width={16} height={16} />
              Stop Proxy
            </Button>
            <Button variant="outline" className='gap-2' onClick={() => {}}>
              <RestartIcon width={16} height={16} />
              Restart Proxy
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4">
        {isTerminal ? (
          <TerminalTab serverId={Number(serverId)} />
        ) : (
          <TabTransition tabKey={activeTab}>{renderTabContent()}</TabTransition>
        )}
      </div>
    </div>
  )
}
