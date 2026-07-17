import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AddServerForm } from './AddServerForm'
import { Button } from '@/components/Button'
import { useJobEvents } from '@/hooks/useJobEvents'
import type { ConnectingStep } from '@/api/types'
import { SpinnerIcon, CheckCircleIcon, WarningCircleIcon } from '@/assets/icons'
import { cn } from '@/utilities/cn'

type AddServerModalProps = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddServerModal({ open, onClose, onSuccess }: AddServerModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)

  function handleClose() {
    setError(null)
    setJobId(null)
    onClose()
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 flex justify-between items-start shrink-0">
          <div className="flex flex-col gap-0.5">
            <h2 className="font-sans font-semibold text-xl leading-7 text-high-contrast m-0">
              Add Server
            </h2>
            <p className="font-sans font-normal text-sm leading-5 text-text-secondary m-0">
              Configure a new server for your deployments.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="size-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-high-contrast hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {jobId ? (
          <RemoteServerProgress
            jobId={jobId}
            onSuccess={() => {
              onSuccess()
              handleClose()
            }}
            onError={(msg) => {
              setError(msg)
              setJobId(null)
            }}
          />
        ) : (
          <AddServerForm
            error={error}
            onError={setError}
            onJobCreated={setJobId}
            onLocalServerCreated={() => {
              onSuccess()
              handleClose()
            }}
            onCancel={handleClose}
          />
        )}
      </div>
    </div>,
    document.body,
  )
}

function RemoteServerProgress({
  jobId,
  onSuccess,
  onError,
}: {
  jobId: string
  onSuccess: () => void
  onError: (msg: string) => void
}) {
  const [steps, setSteps] = useState<ConnectingStep[]>([])
  const [internalError, setInternalError] = useState<string | null>(null)

  useJobEvents(jobId, {
    onProgress: (newSteps) => setSteps(newSteps),
    onComplete: () => {
      setTimeout(() => onSuccess(), 1500)
    },
    onError: (err) => {
      setInternalError(err.message)
    },
  })

  return (
    <div className="flex-1 px-6 py-8 flex flex-col gap-6 items-center justify-center min-h-75">
      {internalError ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <WarningCircleIcon className="size-12 text-error" />
          <div className="flex flex-col gap-2">
            <h3 className="font-sans font-semibold text-lg text-high-contrast m-0">
              Connection Failed
            </h3>
            <p className="font-sans text-sm text-text-secondary m-0 max-w-sm">{internalError}</p>
          </div>
          <Button
            type="button"
            onClick={() => onError(internalError)}
            variant="ghost"
            className="mt-2"
          >
            Go Back
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 max-w-sm">
          {steps.map((step) => (
            <div key={step.key} className="flex items-center gap-3">
              <div className="size-6 flex items-center justify-center shrink-0">
                {step.status === 'done' ? (
                  <CheckCircleIcon className="size-5 text-[#00C16A]" />
                ) : step.status === 'loading' ? (
                  <SpinnerIcon className="size-5 text-secondary animate-spin" />
                ) : step.status === 'warning' ? (
                  <WarningCircleIcon className="size-5 text-error" />
                ) : (
                  <div className="size-2 rounded-full bg-neutral-200" />
                )}
              </div>
              <span
                className={cn(
                  'font-sans text-sm transition-colors',
                  step.status === 'done'
                    ? 'text-high-contrast font-medium'
                    : step.status === 'loading'
                      ? 'text-secondary font-medium'
                      : 'text-text-secondary',
                )}
              >
                {step.label}
              </span>
            </div>
          ))}
          {steps.length === 0 && (
            <div className="flex items-center justify-center py-4">
              <SpinnerIcon className="size-6 text-secondary animate-spin" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
