import { useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { useCreateLocalServer, useCreateRemoteServer } from '@/api/mutations'
import { TextInput } from '@/components/TextInput'
import { Button } from '@/components/Button'
import { cn } from '@/utilities/cn'

type ServerTypeOption = 'local' | 'remote'
type AuthTypeOption = 'password' | 'keypair'

type AddServerModalProps = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddServerModal({ open, onClose, onSuccess }: AddServerModalProps) {
  const [serverType, setServerType] = useState<ServerTypeOption>('local')
  const [name, setName] = useState('')
  const [hostname, setHostname] = useState('')
  const [port, setPort] = useState('22')
  const [authType, setAuthType] = useState<AuthTypeOption>('password')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createLocal = useCreateLocalServer({
    onSuccess: () => { onSuccess(); onClose() },
    onError: (e) => setError(e.message),
  })

  const createRemote = useCreateRemoteServer({
    onSuccess: () => { onSuccess(); onClose() },
    onError: (e) => setError(e.message),
  })

  const isSubmitting = createLocal.isPending || createRemote.isPending

  function reset() {
    setServerType('local')
    setName('')
    setHostname('')
    setPort('22')
    setAuthType('password')
    setUsername('')
    setPassword('')
    setPrivateKey('')
    setPublicKey('')
    setError(null)
  }

  function handleClose() {
    if (isSubmitting) return
    reset()
    onClose()
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !hostname.trim()) {
      setError('Name and hostname are required')
      return
    }

    if (serverType === 'local') {
      createLocal.mutate({ name: name.trim(), hostname: hostname.trim() })
    } else {
      if (!port || isNaN(Number(port))) {
        setError('Valid port is required')
        return
      }
      if (!username.trim()) {
        setError('Username is required')
        return
      }
      if (authType === 'password' && !password) {
        setError('Password is required')
        return
      }
      if (authType === 'keypair' && !privateKey.trim()) {
        setError('Private key is required')
        return
      }

      createRemote.mutate({
        name: name.trim(),
        hostname: hostname.trim(),
        port: Number(port),
        auth: authType === 'password'
          ? { authType: 'password', username: username.trim(), password }
          : { authType: 'keypair', username: username.trim(), privateKey: privateKey.trim(), publicKey: publicKey.trim() || null },
      })
    }
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" onClick={handleClose} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 flex justify-between items-start shrink-0">
          <div className="flex flex-col gap-0.5">
            <h2 className="font-sans font-semibold text-xl leading-7 text-high-contrast m-0">Add Server</h2>
            <p className="font-sans font-normal text-sm leading-5 text-text-secondary m-0">
              Configure a new server for your deployments.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="size-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-high-contrast hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
          {/* Server type toggle */}
          <div className="flex flex-col gap-2">
            <label className="font-sans font-normal text-base leading-6 text-secondary">Server Type</label>
            <div className="flex rounded-lg border border-neutral-100 overflow-hidden">
              <button
                type="button"
                onClick={() => setServerType('local')}
                className={cn(
                  'flex-1 py-2 font-manrope text-sm leading-6 transition-colors',
                  serverType === 'local'
                    ? 'bg-secondary text-pure-white font-bold'
                    : 'bg-background text-text-secondary font-normal hover:text-high-contrast'
                )}
              >
                Local
              </button>
              <button
                type="button"
                onClick={() => setServerType('remote')}
                className={cn(
                  'flex-1 py-2 font-manrope text-sm leading-6 transition-colors',
                  serverType === 'remote'
                    ? 'bg-secondary text-pure-white font-bold'
                    : 'bg-background text-text-secondary font-normal hover:text-high-contrast'
                )}
              >
                Remote
              </button>
            </div>
          </div>

          {/* Common fields */}
          <TextInput label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Server" required />
          <TextInput label="Hostname" value={hostname} onChange={(e) => setHostname(e.target.value)} placeholder="192.168.1.100" required />

          {/* Remote-only fields */}
          {serverType === 'remote' && (
            <>
              <TextInput label="Port" type="number" value={port} onChange={(e) => setPort(e.target.value)} placeholder="22" />

              {/* Auth type */}
              <div className="flex flex-col gap-2">
                <label className="font-sans font-normal text-base leading-6 text-secondary">Authentication</label>
                <div className="flex rounded-lg border border-neutral-100 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setAuthType('password')}
                    className={cn(
                      'flex-1 py-2 font-manrope text-sm leading-6 transition-colors',
                      authType === 'password'
                        ? 'bg-secondary text-pure-white font-bold'
                        : 'bg-background text-text-secondary font-normal hover:text-high-contrast'
                    )}
                  >
                    Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthType('keypair')}
                    className={cn(
                      'flex-1 py-2 font-manrope text-sm leading-6 transition-colors',
                      authType === 'keypair'
                        ? 'bg-secondary text-pure-white font-bold'
                        : 'bg-background text-text-secondary font-normal hover:text-high-contrast'
                    )}
                  >
                    Key Pair
                  </button>
                </div>
              </div>

              <TextInput label="Username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="root" required />

              {authType === 'password' ? (
                <TextInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="font-sans font-normal text-base leading-6 text-secondary" htmlFor="private-key">Private Key</label>
                    <textarea
                      id="private-key"
                      value={privateKey}
                      onChange={(e) => setPrivateKey(e.target.value)}
                      placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
                      className="w-full bg-background border border-neutral-100 rounded-lg px-3 py-2 font-mono font-normal text-xs leading-5 text-secondary outline-none resize-none focus:border-secondary transition-[border-color] duration-150"
                      rows={6}
                      required
                    />
                  </div>
                  <TextInput label="Public Key (optional)" value={publicKey} onChange={(e) => setPublicKey(e.target.value)} />
                </>
              )}
            </>
          )}

          {error && (
            <p className="font-manrope text-sm text-error m-0">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-3 shrink-0">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : `Create ${serverType === 'local' ? 'Local' : 'Remote'} Server`}
          </Button>
        </div>
      </form>
    </div>,
    document.body
  )
}
