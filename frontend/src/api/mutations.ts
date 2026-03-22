import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { api } from './client'
import type { CreateAdminRequest, CreateAdminResponse } from './types'

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
