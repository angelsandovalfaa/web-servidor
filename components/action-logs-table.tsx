"use client"

/**
 * Action Logs Table Component
 * Displays a table of all user actions (login, restart, user_created)
 * Admins see all logs, normal users see only their own restart logs
 * Includes pagination with 10 items per page
 */

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getLogs, getLogsByUser } from "@/lib/logger"
import type { ActionLog } from "@/lib/types"
import { ClipboardList, LogIn, RotateCcw, UserPlus, ChevronLeft, ChevronRight } from "lucide-react"

const ITEMS_PER_PAGE = 10

interface ActionLogsTableProps {
  refreshKey?: number
  filterByUser?: string
  title?: string
  description?: string
}

export function ActionLogsTable({
  refreshKey,
  filterByUser,
  title = "Registro de Acciones",
  description = "Historial de actividades del sistema",
}: ActionLogsTableProps) {
  const [logs, setLogs] = useState<ActionLog[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (filterByUser) {
      setLogs(getLogsByUser(filterByUser))
    } else {
      setLogs(getLogs())
    }
    setCurrentPage(1)
  }, [refreshKey, filterByUser])

  const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedLogs = logs.slice(startIndex, endIndex)

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date)
  }

  const getRoleBadge = (role: ActionLog["userRole"]) => {
    return role === "admin" ? (
      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Administrador</Badge>
    ) : (
      <Badge variant="secondary">Usuario Normal</Badge>
    )
  }

  const getActionDisplay = (log: ActionLog) => {
    switch (log.action) {
      case "login":
        return (
          <div className="flex items-center gap-2">
            <LogIn className="h-4 w-4 text-emerald-600" />
            <span>Inicio de sesión</span>
          </div>
        )
      case "restart":
        return (
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-amber-600" />
            <span>Reinicio: {log.serverName}</span>
          </div>
        )
      case "user_created":
        return (
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-blue-600" />
            <span>Usuario creado: {log.createdUser}</span>
          </div>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <ClipboardList className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No hay registros de acciones aún.</div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {!filterByUser && <TableHead>Usuario</TableHead>}
                    {!filterByUser && <TableHead>Tipo de Usuario</TableHead>}
                    <TableHead>Acción</TableHead>
                    <TableHead>Fecha y Hora</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLogs.map((log) => (
                    <TableRow key={log.id}>
                      {!filterByUser && <TableCell className="font-medium">{log.username}</TableCell>}
                      {!filterByUser && <TableCell>{getRoleBadge(log.userRole)}</TableCell>}
                      <TableCell>{getActionDisplay(log)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(log.timestamp)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Mostrando {startIndex + 1}-{Math.min(endIndex, logs.length)} de {logs.length} registros
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
