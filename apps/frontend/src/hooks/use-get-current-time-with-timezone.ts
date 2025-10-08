import { tz } from "@date-fns/tz"
import { format as dateFmt } from "date-fns"
import { useEffect, useMemo, useState } from "react"

export function useGetCurrentTimeWithTimezone(
  timezone: string,
  format?: string,
) {
  const [time, setTime] = useState<Date>(() => new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000) // Update every second

    return () => clearInterval(interval)
  }, [])

  const currentTime = useMemo(() => {
    return dateFmt(time, format || "hh:mm:ss a", { in: tz(timezone) })
  }, [time, timezone, format])

  return currentTime
}
