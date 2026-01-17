/**
 * Servers Module
 * Defines the available servers and their initial state
 */

import type { Server } from "./types"

/**
 * Initial list of servers available in the system
 * In a real application, this would come from a backend API
 */
export const SERVERS: Server[] = [
  {
    id: "server-1",
    name: "Proxmox",
    status: "online",
  },
  {
    id: "server-2",
    name: "Servidor Carpeta Compartida",
    status: "online",
  },
  {
    id: "server-3",
    name: "Servidor Sistema de Mensajes",
    status: "online",
  },
  {
    id: "server-4",
    name: "Servidor Sistema de Documentación Diaria",
    status: "online",
  },
]

/**
 * Simulates a server restart operation
 * In production, this would send a command to actually restart the server
 * @param serverId - The ID of the server to restart
 * @returns Promise that resolves when restart simulation completes
 */
export async function simulateRestart(serverId: string): Promise<void> {
  // Simulate network delay for restart operation
  return new Promise((resolve) => {
    console.log(`[v0] Simulating restart for server: ${serverId}`)
    setTimeout(() => {
      console.log(`[v0] Server ${serverId} restart simulation complete`)
      resolve()
    }, 2000)
  })
}
