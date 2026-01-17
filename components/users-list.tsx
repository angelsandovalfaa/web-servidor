"use client"

/**
 * Users List Component
 * Displays all registered users with delete option
 */

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getNormalUsers, deleteUser } from "@/lib/users"
import { SERVERS } from "@/lib/servers"
import type { RegisteredUser } from "@/lib/types"
import { Users, Trash2, ServerIcon } from "lucide-react"

interface UsersListProps {
  refreshKey?: number
}

export function UsersList({ refreshKey }: UsersListProps) {
  const [users, setUsers] = useState<RegisteredUser[]>([])

  useEffect(() => {
    setUsers(getNormalUsers())
  }, [refreshKey])

  /**
   * Gets server name by ID
   */
  const getServerName = (serverId: string): string => {
    return SERVERS.find((s) => s.id === serverId)?.name || serverId
  }

  /**
   * Handles user deletion
   */
  const handleDelete = (username: string) => {
    if (confirm(`¿Está seguro de eliminar al usuario "${username}"?`)) {
      deleteUser(username)
      setUsers(getNormalUsers())
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Usuarios Registrados</CardTitle>
            <CardDescription>Usuarios normales en el sistema</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No hay usuarios registrados</p>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.username} className="flex items-start justify-between p-3 rounded-lg border bg-card">
                <div className="space-y-1">
                  <p className="font-medium">{user.username}</p>
                  <div className="flex flex-wrap gap-1">
                    {user.allowedServers.map((serverId) => (
                      <Badge key={serverId} variant="secondary" className="text-xs">
                        <ServerIcon className="mr-1 h-3 w-3" />
                        {getServerName(serverId)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(user.username)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
