import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useCreateLocalServer, useCreateRemoteServer } from '@/api/mutations'
import { TextInput } from '@/components/TextInput'
import { Textarea } from '@/components/Textarea'
import { Button } from '@/components/Button'
import { cn } from '@/utilities/cn'
import { useJobEvents } from '@/hooks/useJobEvents'
import type { ConnectingStep } from '@/api/types'
import { SpinnerIcon, CheckCircleIcon, WarningCircleIcon } from '@/assets/icons'
import { invalidateServersQuery, invalidateStatusQuery } from '@/api/queries'
import { ButtonGroup } from '@/components/ButtonGroup'
import type { SshAuthRequest } from '@/api/Api'

type FormValues = {
  serverType: 'local' | 'remote'
  name: string
  hostname: string
  port: string
  username: string
  authMethod: 'password' | 'keypair'
  password: string
  privateKey: string
}

type AddServerModalProps = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const validationSchema = Yup.object({
  name: Yup.string().trim().required('Server name is required'),
  hostname: Yup.string()
    .trim()
    .when('serverType', {
      is: 'remote' as const,
      then: (s) => s.trim().required('Hostname is required'),
      otherwise: (s) => s,
    }),
  port: Yup.string().when('serverType', {
    is: 'remote' as const,
    then: (s) =>
      s
        .test('is-number', 'Port must be a number', (v) => v === '' || !isNaN(Number(v)))
        .test('is-in-range', 'Port must be between 1 and 65535', (v) => {
          if (v === '') return false
          const n = Number(v)
          return n >= 1 && n <= 65535
        })
        .required('Port is required'),
    otherwise: (s) => s,
  }),
  username: Yup.string().when('serverType', {
    is: 'remote' as const,
    then: (s) => s.trim().required('Username is required'),
    otherwise: (s) => s,
  }),
  privateKey: Yup.string().when(['authMethod', 'serverType'], {
    is: (authMethod: string, serverType: string) =>
      authMethod === 'keypair' && serverType === 'remote',
    then: (s) => s.trim().required('Private key is required'),
    otherwise: (s) => s,
  }),
  password: Yup.string().when(['authMethod', 'serverType'], {
    is: (authMethod: string, serverType: string) =>
      authMethod === 'password' && serverType === 'remote',
    then: (s) => s.required('Password is required'),
    otherwise: (s) => s,
  }),
})

