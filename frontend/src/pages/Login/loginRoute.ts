import { createLazyRoute } from '@tanstack/react-router'
import { Login } from '@/pages/Login/Login'

export const LoginRoute = createLazyRoute('login')({
  component: Login,
})
