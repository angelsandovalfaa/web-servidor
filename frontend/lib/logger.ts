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
 * Retrieves all action logs from API
 * @returns Array of action logs sorted by newest first
 */
export async function getLogs(): Promise<ActionLog[]> {
  try {
    const response = await fetch('http://localhost:3001/api/logs', { cache: 'no-cache' });
    if (response.ok) {
      const logs = await response.json();
      return logs.map((log: any) => {
        let username = '', userRole: 'user' | 'admin' = 'user', serverName = '', createdUser = '';
        if (log.action.includes('logged in')) {
          const match = log.action.match(/User (\w+) \((user|admin)\) logged in/);
          if (match) {
            username = match[1];
            userRole = match[2] as 'user' | 'admin';
          }
        } else if (log.action.includes('restarted server')) {
          const match = log.action.match(/User (\w+) \((user|admin)\) restarted server (.+)/);
          if (match) {
            username = match[1];
            userRole = match[2] as 'user' | 'admin';
            serverName = match[3];
          }
        } else if (log.action.includes('apagó el servidor')) {
          const match = log.action.match(/El usuario (\w+) \((user|admin)\) apagó el servidor (.+)/);
          if (match) {
            username = match[1];
            userRole = match[2] as 'user' | 'admin';
            serverName = match[3];
          }
        } else if (log.action.includes('created user')) {
          const match = log.action.match(/Admin (\w+) created user (\w+)/);
          if (match) {
            username = match[1];
            userRole = 'admin';
            createdUser = match[2];
          }
        }
        return {
          ...log,
          username,
          userRole,
          serverName,
          createdUser,
          timestamp: new Date(log.timestamp),
        };
      });
    }
  } catch (error) {
    console.error('Error fetching logs:', error);
  }
  return [];
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
 * Records a login action via API
 * @param username - The user who logged in
 * @param userRole - The role of the user
 */
export async function logLogin(username: string, userRole: UserRole): Promise<void> {
  try {
    await fetch('http://localhost:3001/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: `User ${username} (${userRole}) logged in` }),
    });
  } catch (error) {
    console.error('Error logging login:', error);
  }
}

/**
 * Records a server restart action via API
 * @param username - The user who performed the restart
 * @param userRole - The role of the user
 * @param serverName - The name of the restarted server
 */
export async function logRestart(username: string, userRole: UserRole, serverName: string): Promise<void> {
  console.log('Logging restart:', username, userRole, serverName);
  try {
    const response = await fetch('http://localhost:3001/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: `User ${username} (${userRole}) restarted server ${serverName}` }),
    });
    console.log('Log response:', response.ok);
  } catch (error) {
    console.error('Error logging restart:', error);
  }
}

/**
 * Records a server shutdown action via API
 * @param username - The user who performed the shutdown
 * @param userRole - The role of the user
 * @param serverName - The name of the shutdown server
 */
export async function logShutdown(username: string, userRole: UserRole, serverName: string): Promise<void> {
  console.log('Logging shutdown:', username, userRole, serverName);
  try {
    const response = await fetch('http://localhost:3001/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: `El usuario ${username} (${userRole}) apagó el servidor ${serverName}` }),
    });
    console.log('Log response:', response.ok);
  } catch (error) {
    console.error('Error logging shutdown:', error);
  }
}

/**
 * Records a user creation action via API
 * @param adminUsername - The admin who created the user
 * @param createdUsername - The username of the created user
 */
export async function logUserCreated(adminUsername: string, createdUsername: string): Promise<void> {
  try {
    await fetch('http://localhost:3001/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: `Admin ${adminUsername} created user ${createdUsername}` }),
    });
  } catch (error) {
    console.error('Error logging user creation:', error);
  }
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
