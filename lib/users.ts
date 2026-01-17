/**
 * Users Module
 * Manages registered users in the system
 */

import type { RegisteredUser } from "./types"

const USERS_STORAGE_KEY = "server_manager_users"

/**
 * Default admin user - always exists
 */
const DEFAULT_ADMIN: RegisteredUser = {
  username: "admin",
  password: "admin123",
  role: "admin",
  allowedServers: ["server-1", "server-2", "server-3"], // Admin has access to all
}

/**
 * Gets all registered users from storage
 */
export function getUsers(): RegisteredUser[] {
  if (typeof window === "undefined") return [DEFAULT_ADMIN]

  const stored = localStorage.getItem(USERS_STORAGE_KEY)
  if (stored) {
    try {
      const users = JSON.parse(stored) as RegisteredUser[]
      // Ensure admin always exists
      if (!users.find((u) => u.username === "admin" && u.role === "admin")) {
        return [DEFAULT_ADMIN, ...users]
      }
      return users
    } catch {
      return [DEFAULT_ADMIN]
    }
  }
  // Initialize with default admin
  saveUsers([DEFAULT_ADMIN])
  return [DEFAULT_ADMIN]
}

/**
 * Saves users to storage
 */
function saveUsers(users: RegisteredUser[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  }
}

/**
 * Validates user credentials
 */
export function validateUser(username: string, password: string): RegisteredUser | null {
  const users = getUsers()
  return users.find((u) => u.username === username && u.password === password) || null
}

/**
 * Creates a new user (admin only)
 */
export function createUser(user: RegisteredUser): boolean {
  const users = getUsers()
  // Check if username already exists
  if (users.find((u) => u.username === user.username)) {
    return false
  }
  users.push(user)
  saveUsers(users)
  return true
}

/**
 * Deletes a user (admin only, cannot delete admin)
 */
export function deleteUser(username: string): boolean {
  if (username === "admin") return false
  const users = getUsers()
  const filtered = users.filter((u) => u.username !== username)
  if (filtered.length === users.length) return false
  saveUsers(filtered)
  return true
}

/**
 * Gets all normal users (non-admin)
 */
export function getNormalUsers(): RegisteredUser[] {
  return getUsers().filter((u) => u.role === "user")
}
