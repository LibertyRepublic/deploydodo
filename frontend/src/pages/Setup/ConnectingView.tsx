import { CheckCircleHollowIcon, SpinnerIcon, PendingSpinnerIcon } from '@/assets/icons'
import { useConstructor } from '@/hooks/useConstructor'
import { Card } from './PageLayout'

type CheckListItemStatus = 'done' | 'loading' | 'pending'

function CheckListItem({ label, status }: { label: string; status: CheckListItemStatus }) {
  return (
    <div className="flex items-center gap-2">
      {status === 'done' && (
        <div className="relative shrink-0 size-6">
          <CheckCircleHollowIcon />
        </div>
      )}
      {status === 'loading' && (
        <div className="shrink-0 size-6 flex items-center justify-center">
          <SpinnerIcon className="size-[18px] animate-spin" />
        </div>
      )}
      {status === 'pending' && (
        <div className="relative shrink-0 size-6">
          <PendingSpinnerIcon className="size-full" />
        </div>
      )}
      <span
        className={[
          'font-manrope text-sm leading-6',
          status === 'done' ? 'font-bold text-secondary' : 'font-normal text-text-secondary',
        ].join(' ')}
      >
        {label}
      </span>
    </div>
  )
}

const connectingSteps: { label: string; status: CheckListItemStatus }[] = [
  { label: 'Establishing network connection', status: 'done' },
  { label: 'Initiating SSH handshake', status: 'loading' },
  { label: 'Authenticating credentials', status: 'pending' },
  { label: 'Verifying Docker installation', status: 'pending' },
  { label: 'Checking root permissions', status: 'pending' },
  { label: 'Validating server configuration', status: 'pending' },
]

export function ConnectingView({
  onSuccess,
}: {
  onSuccess: () => void
  onError: () => void
}) {
  useConstructor(() => {
    setTimeout(() => {
      onSuccess()
    }, 2000)
  })

  return (
    <Card className="p-10">
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <h2 className="font-sans font-semibold text-2xl leading-8 text-high-contrast m-0">
            Connecting to Server
          </h2>
          <p className="font-sans font-normal text-base leading-6 text-high-contrast m-0">
            Establishing and validating SSH connection...
          </p>
        </div>
        <div className="flex flex-col gap-5 w-[327px]">
          {connectingSteps.map((step) => (
            <CheckListItem key={step.label} label={step.label} status={step.status} />
          ))}
        </div>
      </div>
    </Card>
  )
}
