import { createRootRoute, Outlet, redirect } from '@tanstack/react-router'

export const rootRoute = createRootRoute({ component: Outlet })

export async function requireAuth() {
  const { validateSession, getStatus } = await import('@/api/queries')
  const valid = await validateSession()
  if (!valid) throw redirect({ to: '/login' })

  const status = await getStatus()
  if (!status.isAdminOnboarded) throw redirect({ to: '/onboarding' })

  return { status }
}
