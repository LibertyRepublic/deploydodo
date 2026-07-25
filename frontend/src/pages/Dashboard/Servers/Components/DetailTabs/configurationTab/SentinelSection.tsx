import { useState } from 'react'
import { useFormik } from 'formik'
import { EyeClosedIcon, EyeOpenIcon } from '@/assets/icons'
import { SaveIcon, RefreshIcon, ClockIcon } from '@/assets/icons/index'
import { TextInput } from '@/components/TextInput'
import { Button } from '@/components/Button'
import { SectionCard, SectionHeader } from '@/pages/Dashboard/Servers/Components/index'
import { Toggle } from '@/components/Toggle'
import { FieldLabel } from '@/components/FieldLabel'

export function SentinelSection() {
  const [showSentinelUrl, setShowSentinelUrl] = useState(false)
  const [sentinelEnabled, setSentinelEnabled] = useState(true)

  const sentinelForm = useFormik({
    initialValues: {
      deployDodoUrl: 'https://host.docker.internal:1234',
      metricsRate: '10',
      metricsHistory: '7',
      pushInterval: '60',
    },
    onSubmit: () => {},
  })

  return (
    <form onSubmit={sentinelForm.handleSubmit}>
      <SectionCard>
        <SectionHeader
          title={
            <div className="flex items-center gap-2">
              <h2 className="font-sans font-semibold text-xl leading-7 text-high-contrast m-0">
                Sentinel
              </h2>
              <span className="font-manrope font-semibold text-xs px-2 py-0.5 rounded bg-[#eaf6ec] text-[#2e7d32]">
                In Sync
              </span>
            </div>
          }
          right={
            <div className="flex items-center gap-3">
              <Button variant="ghost" type="submit" aria-label="Save">
                <SaveIcon className="size-5" />
              </Button>
              <Button variant="ghost" type="button" aria-label="Refresh">
                <RefreshIcon className="size-5" />
              </Button>
              <Button variant="ghost" type="button" aria-label="History">
                <ClockIcon className="size-5" />
              </Button>
            </div>
          }
        />
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <FieldLabel>Enable Sentinel</FieldLabel>
            <Toggle
              enabled={sentinelEnabled}
              onToggle={() => setSentinelEnabled(!sentinelEnabled)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel>Host URL</FieldLabel>
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <input
                  type={showSentinelUrl ? 'text' : 'password'}
                  value="sentinel-secret-token-url"
                  readOnly
                  className="w-full bg-background border border-neutral-100 rounded-lg px-3 py-2 font-manrope font-normal text-sm leading-6 text-text-secondary outline-none"
                />
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setShowSentinelUrl(!showSentinelUrl)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showSentinelUrl ? (
                    <EyeClosedIcon className="size-4" />
                  ) : (
                    <EyeOpenIcon className="size-4" />
                  )}
                </Button>
              </div>
              <Button variant='outline'>Regenerate</Button>
            </div>
          </div>

          <TextInput
            label="DeployDodo URL"
            name="deployDodoUrl"
            value={sentinelForm.values.deployDodoUrl}
            onChange={sentinelForm.handleChange}
            onBlur={sentinelForm.handleBlur}
          />

          <div className="grid grid-cols-3 gap-4">
            <TextInput
              label="Metrics rate (seconds)*"
              name="metricsRate"
              value={sentinelForm.values.metricsRate}
              onChange={sentinelForm.handleChange}
              onBlur={sentinelForm.handleBlur}
            />
            <TextInput
              label="Metrics history (days)*"
              name="metricsHistory"
              value={sentinelForm.values.metricsHistory}
              onChange={sentinelForm.handleChange}
              onBlur={sentinelForm.handleBlur}
            />
            <TextInput
              label="Push interval (seconds)*"
              name="pushInterval"
              value={sentinelForm.values.pushInterval}
              onChange={sentinelForm.handleChange}
              onBlur={sentinelForm.handleBlur}
            />
          </div>
        </div>
      </SectionCard>
    </form>
  )
}
