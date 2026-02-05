"use client"

/**
 * Server Panel Component
 * Main panel displaying all servers, user management, and action logs
 */

import { useState, useEffect } from "react"
import { ServerCard } from "./server-card"
import { ActionLogsTable } from "./action-logs-table"
import { CreateUserForm } from "./create-user-form"
import { CreateServerForm } from "./create-server-form"
import { UsersList } from "./users-list"
import { getServers } from "../lib/servers"
import { isAdmin, getCurrentUser } from "../lib/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Server } from "../lib/types"

export function ServerPanel() {
  // Used to trigger log and user list refresh
  const [refreshKey, setRefreshKey] = useState(0)
  const [servers, setServers] = useState<Server[]>([])
  const showAdminSection = isAdmin()
  const currentUser = getCurrentUser()

  useEffect(() => {
    const fetchServers = async () => {
      const data = await getServers()
      setServers(data)
    }
    fetchServers()
  }, [refreshKey])

  /**
   * Called when a server restart completes or user is created to refresh data
   */
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 space-y-10">
      {/* Server Cards Section */}
      <div className="rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Servidores</h2>
            <p className="text-muted-foreground">Gestione y reinicie los servidores del sistema</p>
          </div>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {servers.map((server) => (
            <ServerCard key={server.id} server={server} onRestartComplete={handleRefresh} onDelete={handleRefresh} />
          ))}
        </div>
      </div>

      {!showAdminSection && currentUser && (
        <div className="space-y-4">
          <ActionLogsTable
            refreshKey={refreshKey}
            filterByUser={currentUser.username}
            title="Mi Historial de Reinicios"
            description="Registro de los servidores que has reiniciado"
          />
        </div>
      )}

      {/* Admin Section - User Management and Logs */}
      {showAdminSection && (
        <div className="rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm">
          <Tabs defaultValue="logs" className="w-full">
            <TabsList className="mb-4 rounded-xl bg-muted/60 p-1">
              <TabsTrigger value="logs">Registro de Acciones</TabsTrigger>
              <TabsTrigger value="users">Gestión de Usuarios</TabsTrigger>
              <TabsTrigger value="servers">Gestión de Servidores</TabsTrigger>
            </TabsList>

            <TabsContent value="logs">
              <ActionLogsTable refreshKey={refreshKey} />
            </TabsContent>

            <TabsContent value="users">
              <div className="grid gap-6 lg:grid-cols-2">
                <CreateUserForm onUserCreated={handleRefresh} />
                <UsersList refreshKey={refreshKey} />
              </div>
            </TabsContent>

            <TabsContent value="servers">
              <CreateServerForm onServerCreated={handleRefresh} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
