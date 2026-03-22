import { CheckCircleOutlineIcon, CheckCircleIcon } from '@/assets/icons'
import { Card } from './PageLayout'

const configuredItems = [
  { label: 'Server: Localhost', description: 'Host.docker.internal' },
  { label: 'Project: My First Project', description: 'Production environment ready' },
  { label: 'Docker Engine', description: 'Installed and running' },
]

export function SetupCompleteView({ onGoToDashboard }: { onGoToDashboard: () => void }) {
  return (
    <Card className="p-10">
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <CheckCircleOutlineIcon />
          <h2 className="font-sans font-semibold text-2xl leading-8 text-high-contrast m-0">
            Setup Complete
          </h2>
          <p className="font-sans font-normal text-lg leading-7 text-high-contrast m-0">
            Your server is connected and ready. Start deploying your first resource.
          </p>
        </div>

        <div className="flex flex-col gap-9 w-[600px]">
          <h3 className="font-sans font-semibold text-2xl leading-8 text-high-contrast m-0">
            What is configured?
          </h3>
          <div className="flex flex-col gap-6">
            {configuredItems.map((item) => (
              <div key={item.label} className="flex items-start gap-2.5">
                <CheckCircleIcon />
                <div className="flex flex-col">
                  <span className="font-sans font-semibold text-lg leading-7 text-high-contrast">
                    {item.label}
                  </span>
                  <span className="font-sans font-normal text-lg leading-7 text-high-contrast">
                    {item.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onGoToDashboard}
          className="w-[600px] bg-secondary text-pure-white font-manrope font-bold text-sm leading-6 rounded-lg px-4 py-2 hover:opacity-[0.88] active:opacity-75 transition-opacity duration-150"
        >
          Go to Dashboard
        </button>
      </div>
    </Card>
  )
}
