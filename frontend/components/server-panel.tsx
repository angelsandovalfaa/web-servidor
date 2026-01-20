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
    <div className="container mx-auto px-4 py-8">
      {/* Server Cards Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Servidores</h2>
        <p className="text-muted-foreground mb-6">Gestione y reinicie los servidores del sistema</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {servers.map((server) => (
            <ServerCard key={server.id} server={server} onRestartComplete={handleRefresh} onDelete={handleRefresh} />
          ))}
        </div>
      </div>

      {!showAdminSection && currentUser && (
        <div className="mt-8">
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
        <div className="mt-8">
          <Tabs defaultValue="logs" className="w-full">
            <TabsList className="mb-4">
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
