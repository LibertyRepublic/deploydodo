import { useQuery } from '@tanstack/react-query'
import { api } from './client'

export function useStatusQuery() {
  return useQuery({
    queryKey: ['status'],
    queryFn: getStatus,
  })
}

export async function getStatus() {
  const { data, error } = await api.GET('/api/status')
  if (error) throw error
  return data!
}

export function useServersQuery() {
  return useQuery({
    queryKey: ['servers'],
    queryFn: getServers,
    staleTime: 30_000,
  })
}

export async function getServers() {
  const { data, error } = await api.GET('/api/servers')
  if (error) throw error
  return data!
}

export async function validateSession(): Promise<boolean> {
  const token = localStorage.getItem('session_token')
  if (!token) return false

  const { error } = await api.GET('/api/auth/validate', {
    headers: { Authorization: `Bearer ${token}` },
  })

  return !error
}
