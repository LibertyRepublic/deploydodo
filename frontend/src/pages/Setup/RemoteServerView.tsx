import { type SubmitEvent, useState } from 'react'
import { ArrowBackIcon, WarningCircleIcon } from '@/assets/icons'
import { Card } from './PageLayout'

type AuthMethod = 'ssh-key' | 'password'

function FormField({
  label,
  helperText,
  children,
}: {
  label: string
  helperText: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-manrope font-bold text-base leading-6 text-high-contrast">
        {label}
      </label>
      {children}
      <span className="font-manrope font-normal text-xs leading-4 text-[#999ca0] pl-3">
        {helperText}
      </span>
    </div>
  )
}

function TextInput({
  placeholder,
  defaultValue,
  type = 'text',
}: {
  placeholder: string
  defaultValue?: string
  type?: string
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      defaultValue={defaultValue}
      className="bg-background border border-neutral-100 rounded-lg px-3 py-2 font-manrope font-normal text-sm leading-6 text-text-secondary outline-none transition-[border-color] duration-150 placeholder:text-text-secondary focus:border-high-contrast w-full"
    />
  )
}

function AlertBanner({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div className="bg-[rgba(255,122,73,0.12)] border border-primary-darker rounded-lg p-3 flex flex-col gap-2">
      <div className="flex items-center gap-1">
        {icon}
        <span className="font-manrope font-bold text-sm leading-6 text-high-contrast">{title}</span>
      </div>
      <p className="font-manrope font-normal text-sm leading-6 text-high-contrast m-0">{body}</p>
    </div>
  )
}

const whatHappensNext = [
  {
    label: 'Connection Test:',
    body: 'DeployDodo will establish an SSH connection to verify credentials and server accessibility.',
  },
  {
    label: 'Docker Check:',
    body: "We'll verify Docker is installed or offer to install it automatically infrastructure.",
  },
  {
    label: 'Environment Setup:',
    body: 'Required configurations and networks will be created for deployments.',
  },
]

export function RemoteServerView({
  onBack,
  onConnect,
}: {
  onBack: () => void
  onConnect: () => void
}) {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('ssh-key')

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    onConnect()
  }

  return (
    <>
      <Card className="p-8">
        <div className="flex flex-col gap-6">
          <button
            type="button"
            onClick={onBack}
            className="text-high-contrast hover:opacity-70 transition-opacity shrink-0"
            aria-label="Go back"
          >
            <ArrowBackIcon />
          </button>

          <div className="flex flex-col gap-2">
            <h2 className="font-sans font-semibold text-2xl leading-8 text-high-contrast m-0">
              Connect Remote Server
            </h2>
            <p className="font-sans font-normal text-lg leading-7 text-high-contrast m-0">
              Enter your server details to establish SSH connection and configure the deployment
              environment.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <FormField label="Server Name" helperText="A friendly name to identify this server">
              <TextInput placeholder="eg,.Production server" />
            </FormField>

            <FormField
              label="Host / IP Address"
              helperText="The IP address or hostname of your remote server"
            >
              <TextInput placeholder="eg,.192.168.1.100 or server.example.com" />
            </FormField>

            <div className="flex gap-6">
              <FormField label="SSH Port" helperText="Default: 22">
                <TextInput placeholder="22" defaultValue="22" />
              </FormField>
              <FormField label="Username" helperText="SSH user (recommended: root)">
                <TextInput placeholder="root" defaultValue="root" />
              </FormField>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-manrope font-bold text-base leading-6 text-high-contrast">
                Authentication Method
              </span>
              <div className="inline-flex border border-secondary rounded-xl p-1 gap-1 w-fit">
                {(['ssh-key', 'password'] as AuthMethod[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setAuthMethod(method)}
                    className={[
                      'rounded-lg px-2 py-1 h-8 font-manrope font-bold text-sm leading-6 transition-colors duration-150',
                      authMethod === method ? 'bg-secondary text-pure-white' : 'text-high-contrast',
                    ].join(' ')}
                  >
                    {method === 'ssh-key' ? 'SSH Private Key' : 'Password'}
                  </button>
                ))}
              </div>
            </div>

            {authMethod === 'ssh-key' ? (
              <textarea
                className="bg-background border border-neutral-100 rounded-lg px-[15px] py-[15px] h-[132px] font-sans font-normal text-base leading-6 text-text-secondary outline-none resize-none transition-[border-color] duration-150 focus:border-high-contrast w-full"
                placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
              />
            ) : (
              <FormField label="Password" helperText="SSH password for authentication">
                <TextInput placeholder="Enter password" type="password" />
              </FormField>
            )}

            <AlertBanner
              icon={<WarningCircleIcon className="shrink-0 w-5 h-5" />}
              title="How to get your private key:"
              body="Run cat ~/.ssh/id_rsa or cat ~/.ssh/id_ed25519 on your local machine"
            />

            <button
              type="submit"
              className="w-full bg-secondary text-pure-white font-manrope font-bold text-sm leading-6 rounded-lg px-4 py-2 hover:opacity-[0.88] active:opacity-75 transition-opacity duration-150"
            >
              Connect &amp; Continue
            </button>
          </form>
        </div>
      </Card>

      <Card className="p-8">
        <div className="flex flex-col gap-3">
          <h3 className="font-sans font-semibold text-lg leading-7 text-primary-darker m-0">
            What Happens Next
          </h3>
          <div className="flex flex-col gap-2">
            {whatHappensNext.map((item) => (
              <p
                key={item.label}
                className="font-sans font-normal text-base leading-6 text-secondary m-0"
              >
                <span className="font-manrope font-bold">{item.label}</span> {item.body}
              </p>
            ))}
          </div>
        </div>
      </Card>
    </>
  )
}
