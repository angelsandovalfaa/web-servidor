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
 * Gets all registered users from API
 */
export async function getUsers(): Promise<RegisteredUser[]> {
  console.log('getUsers called');
  try {
    const response = await fetch('http://localhost:3001/api/users', { cache: 'no-cache' });
    console.log('response.ok:', response.ok);
    if (response.ok) {
      const users = await response.json();
      console.log('users:', users);
      return users.map((u: any) => ({ id: u.id, username: u.username, password: '', role: u.role, allowedServers: JSON.parse(u.allowedServers || '[]') }));
    } else {
      console.log('response status:', response.status);
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  }
  return [];
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
export async function createUser(user: RegisteredUser): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3001/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user.username, password: user.password, role: user.role, allowedServers: user.allowedServers }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error creating user:', error);
    return false;
  }
}

/**
 * Deletes a user (admin only, cannot delete admin)
 */
export async function deleteUser(id: number): Promise<boolean> {
  console.log('Deleting user with id:', id);
  if (id === 1) {
    console.log('Cannot delete admin');
    return false; // Assume admin is id 1
  }
  try {
    const response = await fetch(`http://localhost:3001/api/users/${id}`, {
      method: 'DELETE',
    });
    console.log('Delete response ok:', response.ok, 'status:', response.status);
    return response.ok;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
}

/**
 * Gets all normal users (non-admin)
 */
export async function getNormalUsers(): Promise<RegisteredUser[]> {
  const users = await getUsers();
  return users.filter((u) => u.role === "user");
}
