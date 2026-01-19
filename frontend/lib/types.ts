/**
 * Types for the Server Management Application
 * Defines all interfaces and types used across the application
 */

// User roles available in the system
export type UserRole = "admin" | "user"

// User information stored in session
export interface User {
  username: string
  role: UserRole
  allowedServers?: string[] // Server IDs this user can restart
}

// Registered user stored in the system
export interface RegisteredUser {
  username: string
  password: string
  role: UserRole
  allowedServers: string[] // Server IDs this user can restart
}

// Server information
export interface Server {
  id: string
  name: string
  status: "online" | "restarting" | "offline"
}

// Action log entry for tracking user activities
export interface ActionLog {
  id: string
  username: string
  userRole: UserRole
  action: "login" | "restart" | "user_created"
  serverName?: string
  createdUser?: string
  timestamp: Date
}
