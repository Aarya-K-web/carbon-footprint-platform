import { useEffect, useState } from "react"

export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => { setIsClient(true) }, [])
  if (!isClient) return <div className="absolute inset-0 bg-slate-950" />
  return <>{children}</>
}
