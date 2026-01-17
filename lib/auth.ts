/**
 * Authentication Module
 * Handles user login, logout, and session management
 * Uses localStorage to persist user session
 */

import type { User } from "./types"
import { validateUser } from "./users"

const USER_STORAGE_KEY = "server_manager_user"

/**
 * Validates user credentials and logs them in
 * @param username - The username entered by the user
 * @param password - The password entered by the user
 * @returns The logged in user or null if validation fails
 */
export function login(username: string, password: string): User | null {
  const registeredUser = validateUser(username, password)

  if (registeredUser) {
    const user: User = {
      username: registeredUser.username,
      role: registeredUser.role,
      allowedServers: registeredUser.allowedServers,
    }
    // Store user in localStorage for session persistence
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    }
    return user
  }
  return null
}

/**
 * Logs out the current user by clearing the session
 */
export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_STORAGE_KEY)
  }
}

/**
 * Retrieves the currently logged in user from storage
 * @returns The current user or null if not logged in
 */
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(USER_STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored) as User
    } catch {
      return null
    }
  }
  return null
}

/**
 * Checks if a user is currently authenticated
 * @returns True if user is logged in
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}

/**
 * Checks if the current user has admin privileges
 * @returns True if user is an administrator
 */
export function isAdmin(): boolean {
  const user = getCurrentUser()
  return user?.role === "admin"
}

/**
 * Checks if current user can restart a specific server
 * @param serverId - The server ID to check
 * @returns True if user has permission
 */
export function canRestartServer(serverId: string): boolean {
  const user = getCurrentUser()
  if (!user) return false
  // Admin can restart all servers
  if (user.role === "admin") return true
  // Normal users check their allowed servers
  return user.allowedServers?.includes(serverId) || false
}
