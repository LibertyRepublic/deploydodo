import { useState } from 'react'
import { EyeClosedIcon, EyeOpenIcon } from '@/assets/icons'
import { caCert } from '../mockData'
import { Button } from '@/components/Button'
import { Textarea } from '@/components/Textarea'
import { SaveButton, OutlineButton } from '../..'

export function CaCertificateSection() {
  const [showCaCertContent, setShowCaCertContent] = useState(true)

  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1 max-w-3xl">
          <h2 className="font-sans font-bold text-3xl text-high-contrast m-0">CA Certificate</h2>
          <span className="font-sans font-normal text-sm leading-6 text-text-secondary">
            Mount DeployDodo's CA certificate into any container that needs to connect to a database
            over SSL. You can view and copy the bind mount example below. Learn more about when and
            why this configuration is needed here.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <OutlineButton onClick={() => {}}>Regenerate</OutlineButton>
          <SaveButton type="button" onClick={() => {}} />
        </div>
      </div>

      <div className="w-full bg-neutral-200/30 border border-neutral-100 rounded-lg px-4 py-2.5 font-mono text-sm text-secondary select-all">
        - /data/DeployDodo/ssl/DeployDodo-ca.crt:/etc/ssl/certs/DeployDodo-ca.crt:ro
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <div className="flex items-center justify-between">
          <span className="font-sans font-semibold text-base text-high-contrast">
            CA Certificate{' '}
            <span className="font-normal text-text-secondary/70 text-sm ml-1">
              (Valid until: 05.11.2035 18:25:11)
            </span>
          </span>
          <Button
            variant="ghost"
            type="button"
            onClick={() => setShowCaCertContent(!showCaCertContent)}
          >
            {showCaCertContent ? (
              <>
                <EyeClosedIcon className="size-4" />
                <span>Hide</span>
              </>
            ) : (
              <>
                <EyeOpenIcon className="size-4" />
                <span>Show</span>
              </>
            )}
          </Button>
        </div>

        {showCaCertContent && (
          <Textarea
            label=""
            readOnly
            value={caCert}
            rows={14}
            className="py-3! leading-relaxed! select-all"
          />
        )}
      </div>
    </form>
  )
}
