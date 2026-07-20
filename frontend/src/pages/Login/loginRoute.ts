import { createLazyRoute } from '@tanstack/react-router'
import { Login } from './Login'

export const LoginRoute = createLazyRoute('login')({
  component: Login,
})
