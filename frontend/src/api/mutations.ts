import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { api } from './client'
import type {
  CreateAdminRequest,
  CreateAdminResponse,
  CreateRemoteServerRequest,
  StartJobResponse,
} from './types'

type Result<T> = { data: T | undefined; error: unknown; response: Response }

export function useCreateAdmin(
  options?: Omit<
    UseMutationOptions<Result<CreateAdminResponse>, Error, CreateAdminRequest>,
    'mutationFn'
  >,
) {
  return useMutation({
    ...options,
    mutationFn: (body: CreateAdminRequest) =>
      api.POST('/api/setup/admin', { body }) as Promise<Result<CreateAdminResponse>>,
  })
}

export function useCreateRemoteServer(
  options?: Omit<
    UseMutationOptions<Result<StartJobResponse>, Error, CreateRemoteServerRequest>,
    'mutationFn'
  >,
) {
  return useMutation({
    ...options,
    mutationFn: (body: CreateRemoteServerRequest) =>
      api.POST('/api/setup/server/remote', { body }) as Promise<Result<StartJobResponse>>,
  })
}
