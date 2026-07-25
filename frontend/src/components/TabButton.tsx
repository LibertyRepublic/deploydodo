import type { ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utilities/cn'

type TabButtonProps = {
  active?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>

const tabIndicatorVariants = {
  initial: { scaleX: 0 },
  animate: {
    scaleX: 1,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
} as const

export function TabButton({ active = false, children, className, ...props }: TabButtonProps) {
  return (
    <button
      className={cn(
        'relative font-manrope text-sm leading-6 pb-2 transition-colors duration-150 outline-none',
        active
          ? 'font-bold text-high-contrast'
          : 'font-normal text-text-secondary hover:text-high-contrast',
        className,
      )}
      {...props}
    >
      {children}
      {active && (
        <motion.div
          layoutId="activeTabIndicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-high-contrast"
          variants={tabIndicatorVariants}
          initial="initial"
          animate="animate"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
    </button>
  )
}
