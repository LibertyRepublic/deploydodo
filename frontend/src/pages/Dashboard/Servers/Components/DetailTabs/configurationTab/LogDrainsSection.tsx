import { useState } from 'react'
import { useFormik } from 'formik'
import { EyeClosedIcon, EyeOpenIcon } from '@/assets/icons'
import { Button } from '@/components/Button'
import { TextInput } from '@/components/TextInput'
import { Textarea } from '@/components/Textarea'
import { fluentBitConfig } from '@/pages/Dashboard/Servers/Components/DetailTabs/mockData'
import { SectionCard } from '@/pages/Dashboard/Servers/Components/index'

const initialVisibility = {
  newRelicLicenseKey: false,
  newRelicEndpoint: false,
  axiomApiKey: false,
  axiomDatasetName: false,
}

export function LogDrainsSection() {
  const [visibility, setVisibility] = useState(initialVisibility)

  function toggleVisibility(field: keyof typeof initialVisibility) {
    setVisibility((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const logDrainForm = useFormik({
    initialValues: {
      newRelicLicenseKey: '',
      newRelicEndpoint: '',
      axiomApiKey: '',
      axiomDatasetName: '',
    },
    onSubmit: () => {},
  })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-sans font-bold text-3xl text-high-contrast m-0">Log Drains</h2>
        <span className="font-sans font-normal text-sm text-text-secondary">
          Advanced configuration for your server
        </span>
      </div>

      <SectionCard>
        <div className="flex flex-col gap-4">
          <h3 className="font-sans font-bold text-lg text-high-contrast m-0">New Relic</h3>
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="License Key*"
              name="newRelicLicenseKey"
              type={visibility.newRelicLicenseKey ? 'text' : 'password'}
              value={logDrainForm.values.newRelicLicenseKey}
              onChange={logDrainForm.handleChange}
              suffix={
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => toggleVisibility('newRelicLicenseKey')}
                  className="p-0!"
                >
                  {visibility.newRelicLicenseKey ? (
                    <EyeClosedIcon className="size-4" />
                  ) : (
                    <EyeOpenIcon className="size-4" />
                  )}
                </Button>
              }
            />
            <TextInput
              label="Endpoint*"
              name="newRelicEndpoint"
              type={visibility.newRelicEndpoint ? 'text' : 'password'}
              value={logDrainForm.values.newRelicEndpoint}
              onChange={logDrainForm.handleChange}
              suffix={
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => toggleVisibility('newRelicEndpoint')}
                  className="p-0!"
                >
                  {visibility.newRelicEndpoint ? (
                    <EyeClosedIcon className="size-4" />
                  ) : (
                    <EyeOpenIcon className="size-4" />
                  )}
                </Button>
              }
            />
          </div>
          <div>
            <Button type="button" onClick={() => {}}>Save</Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="flex flex-col gap-4">
          <h3 className="font-sans font-bold text-lg text-high-contrast m-0">Axiom</h3>
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="API Key*"
              name="axiomApiKey"
              type={visibility.axiomApiKey ? 'text' : 'password'}
              value={logDrainForm.values.axiomApiKey}
              onChange={logDrainForm.handleChange}
              suffix={
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => toggleVisibility('axiomApiKey')}
                  className="p-0!"
                >
                  {visibility.axiomApiKey ? (
                    <EyeClosedIcon className="size-4" />
                  ) : (
                    <EyeOpenIcon className="size-4" />
                  )}
                </Button>
              }
            />
            <TextInput
              label="Dataset Name *"
              name="axiomDatasetName"
              type={visibility.axiomDatasetName ? 'text' : 'password'}
              value={logDrainForm.values.axiomDatasetName}
              onChange={logDrainForm.handleChange}
              suffix={
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => toggleVisibility('axiomDatasetName')}
                  className="p-0!"
                >
                  {visibility.axiomDatasetName ? (
                    <EyeClosedIcon className="size-4" />
                  ) : (
                    <EyeOpenIcon className="size-4" />
                  )}
                </Button>
              }
            />
          </div>
          <div>
            <Button type="button" onClick={() => {}}>Save</Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <h3 className="font-sans font-bold text-lg text-high-contrast m-0">Custom FluentBit</h3>
            <p className="font-sans font-normal text-sm leading-5 text-text-secondary m-0">
              Custom FluentBit Configuration
            </p>
          </div>
          <Textarea
            label=""
            readOnly
            rows={14}
            value={fluentBitConfig}
            className="py-3! leading-relaxed! select-all"
          />
        </div>
      </SectionCard>
    </div>
  )
}