export function AddServerModal({ open, onClose, onSuccess }: AddServerModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>('c4082e6d-971d-4c6c-a648-646c359394c1')

  function refreshQueries() {
    return Promise.all([invalidateStatusQuery(), invalidateServersQuery()])
  }

  const createLocal = useCreateLocalServer({
    onSuccess: async () => {
      await refreshQueries()
      onSuccess()
      onClose()
    },
    onError: (error) => {
      setError(error.message)
    },
  })
  const createRemote = useCreateRemoteServer({
    onSuccess: async (data) => {
      await refreshQueries()
      setJobId(data.jobId)
    },
    onError: (e) => setError(e.message),
  })

  const isSubmitting = createLocal.isPending || createRemote.isPending

  const formik = useFormik<FormValues>({
    initialValues: {
      serverType: 'local',
      name: '',
      hostname: '',
      port: '22',
      username: 'root',
      authMethod: 'password',
      password: '',
      privateKey: '',
    },
    validationSchema,
    validateOnMount: false,
    onSubmit: (values) => {
      setError(null)

      if (values.serverType === 'local') {
        createLocal.mutate({ name: values.name.trim() })
      } else {
        const auth: SshAuthRequest =
          values.authMethod === 'password'
            ? {
                authType: 'password',
                username: values.username.trim(),
                password: values.password,
              }
            : {
                authType: 'keypair',
                username: values.username.trim(),
                privateKey: values.privateKey.trim(),
              }

        createRemote.mutate({
          name: values.name.trim(),
          hostname: values.hostname.trim(),
          port: Number(values.port),
          auth,
        })
      }
    },
  })

  const isLocal = formik.values.serverType === 'local'

  function reset() {
    formik.resetForm()
    setError(null)
    setJobId(null)
  }

  function handleClose() {
    if (isSubmitting) return
    reset()
    onClose()
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" />
      <form
        onSubmit={formik.handleSubmit}
        className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col overflow-hidden"
        noValidate
      >
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
            disabled={isSubmitting}
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
              // onSuccess()
              // handleClose()
            }}
            onError={(msg) => {
              setError(msg)
              setJobId(null)
            }}
          />
        ) : (
          <>
            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="min-h-70 flex flex-col gap-5">
                {/* Server type toggle */}
                <ButtonGroup
                  value={formik.values.serverType}
                  label="Server Type"
                  onSelect={(value) => {
                    formik.resetForm()
                    setError(null)
                    formik.setFieldValue('serverType', value)
                  }}
                  options={[
                    {
                      label: 'Local',
                      value: 'local',
                    },
                    {
                      label: 'Remote',
                      value: 'remote',
                    },
                  ]}
                />
                {/* Common fields */}
                <TextInput
                  label="Name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="My Server"
                  required
                  hasError={formik.touched.name && !!formik.errors.name}
                  errorMessage={
                    formik.touched.name && formik.errors.name ? formik.errors.name : undefined
                  }
                />
                {!isLocal && (
                  <TextInput
                    label="Hostname"
                    name="hostname"
                    value={formik.values.hostname}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="192.168.1.100 or my.server.com"
                    required
                    hasError={formik.touched.hostname && !!formik.errors.hostname}
                    errorMessage={
                      formik.touched.hostname && formik.errors.hostname
                        ? formik.errors.hostname
                        : undefined
                    }
                  />
                )}

                {/* Remote-only fields */}
                {formik.values.serverType === 'remote' && (
                  <>
                    <TextInput
                      label="Port"
                      name="port"
                      type="number"
                      value={formik.values.port}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="22"
                      hasError={formik.touched.port && !!formik.errors.port}
                      errorMessage={
                        formik.touched.port && formik.errors.port ? formik.errors.port : undefined
                      }
                    />
                    {/* Auth type */}
                    <ButtonGroup
                      label="Authentication"
                      options={[
                        { label: 'Password', value: 'password' },
                        { label: 'Key Pair', value: 'keypair' },
                      ]}
                      value={formik.values.authMethod}
                      onSelect={(value) => formik.setFieldValue('authMethod', value)}
                    />

                    <TextInput
                      label="Username"
                      name="username"
                      value={formik.values.username}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="root"
                      required
                      hasError={formik.touched.username && !!formik.errors.username}
                      errorMessage={
                        formik.touched.username && formik.errors.username
                          ? formik.errors.username
                          : undefined
                      }
                    />
                    <div className="min-h-50">
                      {formik.values.authMethod === 'password' ? (
                        <TextInput
                          label="Password"
                          name="password"
                          type="password"
                          value={formik.values.password}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          required
                          hasError={formik.touched.password && !!formik.errors.password}
                          errorMessage={
                            formik.touched.password && formik.errors.password
                              ? formik.errors.password
                              : undefined
                          }
                        />
                      ) : (
                        <Textarea
                          label="Private Key"
                          id="private-key"
                          name="privateKey"
                          value={formik.values.privateKey}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
                          rows={6}
                          hasError={formik.touched.privateKey && !!formik.errors.privateKey}
                          errorMessage={formik.errors.privateKey}
                        />
                      )}
                    </div>
                  </>
                )}

                {error && <p className="font-manrope text-sm text-error m-0">{error}</p>}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-3 shrink-0">
              <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Creating...
                  </>
                ) : (
                  `Create ${formik.values.serverType === 'local' ? 'Local' : 'Remote'} Server`
                )}
              </Button>
            </div>
          </>
        )}
      </form>
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
