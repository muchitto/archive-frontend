import { useCallback, useEffect, useRef, useState } from "react"

// Some of these are from https://usehooks.com/

export function useDebounce<T>(value: T, delay: number): T {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
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

export const useRunOnce = (func: () => void, areTruthy: unknown[] = []) => {
  const init = useRef(false)

  const canSet = (areTruthy) ? areTruthy.every(data => {
    if(data) {
      return true
    }
    return false
  }) : true

  useEffect(() => {
    if(!init.current && canSet) {
      func()
      init.current = true
    }
  }, [init, canSet])
}

export const useInitialized = (initialValue: boolean, areTruthy : unknown[] = []) => {
  const isInitialized = useRef(initialValue)
  
  useRunOnce(() => {
    isInitialized.current = true
  }, areTruthy)

  return isInitialized.current
}

export const useToggle = (initialState = false) => {
  // Initialize the state
  const [state, setState] = useState(initialState)
  
  // Define and memorize toggler function in case we pass down the component,
  // This function change the boolean value to it's opposite value
  const toggle = useCallback(() => setState(state => !state), [])
  
  return [state, toggle]
}