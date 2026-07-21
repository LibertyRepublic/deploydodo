import { useState } from 'react'
import { Button } from '@/components/Button'
import { DotsHorizontalIcon, WifiIcon } from '@/assets/icons/index copy'
import { mockPrivateKeys } from '../mockData'

export function PrivateKeySection() {
  const [keys, setKeys] = useState(mockPrivateKeys.map((k) => ({ ...k, menuOpen: false })))

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="font-sans font-bold text-3xl text-high-contrast m-0">Private Key</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {}}>
            <span className="font-sans font-bold mr-1">+</span> Add
          </Button>
          <Button variant="outline" onClick={() => {}}>
            <WifiIcon className="size-4 mr-1.5 shrink-0" />
            Check connection
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-md max-w-full">
        {keys.map((key) => (
          <div
            key={key.id}
            className="border border-neutral-100 rounded-xl p-5 flex flex-col gap-3 bg-white"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="font-sans font-semibold text-base leading-6 text-high-contrast">
                  {key.name}
                </span>
                <p className="font-sans font-normal text-sm leading-5 text-text-secondary m-0">
                  {key.description}
                </p>
              </div>
              <div className="relative">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() =>
                    setKeys(
                      keys.map((k) =>
                        k.id === key.id
                          ? { ...k, menuOpen: !k.menuOpen }
                          : { ...k, menuOpen: false },
                      ),
                    )
                  }
                  className="px-1! py-0.5! rounded! hover:bg-neutral-100!"
                >
                  <DotsHorizontalIcon className="size-4" />
                </Button>
                {key.menuOpen && (
                  <div className="absolute right-0 top-7 bg-white border border-neutral-100 rounded-lg shadow-md py-1 z-10 min-w-32.5">
                    <button
                      type="button"
                      onClick={() => setKeys(keys.map((k) => ({ ...k, menuOpen: false })))}
                      className="w-full text-left px-3 py-1.5 font-manrope text-sm text-high-contrast hover:bg-neutral-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setKeys(keys.filter((k) => k.id !== key.id))
                      }}
                      className="w-full text-left px-3 py-1.5 font-manrope text-sm text-error hover:bg-neutral-100"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            {key.current && (
              <span className="font-manrope font-semibold text-xs px-2 py-0.5 rounded bg-[#eaf6ec] text-[#2e7d32] w-fit">
                Currently used
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
