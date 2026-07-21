import { useState } from 'react'
import { useFormik } from 'formik'
import {
  Sidebar,
  SectionCard,
  SectionHeader,
} from '..'
import { TextInput } from '@/components/TextInput'
import { Textarea } from '@/components/Textarea'
import { Button } from '@/components/Button'
import { Toggle } from '@/components/Toggle'
import { FieldLabel } from '@/components/FieldLabel'
import {
  traefikComposeLines,
  caddyFileContent,
  fluentBitConfig,
  mockLogContent,
} from './mockData'

type SidebarSection = 'Configuration' | 'Dynamic Configuration' | 'Logs'

const sidebarOptions: SidebarSection[] = ['Configuration', 'Dynamic Configuration', 'Logs']

export function ProxyTab() {
  const [activeSidebar, setActiveSidebar] = useState<SidebarSection>('Configuration')

  const formik = useFormik({
    initialValues: {
      generateLabelsOnly: false,
      overrideDefaultHandler: true,
      redirectTo: 'https://app.DeployDodo.co',
      logLines: '100',
      streamingEnabled: true,
      includeTimestamps: true,
    },
    onSubmit: () => {},
  })

  function toggle(field: keyof typeof formik.values) {
    formik.setFieldValue(field, !formik.values[field])
  }

  return (
    <div className="flex gap-6 items-start">
      <Sidebar options={sidebarOptions} active={activeSidebar} onChange={setActiveSidebar} />

      <div className="flex-1 min-w-0 flex flex-col gap-5">
        {activeSidebar === 'Configuration' && (
          <div className="flex flex-col gap-5">
            <SectionCard>
              <SectionHeader
                title="Configuration"
                subtitle="Configure your proxy settings and advanced options."
                right={
                  <div className="flex items-center gap-2">
                    <Button variant='outline'>Switch proxy</Button>
                    <Button>Save</Button>
                  </div>
                }
              />

              <div className="flex flex-col gap-5">
                <h3 className="font-sans font-semibold text-lg leading-7 text-high-contrast m-0">
                  Advanced
                </h3>

                <div className="flex items-center justify-between">
                  <FieldLabel>Generate labels only for Traefik</FieldLabel>
                  <Toggle
                    enabled={formik.values.generateLabelsOnly}
                    onToggle={() => toggle('generateLabelsOnly')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <FieldLabel>Override default request handler</FieldLabel>
                  <Toggle
                    enabled={formik.values.overrideDefaultHandler}
                    onToggle={() => toggle('overrideDefaultHandler')}
                  />
                </div>

                <TextInput
                  label="Redirect to (optional)"
                  name="redirectTo"
                  value={formik.values.redirectTo}
                  onChange={formik.handleChange}
                />
              </div>
            </SectionCard>

            <SectionCard>
              <SectionHeader
                title="Traefik (DeployDodo Proxy)"
                subtitle="Configuration file ( /data/DeployDodo/proxy/docker-compose.yml )"
              />
              <div className="border border-neutral-100 rounded-xl py-3 bg-white font-mono text-sm leading-relaxed text-secondary select-text">
                {traefikComposeLines.map((line, i) => (
                  <div key={i} className="flex leading-6 py-0.5 min-h-6">
                    <span className="w-10 shrink-0 text-right pr-4 text-text-secondary/40 select-none font-mono text-sm">
                      {i + 1}
                    </span>
                    <span className="flex-1 font-mono text-sm text-high-contrast whitespace-pre select-text">
                      {line}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {activeSidebar === 'Dynamic Configuration' && (
          <SectionCard>
            <SectionHeader
              title="Dynamic Configuration"
              subtitle="Server is reachable and validated"
              right={
                <div className="flex items-center gap-2">
                  <OutlineButton>Switch proxy</OutlineButton>
                  <SaveButton />
                </div>
              }
            />

            <Textarea label="File: Caddyfile" readOnly rows={4} defaultValue={caddyFileContent} />

            <div className="mt-4">
              <Textarea
                label="Custom FluentBit Configuration"
                readOnly
                rows={16}
                defaultValue={fluentBitConfig}
                className="resize-y"
              />
            </div>
          </SectionCard>
        )}

        {activeSidebar === 'Logs' && (
          <div className="flex flex-col gap-4">
            <h2 className="font-sans font-bold text-3xl text-high-contrast m-0">Logs</h2>
            <SectionCard>
              <SectionHeader
                title="DeployDodo Proxy"
                right={<OutlineButton>Refresh</OutlineButton>}
              />

              <div className="flex flex-col gap-4">
                <TextInput
                  label="Only Show Number of Lines*"
                  name="logLines"
                  value={formik.values.logLines}
                  onChange={formik.handleChange}
                  className="max-w-xs"
                />

                <div className="flex items-center gap-6 mt-2">
                  <div className="flex items-center gap-3">
                    <span className="font-sans font-normal text-sm leading-6 text-secondary">
                      Stream Logs
                    </span>
                    <Toggle
                      enabled={formik.values.streamingEnabled}
                      onToggle={() => toggle('streamingEnabled')}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-sans font-normal text-sm leading-6 text-secondary">
                      Include Timestamps
                    </span>
                    <Toggle
                      enabled={formik.values.includeTimestamps}
                      onToggle={() => toggle('includeTimestamps')}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Textarea
                  label="File: Caddyfile"
                  readOnly
                  rows={6}
                  defaultValue={mockLogContent}
                  className="resize-y"
                />
              </div>
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  )
}
