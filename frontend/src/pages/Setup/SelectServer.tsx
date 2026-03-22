import { useState } from 'react'
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

  function handleSelect(id: ServerOptionId) {
    if (id === 'remote-server') setView('remote-server')
    // TODO: handle 'this-machine'
  }

  return (
    <PageLayout>
      <Stepper {...stepperProps(view)} />

      {view === 'select' && <SelectView onSelect={handleSelect} />}

      {view === 'remote-server' && (
        <RemoteServerView
          onBack={() => setView('select')}
          onConnect={() => setView('connecting')}
        />
      )}

      {view === 'connecting' && (
        <ConnectingView
          onSuccess={() => setView('connection-success')}
          onError={() => setView('connection-failed')}
        />
      )}

      {view === 'connection-success' && (
        <ConnectionSuccessView onContinue={() => setView('setup-complete')} />
      )}

      {view === 'connection-failed' && (
        <ConnectionFailedView
          onGoBack={() => setView('remote-server')}
          onRetry={() => setView('connecting')}
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
