import { createLazyRoute } from '@tanstack/react-router'
import { Pending } from '@/pages/Pending/Pending'
import { DashboardLayout } from '@/pages/Dashboard/DashboardLayout'

export const DashboardLayoutRoute = createLazyRoute('dashboard-layout')({
  pendingComponent: Pending,
  component: DashboardLayout,
})
