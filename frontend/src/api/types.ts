import type { components } from './schema'

export type AccountType = components['schemas']['AccountType']
export type CreateAdminResponse = components['schemas']['AdminResponse']
export type CreateAdminRequest = components['schemas']['CreateAdminRequest']
export type HealthResponse = components['schemas']['HealthResponse']
export type CreateRemoteServerRequest = components['schemas']['CreateRemoteServerRequest']
export type SshAuthRequest = components['schemas']['SshAuthRequest']
export type StartJobResponse = components['schemas']['StartJobResponse']
export type CreateLocalServerRequest = components['schemas']['CreateLocalServerRequest']
export type CreateLocalServerResponse = components['schemas']['CreateLocalServerResponse']
export type ServerType = components['schemas']['ServerType']
export type ServerResponse = components['schemas']['ServerResponse']

// SSE event payloads emitted by the job worker (not in OpenAPI schema)
export type ConnectingStepStatus = 'pending' | 'loading' | 'done' | 'warning'
export type ConnectingStep = { key: string; label: string; status: ConnectingStepStatus }
export type JobProgressPayload = { steps: ConnectingStep[] }
export type JobCompletePayload = {
  id: number
  name: string
  serverType: string
  hostname: string
  port: number
}
export type JobErrorPayload = { message: string; errorType?: 'networkError' | 'appError' }
