import { useState } from 'react'
import { useFormik } from 'formik'
import { EyeClosedIcon, EyeOpenIcon } from '@/assets/icons'
import { TextInput } from '@/components/TextInput'
import { SectionCard } from '@/pages/Dashboard/Servers/Components/index'
import { Button } from '@/components/Button'

export function AdvancedSection() {
  const [showConcurrentBuilds, setShowConcurrentBuilds] = useState(false)

  const advancedForm = useFormik({
    initialValues: {
      diskCheckFrequency: '',
      diskNotificationThreshold: '',
      concurrentBuilds: '',
      deploymentTimeout: '',
    },
    onSubmit: () => { },
  })

  return (
    <form onSubmit={advancedForm.handleSubmit} className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-sans font-bold text-3xl text-high-contrast m-0">Advanced</h2>
          <span className="font-sans font-normal text-sm text-text-secondary">
            Advanced configuration for your server
          </span>
        </div>
        <Button>Save</Button>
      </div>

      <SectionCard>
        <div className="flex flex-col gap-4">
          <h3 className="font-sans font-bold text-lg text-high-contrast m-0">Disk Usage</h3>
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Disk usage check frequency"
              name="diskCheckFrequency"
              value={advancedForm.values.diskCheckFrequency}
              onChange={advancedForm.handleChange}
              onBlur={advancedForm.handleBlur}
            />
            <TextInput
              label="Server disk usage notification threshold (%)"
              name="diskNotificationThreshold"
              value={advancedForm.values.diskNotificationThreshold}
              onChange={advancedForm.handleChange}
              onBlur={advancedForm.handleBlur}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="flex flex-col gap-4">
          <h3 className="font-sans font-bold text-lg text-high-contrast m-0">Builds</h3>
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Number of concurrent builds*"
              name="concurrentBuilds"
              type={showConcurrentBuilds ? 'text' : 'password'}
              value={advancedForm.values.concurrentBuilds}
              onChange={advancedForm.handleChange}
              onBlur={advancedForm.handleBlur}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowConcurrentBuilds(!showConcurrentBuilds)}
                  className="text-text-secondary hover:text-high-contrast outline-none cursor-pointer"
                >
                  {showConcurrentBuilds ? (
                    <EyeClosedIcon className="size-4" />
                  ) : (
                    <EyeOpenIcon className="size-4" />
                  )}
                </button>
              }
            />
            <TextInput
              label="Deployment timeout (seconds)*"
              name="deploymentTimeout"
              value={advancedForm.values.deploymentTimeout}
              onChange={advancedForm.handleChange}
              onBlur={advancedForm.handleBlur}
            />
          </div>
        </div>
      </SectionCard>
    </form>
  )
}
