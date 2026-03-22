import { createRoute } from '@tanstack/react-router'
import { requireAuth, rootRoute } from '@/routeConfig'
import { SelectServer } from './SelectServer'
import { Pending } from '@/pages/Pending/Pending'

export const selectServerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/setup/server',
  beforeLoad: requireAuth,
  pendingComponent: Pending,
  component: SelectServer,
})
