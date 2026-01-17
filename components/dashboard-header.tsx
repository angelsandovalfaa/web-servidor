"use client"

/**
 * Dashboard Header Component
 * Displays user info and logout button
 */

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { logout, getCurrentUser } from "@/lib/auth"
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
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Server className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Panel de Servidores</h1>
              <p className="text-sm text-muted-foreground">Sistema de gestión y monitoreo</p>
            </div>
          </div>

          {/* User info and logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
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
