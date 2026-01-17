"use client"

/**
 * Server Card Component
 * Displays individual server information with restart capability
 */

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfirmationModal } from "./confirmation-modal"
import { simulateRestart } from "@/lib/servers"
import { logRestart } from "@/lib/logger"
import { getCurrentUser, canRestartServer } from "@/lib/auth"
import type { Server } from "@/lib/types"
import { ServerIcon, RotateCcw, CheckCircle, Lock } from "lucide-react"

interface ServerCardProps {
  server: Server
  onRestartComplete?: () => void
}

export function ServerCard({ server, onRestartComplete }: ServerCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRestarting, setIsRestarting] = useState(false)
  const [status, setStatus] = useState<Server["status"]>(server.status)

  const canRestart = canRestartServer(server.id)

  /**
   * Handles the server restart process
   * Shows modal for confirmation, then simulates restart
   */
  const handleRestart = async () => {
    const user = getCurrentUser()
    if (!user) return

    setIsRestarting(true)
    setStatus("restarting")
    setIsModalOpen(false)

    try {
      // Simulate the restart process
      await simulateRestart(server.id)
      // Log the restart action for admin tracking
      logRestart(user.username, user.role, server.name)
      setStatus("online")
      // Notify parent component to refresh logs
      onRestartComplete?.()
    } catch (error) {
      console.error("Restart failed:", error)
      setStatus("offline")
    } finally {
      setIsRestarting(false)
    }
  }

  /**
   * Returns the appropriate badge variant based on server status
   */
  const getStatusBadge = () => {
    switch (status) {
      case "online":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            <CheckCircle className="mr-1 h-3 w-3" />
            En línea
          </Badge>
        )
      case "restarting":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
            <RotateCcw className="mr-1 h-3 w-3 animate-spin" />
            Reiniciando
          </Badge>
        )
      case "offline":
        return <Badge variant="destructive">Fuera de línea</Badge>
    }
  }

  return (
    <>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ServerIcon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">{server.name}</CardTitle>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">ID: {server.id}</p>
            {canRestart ? (
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)} disabled={isRestarting}>
                <RotateCcw className={`mr-2 h-4 w-4 ${isRestarting ? "animate-spin" : ""}`} />
                Reiniciar Servidor
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled className="opacity-50 bg-transparent">
                <Lock className="mr-2 h-4 w-4" />
                Sin Permiso
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal for Restart */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleRestart}
        title={`¿Reiniciar ${server.name}?`}
        description="Esta acción reiniciará el servidor. Los servicios pueden no estar disponibles temporalmente durante el proceso."
        isLoading={isRestarting}
      />
    </>
  )
}
