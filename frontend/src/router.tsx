import { createRoute, createRouter, redirect } from '@tanstack/react-router'
import { requireAuth, rootRoute } from '@/routeConfig'
import { onboardingRoute } from '@/pages/Onboarding/route'
import { welcomeRoute } from '@/pages/Welcome/route'
import { selectServerRoute } from '@/pages/Setup/route'

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => redirect({ to: '/onboarding' }),
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: requireAuth,
  component: () => null, // TODO: implement login page
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  beforeLoad: requireAuth,
  path: '/dashboard',
  component: () => null, // TODO: implement dashboard page
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  onboardingRoute,
  welcomeRoute,
  selectServerRoute,
  loginRoute,
  dashboardRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
