import { useEffect, useRef, useState } from "react"

export function useDebounce<T>(value: T, delay: number) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value)
      }, delay)
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler)
      }
    },
    [value, delay] // Only re-call effect if value or delay changes
  )
  return debouncedValue
}

export function useThrottle<T>(value: T, delay: number) {
  const [throttleValue, setThrottleValue] = useState(value)
  const [shouldWait, setShouldWait] = useState(false)

  useEffect(() => {
    if(shouldWait) {
      return
    }

    setThrottleValue(value)

    setShouldWait(true)

    setTimeout(() => {
      setShouldWait(false)
    }, delay)
  }, [value, delay, shouldWait])

  return throttleValue
}

export const useRunOnce = (func: () => void) => {
  const init = useRef(false)
  useEffect(() => {
    if(!init.current) {
      func()
      init.current = true
    }
  }, [])
}
