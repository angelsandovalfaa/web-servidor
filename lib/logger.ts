/**
 * Logger Module
 * Handles recording and retrieving action logs
 * Stores logs in localStorage for persistence
 */

import type { ActionLog, UserRole } from "./types"

const LOGS_STORAGE_KEY = "server_manager_logs"

/**
 * Generates a unique ID for log entries
 * @returns A unique string identifier
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Retrieves all stored action logs
 * @returns Array of action logs sorted by newest first
 */
export function getLogs(): ActionLog[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(LOGS_STORAGE_KEY)
  if (stored) {
    try {
      const logs = JSON.parse(stored) as ActionLog[]
      // Convert date strings back to Date objects
      return logs.map((log) => ({
        ...log,
        timestamp: new Date(log.timestamp),
      }))
    } catch {
      return []
    }
  }
  return []
}

/**
 * Saves logs to localStorage
 * @param logs - Array of logs to persist
 */
function saveLogs(logs: ActionLog[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs))
  }
}

/**
 * Records a login action
 * @param username - The user who logged in
 * @param userRole - The role of the user
 */
export function logLogin(username: string, userRole: UserRole): void {
  const logs = getLogs()
  const newLog: ActionLog = {
    id: generateId(),
    username,
    userRole,
    action: "login",
    timestamp: new Date(),
  }
  logs.unshift(newLog) // Add to beginning for newest first
  saveLogs(logs)
}

/**
 * Records a server restart action
 * @param username - The user who performed the restart
 * @param userRole - The role of the user
 * @param serverName - The name of the restarted server
 */
export function logRestart(username: string, userRole: UserRole, serverName: string): void {
  const logs = getLogs()
  const newLog: ActionLog = {
    id: generateId(),
    username,
    userRole,
    action: "restart",
    serverName,
    timestamp: new Date(),
  }
  logs.unshift(newLog)
  saveLogs(logs)
}

/**
 * Records a user creation action
 * @param adminUsername - The admin who created the user
 * @param createdUsername - The username of the created user
 */
export function logUserCreated(adminUsername: string, createdUsername: string): void {
  const logs = getLogs()
  const newLog: ActionLog = {
    id: generateId(),
    username: adminUsername,
    userRole: "admin",
    action: "user_created",
    createdUser: createdUsername,
    timestamp: new Date(),
  }
  logs.unshift(newLog)
  saveLogs(logs)
}

/**
 * Clears all stored logs
 */
export function clearLogs(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(LOGS_STORAGE_KEY)
  }
}

/**
 * Retrieves action logs filtered by username (for normal users to see their own logs)
 * @param username - The username to filter by
 * @returns Array of action logs for that user sorted by newest first
 */
export function getLogsByUser(username: string): ActionLog[] {
  const allLogs = getLogs()
  return allLogs.filter((log) => log.username === username && log.action === "restart")
}
