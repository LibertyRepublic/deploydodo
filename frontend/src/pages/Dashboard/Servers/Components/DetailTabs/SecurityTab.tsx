import { useState } from 'react'
import { useFormik } from 'formik'
import { SectionCard, SectionHeader, Sidebar } from '..'
import { Button } from '@/components/Button'

type SecuritySidebar = 'Server Patching' | 'Terminal Access'

export function SecurityTab() {
  const [activeSidebar, setActiveSidebar] = useState<SecuritySidebar>('Server Patching')
  const options: SecuritySidebar[] = ['Server Patching', 'Terminal Access']

  const securityForm = useFormik({
    initialValues: { schedule: 'weekly' },
    onSubmit: () => { },
  })

  return (
    <div className="flex gap-6 items-start">
      <Sidebar options={options} active={activeSidebar} onChange={setActiveSidebar} />

      <div className="flex-1 min-w-0 flex flex-col gap-5">

        {activeSidebar === 'Server Patching' && (
          <SectionCard>
            <SectionHeader
              title="Server Patching"
              subtitle="Update your servers semi-automatically."
              right={<Button variant='outline' onClick={() => { }}>Check for Updates</Button>}
            />
          </SectionCard>
        )}

        {activeSidebar === 'Terminal Access' && (
          <form onSubmit={securityForm.handleSubmit}>
            <SectionCard>
              <SectionHeader
                title="Server Patching"
                subtitle="Update your servers semi-automatically."
                right={<Button>Save</Button>}
              />
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-3">
                  <h3 className="font-sans font-bold text-2xl text-high-contrast m-0">
                    Terminal status
                  </h3>
                  <span className="font-manrope font-semibold text-xs leading-4 px-2 py-1 rounded bg-[#eaf6ec] text-[#2e7d32]">
                    Operational
                  </span>
                </div>
                <Button variant='outline' onClick={() => { }}>
                  Start Proxy
                </Button>
              </div>
            </SectionCard>
          </form>
        )}
      </div>
    </div>
  )
}
