import { SpinnerIcon } from '@/assets/icons'
import { Logo } from '@/components/Logo'

export function Pending() {
  return (
    <div className="w-full min-h-screen bg-linear-to-b from-[rgba(255,122,73,0.01)] to-[rgba(252,140,99,0.12)] flex items-center justify-center py-10 px-4">
      <div className="flex flex-col items-center gap-5">
        <Logo size="lg" />
        <SpinnerIcon className="w-10 h-10 animate-spin m-10" />
      </div>
    </div>
  )
}
