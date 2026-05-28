import { createRoute } from '@tanstack/react-router'
import { requireAuth, rootRoute } from '@/routeConfig'
import { Dashboard } from './Dashboard'
import { Pending } from '@/pages/Pending/Pending'

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  beforeLoad: requireAuth,
  pendingComponent: Pending,
  component: Dashboard,
})
