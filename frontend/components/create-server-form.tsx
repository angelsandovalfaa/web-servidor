"use client"

import type React from "react"

/**
 * Create Server Form Component
 * Allows admin to add new servers with SSH credentials
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addServer } from "../lib/servers"
import { logServerAdded } from "../lib/logger"
import { getCurrentUser } from "../lib/auth"
import { Server } from "lucide-react"

interface CreateServerFormProps {
  onServerCreated?: () => void
}

export function CreateServerForm({ onServerCreated }: CreateServerFormProps) {
  const [name, setName] = useState("")
  const [ip, setIp] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Handles form submission to create a new server
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!name.trim() || !ip.trim() || !username.trim() || !password.trim()) {
      setError("Todos los campos son requeridos")
      return
    }

    const currentUser = getCurrentUser()
    if (!currentUser || currentUser.role !== 'admin') {
      setError("Solo los administradores pueden agregar servidores")
      return
    }

    setIsLoading(true)

    const created = await addServer(
      name.trim(),
      ip.trim(),
      username.trim(),
      password.trim(),
      currentUser.username
    )

    if (created) {
      await logServerAdded(currentUser.username, name.trim())
      setSuccess(`Servidor "${name}" agregado exitosamente`)
      setName("")
      setIp("")
      setUsername("")
      setPassword("")
      onServerCreated?.()
    } else {
      setError("Error al agregar el servidor. Verifique que el nombre no esté duplicado.")
    }

    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Server className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Agregar Servidor</CardTitle>
            <CardDescription>Agregar un nuevo servidor al sistema</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field */}
          <div className="space-y-2">
            <Label htmlFor="server-name">Nombre del Servidor</Label>
            <Input
              id="server-name"
              type="text"
              placeholder="Ingrese el nombre del servidor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* IP field */}
          <div className="space-y-2">
            <Label htmlFor="server-ip">Dirección IP</Label>
            <Input
              id="server-ip"
              type="text"
              placeholder="192.168.1.100"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              required
            />
          </div>

          {/* SSH Username field */}
          <div className="space-y-2">
            <Label htmlFor="ssh-username">Usuario SSH</Label>
            <Input
              id="ssh-username"
              type="text"
              placeholder="root"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* SSH Password field */}
          <div className="space-y-2">
            <Label htmlFor="ssh-password">Contraseña SSH</Label>
            <Input
              id="ssh-password"
              type="password"
              placeholder="Ingrese la contraseña SSH"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Error message */}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Success message */}
          {success && <p className="text-sm text-emerald-600">{success}</p>}

          {/* Submit button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Agregando..." : "Agregar Servidor"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}