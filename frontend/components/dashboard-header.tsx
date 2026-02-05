"use client"

/**
 * Dashboard Header Component
 * Displays user info and logout button
 */

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { logout, getCurrentUser } from "../lib/auth"
import { Badge } from "@/components/ui/badge"
import { LogOut, Server, User } from "lucide-react"

export function DashboardHeader() {
  const router = useRouter()
  const user = getCurrentUser()

  /**
   * Handles user logout and redirect to login page
   */
  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-card/80 backdrop-blur">
      <div className="container mx-auto max-w-6xl px-4 py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Panel de Servidores</h1>
              <p className="text-sm text-muted-foreground">Sistema de gestión y monitoreo</p>
            </div>
          </div>

          {/* User info and logout */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1.5">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{user?.username}</span>
              <Badge variant={user?.role === "admin" ? "default" : "secondary"}>
                {user?.role === "admin" ? "Administrador" : "Usuario"}
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
