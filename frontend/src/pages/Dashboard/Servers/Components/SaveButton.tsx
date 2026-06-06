
export function SaveButton({ label = 'Save', type = 'submit' as const, onClick }: { label?: string; type?: 'submit' | 'button'; onClick?: () => void }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="bg-secondary text-pure-white font-manrope font-bold text-sm leading-6 rounded-lg px-4 py-2 hover:opacity-[0.88] active:opacity-75 transition-opacity duration-150"
    >
      {label}
    </button>
  )
}
