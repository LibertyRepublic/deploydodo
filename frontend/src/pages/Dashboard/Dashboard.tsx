import { Logo } from '@/components/Logo'
import {
  SearchIcon,
  BellIcon,
  HelpIcon,
  PlusIcon,
  NavDashboardIcon,
  NavProjectsIcon,
  NavServersIcon,
  NavSourcesIcon,
  NavDestinationsIcon,
  NavSharedVariablesIcon,
  NavKeysIcon,
  NavTerminalIcon,
  NavSettingsIcon,
  NavLogoutIcon,
} from '@/assets/icons'
import type { ComponentType, SVGProps } from 'react'
import { cn } from '@/utilities/cn'

type NavItemDef = {
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  label: string
  active?: boolean
}

const mainNavItems: NavItemDef[] = [
  { Icon: NavDashboardIcon, label: 'Dashboard', active: true },
  { Icon: NavProjectsIcon, label: 'Projects' },
  { Icon: NavServersIcon, label: 'Servers' },
  { Icon: NavSourcesIcon, label: 'Sources' },
  { Icon: NavDestinationsIcon, label: 'Destinations' },
  { Icon: NavSharedVariablesIcon, label: 'Shared Variables' },
  { Icon: NavKeysIcon, label: 'Keys & Tokens' },
  { Icon: NavTerminalIcon, label: 'Terminal' },
  { Icon: NavSettingsIcon, label: 'Settings' },
]

function NavItem({ Icon, label, active = false }: NavItemDef) {
  return (
    <button
      className={cn([
        'flex items-center gap-2 w-full pl-3 pr-2 py-2 rounded-lg text-left transition-colors duration-150',
        active ? 'bg-neutral-200' : 'hover:bg-neutral-200',
      ])}
    >
      <Icon className="size-4 shrink-0" />
      <span
        className={cn([
          'font-manrope text-sm leading-6',
          active ? 'font-bold text-secondary' : 'font-normal text-high-contrast',
        ])}
      >
        {label}
      </span>
    </button>
  )
}

export function Dashboard() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="h-16 flex items-center shrink-0">
        {/* Logo */}
        <div className="w-60 h-full flex items-center px-6 border-r border-b border-neutral-100 shrink-0">
          <Logo />
        </div>

        {/* Search + actions */}
        <div className="flex-1 flex items-center justify-between pl-3 pr-6 border-b border-neutral-100 h-full">
          {/* Search */}
          <div className="w-80 flex items-center gap-2 px-2 py-2 border border-neutral-100 rounded-lg">
            <SearchIcon className="size-6 shrink-0" />
            <span className="flex-1 font-manrope font-normal text-sm leading-6 text-text-secondary">
              Search input field
            </span>
            <span className="font-manrope font-normal text-[12px] leading-4 text-text-secondary">
              ⌘+K
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="size-9 flex items-center justify-center rounded-lg hover:bg-neutral-200 transition-colors">
              <BellIcon className="size-6" />
            </button>
            <button className="size-9 flex items-center justify-center rounded-lg hover:bg-neutral-200 transition-colors">
              <HelpIcon className="size-6" />
            </button>
            <button className="size-8 rounded-full bg-primary-darker flex items-center justify-center shrink-0">
              <span className="font-manrope font-bold text-sm leading-6 text-pure-white">JS</span>
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <nav className="w-60 border-r border-neutral-100 flex flex-col justify-between pt-6 px-6 pb-2 shrink-0">
          <div className="flex flex-col gap-2">
            {mainNavItems.map((item) => (
              <NavItem key={item.label} {...item} />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <div className="border-t border-neutral-100" />
            <NavItem Icon={NavLogoutIcon} label="Logout" />
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 p-8">
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="font-sans font-semibold text-[40px] leading-12 tracking-[-0.5px] text-high-contrast m-0">
                Dashboard
              </h1>
              <p className="font-sans font-normal text-base leading-6 text-text-secondary m-0">
                View your projects and resources at a glance
              </p>
            </div>
            <button className="flex items-center gap-2 pl-2 pr-4 py-2 border border-text-secondary rounded-lg hover:bg-neutral-200 transition-colors">
              <PlusIcon className="size-4 shrink-0" />
              <span className="font-manrope font-bold text-sm leading-6 text-high-contrast">
                New
              </span>
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
