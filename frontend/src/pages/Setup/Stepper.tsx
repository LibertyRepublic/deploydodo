import { CheckIcon } from '@/assets/icons'

const steps = [
  { number: 1, label: 'Server' },
  { number: 2, label: 'Connection' },
  { number: 3, label: 'Complete' },
]

export function Stepper({
  completedSteps = [],
  currentStep,
  nextStep,
}: {
  completedSteps?: number[]
  currentStep?: number
  nextStep?: number
}) {
  return (
    <div className="flex items-center gap-4 w-full max-w-[672px]">
      {steps.map((step, i) => {
        const done = completedSteps.includes(step.number)
        const active = step.number === currentStep
        const upcoming = step.number === nextStep

        return (
          <div key={step.number} className="flex items-center gap-4 flex-1 last:flex-none">
            <div className="flex items-center gap-2 shrink-0">
              <div
                className={[
                  'w-5 h-5 rounded-full flex items-center justify-center',
                  done || active ? 'bg-high-contrast border border-high-contrast' : '',
                  upcoming ? 'border border-secondary' : '',
                  !done && !active && !upcoming ? 'border border-[#e5e7eb]' : '',
                ].join(' ')}
              >
                {done ? (
                  <CheckIcon className="w-[14px] h-[14px]" />
                ) : (
                  <span
                    className={[
                      'font-manrope font-semibold text-xs leading-3',
                      active ? 'text-pure-white' : '',
                      upcoming ? 'text-secondary' : '',
                      !active && !upcoming ? 'text-[#4a5565]' : '',
                    ].join(' ')}
                  >
                    {step.number}
                  </span>
                )}
              </div>
              <span
                className={[
                  'font-manrope font-semibold text-sm leading-4',
                  done || active || upcoming ? 'text-high-contrast' : 'text-[#4a5565]',
                ].join(' ')}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-[#e5e7eb]" />}
          </div>
        )
      })}
    </div>
  )
}
