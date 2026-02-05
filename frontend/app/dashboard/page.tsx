"use client"

/**
 * Dashboard Page
 * Main panel after successful login
 * Shows server management interface and admin logs
 */

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { ServerPanel } from "@/components/server-panel"
import { isAuthenticated } from "@/lib/auth"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      // Redirect to login if not authenticated
      router.push("/")
    } else {
      setIsLoading(false)
    }
  }, [router])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader />
      <ServerPanel />
    </div>
  )
}
