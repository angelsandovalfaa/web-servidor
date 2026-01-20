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
import { ShutdownModal } from "./shutdown-modal"
import { simulateRestart, simulateStop, deleteServer, pingServer } from "../lib/servers"
import { logRestart, logShutdown, logServerDeleted } from "../lib/logger"
import { getCurrentUser, canRestartServer, canShutdownServer, isAdmin } from "../lib/auth"
import type { Server } from "../lib/types"
import { ServerIcon, RotateCcw, CheckCircle, Lock, PowerOff, Trash2, RefreshCw } from "lucide-react"

interface ServerCardProps {
  server: Server
  onRestartComplete?: () => void
  onDelete?: () => void
}

export function ServerCard({ server, onRestartComplete, onDelete }: ServerCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isShutdownModalOpen, setIsShutdownModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isRestarting, setIsRestarting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [status, setStatus] = useState<Server["status"]>(server.status)

  const canRestart = canRestartServer(server.id)
  const canShutdown = canShutdownServer(server.id)

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
      await logRestart(user.username, user.role, server.name)
      setStatus("online")
      // Notify parent component to refresh logs
      onRestartComplete?.()
    } catch (error) {
      console.error("Restart failed:", error)
      setStatus("stopped") // Keep as stopped if restart fails
    } finally {
      setIsRestarting(false)
    }
  }

  /**
   * Handles the server shutdown process
   * Shows modal for confirmation, then simulates shutdown
   */
  const handleShutdown = async () => {
    const user = getCurrentUser()
    if (!user) return

    setIsStopping(true)
    setStatus("restarting") // Using restarting status for stopping as well
    setIsShutdownModalOpen(false)

    try {
      // Simulate the shutdown process
      await simulateStop(server.id)
      // Log the shutdown action for admin tracking
      await logShutdown(user.username, user.role, server.name)
      setStatus("stopped")
      // Notify parent component to refresh logs
      onRestartComplete?.()
    } catch (error) {
      console.error("Shutdown failed:", error)
      setStatus("offline")
    } finally {
      setIsStopping(false)
    }
  }

  /**
   * Handles the server deletion process
   * Shows modal for confirmation, then deletes the server
   */
  const handleDelete = async () => {
    const user = getCurrentUser()
    if (!user || !isAdmin()) return

    setIsDeleting(true)
    setIsDeleteModalOpen(false)

    try {
      const deleted = await deleteServer(server.id, user.username)
      if (deleted) {
        await logServerDeleted(user.username, server.name)
        onDelete?.()
      } else {
        console.error("Delete failed")
      }
    } catch (error) {
      console.error("Delete failed:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  /**
   * Handles checking server status by pinging
   */
  const handleCheckStatus = async () => {
    setIsChecking(true)
    try {
      const newStatus = await pingServer(server.id)
      setStatus(newStatus)
      onRestartComplete?.()
    } catch (error) {
      console.error("Check status failed:", error)
    } finally {
      setIsChecking(false)
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
      case "stopped":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <PowerOff className="mr-1 h-3 w-3" />
            Apagado
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
            <div className="flex gap-2">
              {canRestart ? (
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)} disabled={isRestarting || isStopping || isDeleting || isChecking || status === "stopped"}>
                  <RotateCcw className={`mr-2 h-4 w-4 ${isRestarting ? "animate-spin" : ""}`} />
                  Reiniciar
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled className="opacity-50 bg-transparent">
                  <Lock className="mr-2 h-4 w-4" />
                  Reiniciar
                </Button>
              )}
              {canShutdown ? (
                <Button variant="destructive" size="sm" onClick={() => setIsShutdownModalOpen(true)} disabled={isRestarting || isStopping || isDeleting || isChecking}>
                  <PowerOff className={`mr-2 h-4 w-4 ${isStopping ? "animate-spin" : ""}`} />
                  Apagar
                </Button>
              ) : (
                <Button variant="destructive" size="sm" disabled className="opacity-50">
                  <Lock className="mr-2 h-4 w-4" />
                  Apagar
                </Button>
              )}
               {isAdmin() && (
                 <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(true)} disabled={isRestarting || isStopping || isDeleting || isChecking} className="text-red-600 hover:text-red-700">
                   <Trash2 className="mr-2 h-4 w-4" />
                   Eliminar
                 </Button>
               )}
               <Button variant="outline" size="sm" onClick={handleCheckStatus} disabled={isRestarting || isStopping || isDeleting || isChecking}>
                 <RefreshCw className={`mr-2 h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
                 Verificar Estado
               </Button>
             </div>
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

      {/* Shutdown Modal */}
      <ShutdownModal
        isOpen={isShutdownModalOpen}
        onClose={() => setIsShutdownModalOpen(false)}
        onConfirm={handleShutdown}
        title={`¿Apagar ${server.name}?`}
        description="Esta acción apagará el servidor. El servidor quedará fuera de línea hasta que se reinicie manualmente."
        isLoading={isStopping}
      />

      {/* Delete Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`¿Eliminar ${server.name}?`}
        description="Esta acción eliminará permanentemente el servidor del sistema. Esta acción no se puede deshacer."
        isLoading={isDeleting}
      />
    </>
  )
}
