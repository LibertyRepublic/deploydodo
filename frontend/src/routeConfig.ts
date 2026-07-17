import { createRootRoute, Outlet, redirect } from '@tanstack/react-router'
import { statusQuery, validateSessionQuery } from '@/api/queries'

export const rootRoute = createRootRoute({ component: Outlet })

export async function requireAuth() {
  const validateSession = await validateSessionQuery()
  if (!validateSession.valid) {
    throw redirect({ to: '/login' })
  }

  const status = await statusQuery()
  if (!status.isAdminOnboarded) throw redirect({ to: '/onboarding' })

  return { status }
}
