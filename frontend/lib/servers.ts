/**
 * Servers Module
 * Defines the available servers and their initial state
 */

import type { Server } from "./types"

/**
 * Gets servers from API
 */
export async function getServers(): Promise<Server[]> {
  try {
    const response = await fetch('http://localhost:3001/api/servers');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error fetching servers:', error);
  }
  return [];
}

/**
 * Restarts a server via API
 * @param serverId - The ID of the server to restart
 * @returns Promise that resolves when restart completes
 */
export async function simulateRestart(serverId: string): Promise<void> {
  try {
    const response = await fetch(`http://localhost:3001/api/servers/${serverId}/restart`, {
      method: 'POST',
    });
    if (response.ok) {
      console.log(`Server ${serverId} restart initiated`);
    }
  } catch (error) {
    console.error('Error restarting server:', error);
  }
}

/**
 * Stops a server via API
 * @param serverId - The ID of the server to stop
 * @returns Promise that resolves when stop completes
 */
export async function simulateStop(serverId: string): Promise<void> {
  try {
    const response = await fetch(`http://localhost:3001/api/servers/${serverId}/stop`, {
      method: 'POST',
    });
    if (response.ok) {
      console.log(`Server ${serverId} stop initiated`);
    }
  } catch (error) {
    console.error('Error stopping server:', error);
  }
}

/**
 * Adds a new server via API
 * @param name - Server name/title
 * @param ip - Server IP address
 * @param username - SSH username
 * @param password - SSH password
 * @param adminUsername - Admin username for verification
 * @returns Promise that resolves to true if server was added successfully
 */
export async function addServer(name: string, ip: string, username: string, password: string, adminUsername: string): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3001/api/servers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, ip, username, password, adminUsername }),
    });
    if (response.ok) {
      console.log('Server added successfully');
      return true;
    } else {
      const error = await response.json();
      console.error('Error adding server:', error.error);
      return false;
    }
  } catch (error) {
    console.error('Error adding server:', error);
    return false;
  }
}

/**
 * Deletes a server via API
 * @param serverId - The ID of the server to delete
 * @param adminUsername - Admin username for verification
 * @returns Promise that resolves to true if server was deleted successfully
 */
export async function deleteServer(serverId: string, adminUsername: string): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:3001/api/servers/${serverId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminUsername }),
    });
    if (response.ok) {
      console.log('Server deleted successfully');
      return true;
    } else {
      console.error('Error deleting server');
      return false;
    }
  } catch (error) {
    console.error('Error deleting server:', error);
    return false;
  }
}

/**
 * Pings a server and updates its status
 * @param serverId - The ID of the server to ping
 * @returns Promise that resolves to the new status
 */
export async function pingServer(serverId: string): Promise<string> {
  try {
    const response = await fetch(`http://localhost:3001/api/servers/${serverId}/check`, {
      method: 'POST',
    });
    if (response.ok) {
      const data = await response.json();
      return data.status;
    } else {
      throw new Error('Ping failed');
    }
  } catch (error) {
    console.error('Error pinging server:', error);
    throw error;
  }
}
