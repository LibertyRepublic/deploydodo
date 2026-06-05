import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { welcomeRoute } from '@/pages/Welcome/route'
import { LogoIcon, PendingSpinnerIcon } from '@/assets/icons'
import { Button } from '@/components/Button'

function LayeredCheckCircleIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="15" cy="15" r="15" fill="#ff713e" fillOpacity="0.12" />
      <circle cx="15" cy="15" r="10" fill="#ff713e" fillOpacity="0.2" />
      <path
        d="M10 15.5L13.5 19L20 12"
        stroke="#ff713e"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type ItemTitle = 'Admin Account' | 'Server Setup' | 'First Project'

const itemRoutes: Record<ItemTitle, string> = {
  'Admin Account': '/setup/server',
  'Server Setup': '/setup/server',
  'First Project': '/dashboard',
}

export function Welcome() {
  const navigate = useNavigate()
  const status = welcomeRoute.useLoaderData()

  const items = [
    {
      done: status.isAdminOnboarded,
      title: 'Admin Account' as const,
      description: 'Set up your account and secure your instance',
    },
    {
      done: status.isServerSetup,
      title: 'Server Setup' as const,
      description: 'Configure your server and connect to it',
    },
    {
      done: status.isProjectSetup,
      title: 'First Project' as const,
      description: 'Create a project to organize your applications',
    },
  ]

  const [selectedItem, setSelectedItem] = useState<ItemTitle>(() => {
    const firstIncomplete = items.find((item) => !item.done)
    return firstIncomplete?.title ?? items[0].title
  })

  return (
    <div className="w-full min-h-screen bg-linear-to-b from-[rgba(255,122,73,0.01)] to-[rgba(252,140,99,0.12)] flex items-center justify-center py-10 px-4">
      <div className="flex flex-col items-center gap-5">
        <div className="w-9 h-9 bg-primary-darker rounded-[10.8px] flex items-center justify-center">
          <LogoIcon />
        </div>

        <h1 className="font-sans font-semibold text-[32px] leading-10 tracking-[-0.5px] text-high-contrast m-0">
          Welcome to DeployDodo
        </h1>

        <div className="bg-background rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08),0px_0px_1px_0px_rgba(0,0,0,0.2)] w-[484px] max-w-full p-8">
          <div className="flex flex-col gap-6">
            <h2 className="font-sans font-semibold text-2xl leading-8 text-high-contrast m-0">
              What You'll Set Up
            </h2>

            <div className="flex flex-col gap-[25px]">
              {items.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setSelectedItem(item.title)}
                  className="flex items-start gap-[10px] w-full text-left rounded-lg p-3 hover:bg-neutral-100 transition-colors duration-150"
                >
                  {selectedItem === item.title ? (
                    <div className="shrink-0 mt-0.5">
                      <LayeredCheckCircleIcon />
                    </div>
                  ) : (
                    <PendingSpinnerIcon className="size-7" />
                  )}
                  <div className="flex flex-col">
                    <span className="font-sans font-semibold text-lg leading-7 text-high-contrast">
                      {item.title}
                    </span>
                    <span className="font-sans font-normal text-base leading-6 text-high-contrast">
                      {item.description}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <Button fullWidth onClick={() => navigate({ to: itemRoutes[selectedItem] })}>
                Continue setup
              </Button>
              <Button fullWidth variant="ghost" onClick={() => navigate({ to: '/dashboard' })}>
                Skip for now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
