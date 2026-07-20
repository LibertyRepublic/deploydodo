import { createLazyRoute } from '@tanstack/react-router'
import { Pending } from '../Pending/Pending'
import { DashboardLayout } from './DashboardLayout'

export const DashboardLayoutRoute = createLazyRoute('dashboard-layout')({
  pendingComponent: Pending,
  component: DashboardLayout,
})
