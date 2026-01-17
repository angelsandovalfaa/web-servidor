"use client"

import type React from "react"

/**
 * Create User Form Component
 * Allows admin to create new users with server permissions
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createUser } from "@/lib/users"
import { logUserCreated } from "@/lib/logger"
import { getCurrentUser } from "@/lib/auth"
import { SERVERS } from "@/lib/servers"
import { UserPlus } from "lucide-react"
import type { UserRole } from "@/lib/types"

interface CreateUserFormProps {
  onUserCreated?: () => void
}

export function CreateUserForm({ onUserCreated }: CreateUserFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("user")
  const [selectedServers, setSelectedServers] = useState<string[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Handles server checkbox toggle
   */
  const handleServerToggle = (serverId: string, checked: boolean) => {
    if (checked) {
      setSelectedServers((prev) => [...prev, serverId])
    } else {
      setSelectedServers((prev) => prev.filter((id) => id !== serverId))
    }
  }

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole)
    if (newRole === "admin") {
      setSelectedServers(SERVERS.map((s) => s.id))
    }
  }

  /**
   * Handles form submission to create a new user
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!username.trim() || !password.trim()) {
      setError("Usuario y contraseña son requeridos")
      return
    }

    if (role === "user" && selectedServers.length === 0) {
      setError("Debe seleccionar al menos un servidor")
      return
    }

    setIsLoading(true)

    const allowedServers = role === "admin" ? SERVERS.map((s) => s.id) : selectedServers

    const created = createUser({
      username: username.trim(),
      password: password.trim(),
      role: role,
      allowedServers: allowedServers,
    })

    if (created) {
      const admin = getCurrentUser()
      if (admin) {
        logUserCreated(admin.username, username.trim())
      }
      const roleLabel = role === "admin" ? "administrador" : "normal"
      setSuccess(`Usuario ${roleLabel} "${username}" creado exitosamente`)
      setUsername("")
      setPassword("")
      setRole("user")
      setSelectedServers([])
      onUserCreated?.()
    } else {
      setError("El nombre de usuario ya existe")
    }

    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <UserPlus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Crear Usuario</CardTitle>
            <CardDescription>Agregar un nuevo usuario al sistema</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username field */}
          <div className="space-y-2">
            <Label htmlFor="new-username">Nombre de Usuario</Label>
            <Input
              id="new-username"
              type="text"
              placeholder="Ingrese nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <Label htmlFor="new-password">Contraseña</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Ingrese contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Tipo de Usuario</Label>
            <RadioGroup value={role} onValueChange={(value) => handleRoleChange(value as UserRole)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="user" id="role-user" />
                <Label htmlFor="role-user" className="text-sm font-normal cursor-pointer">
                  Usuario Normal
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="admin" id="role-admin" />
                <Label htmlFor="role-admin" className="text-sm font-normal cursor-pointer">
                  Administrador
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Server permissions - Only show for normal users */}
          {role === "user" && (
            <div className="space-y-3">
              <Label>Servidores Permitidos</Label>
              <p className="text-sm text-muted-foreground">
                Seleccione los servidores que este usuario podrá reiniciar
              </p>
              <div className="space-y-2">
                {SERVERS.map((server) => (
                  <div key={server.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`server-${server.id}`}
                      checked={selectedServers.includes(server.id)}
                      onCheckedChange={(checked) => handleServerToggle(server.id, checked as boolean)}
                    />
                    <Label htmlFor={`server-${server.id}`} className="text-sm font-normal cursor-pointer">
                      {server.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {role === "admin" && (
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              Los administradores tienen acceso a todos los servidores y pueden gestionar usuarios.
            </p>
          )}

          {/* Error message */}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Success message */}
          {success && <p className="text-sm text-emerald-600">{success}</p>}

          {/* Submit button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creando..." : "Crear Usuario"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
