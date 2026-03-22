import { createRoute, redirect } from '@tanstack/react-router'
import { rootRoute } from '@/routeConfig'
import { Onboarding } from './Onboarding'
import { Pending } from '@/pages/Pending/Pending'

export const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  beforeLoad: async () => {
    const { getStatus, validateSession } = await import('@/api/queries')
    const status = await getStatus()
    if (status.isAdminOnboarded) {
      const isLoggedIn = await validateSession()
      throw redirect({ to: isLoggedIn ? '/welcome' : '/login' })
    }
  },
  pendingComponent: Pending,
  component: Onboarding,
})
