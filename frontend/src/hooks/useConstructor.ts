import { useState } from 'react'

export function useConstructor(callback: () => void) {
  const [runInitializer, setRunInitializer] = useState(true)

  if (runInitializer) {
    callback()
    setRunInitializer(false)
  }
}
