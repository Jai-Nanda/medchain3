"use client"
import { useEffect, useState } from "react"

export function ClientDate({ timestamp }: { timestamp: number }) {
  const [date, setDate] = useState<string | null>(null)
  
  useEffect(() => {
    setDate(new Date(timestamp).toLocaleString())
  }, [timestamp])
  
  // Return null on server/initial render to avoid hydration mismatch
  if (date === null) {
    return null
  }
  
  return <>{date}</>
}
