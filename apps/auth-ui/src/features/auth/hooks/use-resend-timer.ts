import { useCallback, useEffect, useState } from "react"

export function useResendTimer(initialSeconds = 30) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (!isRunning || seconds <= 0) {
      return
    }

    const timeout = window.setTimeout(() => {
      setSeconds(prev => Math.max(prev - 1, 0))
    }, 1000)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [isRunning, seconds])

  useEffect(() => {
    if (seconds === 0) {
      setIsRunning(false)
    }
  }, [seconds])

  const start = useCallback(() => {
    setSeconds(initialSeconds)
    setIsRunning(true)
  }, [initialSeconds])

  return {
    seconds,
    isRunning,
    canResend: seconds === 0,
    start
  }
}
