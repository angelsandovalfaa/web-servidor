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
