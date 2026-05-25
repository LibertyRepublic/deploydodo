import { useState } from 'react'
import type { JobCompletePayload, JobErrorPayload } from '@/api/types'
import { PageLayout } from './PageLayout'
import { Stepper } from './Stepper'
import { SelectView, type ServerOptionId } from './SelectView'
import { RemoteServerView } from './RemoteServerView'
import { ConnectingView } from './ConnectingView'
import { ConnectionSuccessView } from './ConnectionSuccessView'
import { ConnectionFailedView } from './ConnectionFailedView'
import { SetupCompleteView } from './SetupCompleteView'

type View =
  | 'select'
  | 'remote-server'
  | 'connecting'
  | 'connection-success'
  | 'connection-failed'
  | 'setup-complete'

function stepperProps(view: View) {
  switch (view) {
    case 'select':
    case 'remote-server':
      return { currentStep: 1 }
    case 'connecting':
    case 'connection-failed':
      return { completedSteps: [1], currentStep: 2 }
    case 'connection-success':
      return { completedSteps: [1, 2], nextStep: 3 }
    case 'setup-complete':
      return { completedSteps: [1, 2, 3] }
  }
}

export function SelectServer() {
  const [view, setView] = useState<View>('select')
  const [jobId, setJobId] = useState<string | null>(null)
  const [server, setServer] = useState<JobCompletePayload | null>(null)
  const [jobError, setJobError] = useState<JobErrorPayload | null>(null)

  function handleSelect(id: ServerOptionId) {
    if (id === 'remote-server') setView('remote-server')
    // TODO: handle 'this-machine'
  }

  function handleConnect(newJobId: string) {
    setJobId(newJobId)
    setJobError(null)
    setView('connecting')
  }

  function handleJobComplete(payload: JobCompletePayload) {
    setServer(payload)
    setView('connection-success')
  }

  function handleJobError(payload: JobErrorPayload) {
    setJobError(payload)
    setView('connection-failed')
  }

  function handleRetry() {
    // Go back to the form so the user can re-submit (possibly correcting credentials)
    setView('remote-server')
  }

  return (
    <PageLayout>
      <Stepper {...stepperProps(view)} />

      {view === 'select' && <SelectView onSelect={handleSelect} />}

      {view === 'remote-server' && (
        <RemoteServerView onBack={() => setView('select')} onConnect={handleConnect} />
      )}

      {view === 'connecting' && jobId && (
        <ConnectingView
          jobId={jobId}
          onSuccess={handleJobComplete}
          onError={handleJobError}
        />
      )}

      {view === 'connection-success' && server && (
        <ConnectionSuccessView server={server} onContinue={() => setView('setup-complete')} />
      )}

      {view === 'connection-failed' && (
        <ConnectionFailedView
          errorMessage={jobError?.message ?? 'An unexpected error occurred.'}
          onGoBack={() => setView('remote-server')}
          onRetry={handleRetry}
        />
      )}

      {view === 'setup-complete' && (
        <SetupCompleteView
          onGoToDashboard={() => {
            /* TODO: navigate to dashboard */
          }}
        />
      )}
    </PageLayout>
  )
}
