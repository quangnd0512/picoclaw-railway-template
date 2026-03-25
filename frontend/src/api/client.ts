import type { AppConfig } from '../types/config';
import { defaultConfig } from '../utils/defaultConfig';
import { mergeDeep } from '../utils/mergeDeep';
import type { StatusResponse } from '../types/status';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface LogsResponse {
  lines: string[];
}

export interface PairingList {
  active: Array<{ user_id: string; platform: string; username?: string; approved_at?: string }>;
  pending: Array<{ code: string; platform: string; created_at?: string }>;
}

export interface SaveConfigPayload extends Partial<AppConfig> {
  _restartGateway: boolean;
}

// ============================================================================
// CONFIG ENDPOINTS
// ============================================================================

export async function getConfig(): Promise<AppConfig> {
  const res = await fetch('/api/config', {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch config: ${res.status}`);
  }

  const serverData = await res.json();
  return mergeDeep(defaultConfig(), serverData) as unknown as AppConfig;
}

export async function saveConfig(payload: SaveConfigPayload): Promise<void> {
  const res = await fetch('/api/config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorMsg = `Failed to save config: ${res.status}`;
    try {
      const err = await res.json();
      if (err.error) errorMsg = err.error;
    } catch {
      try {
        const text = await res.text();
        if (text) errorMsg = text;
      } catch {
        /* ignore */
      }
    }
    throw new Error(errorMsg);
  }
}

// ============================================================================
// STATUS & LOGS ENDPOINTS
// ============================================================================

export async function getStatus(): Promise<StatusResponse> {
  const res = await fetch('/api/status', {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch status: ${res.status}`);
  }

  return res.json();
}

export async function getLogs(): Promise<string[]> {
  const res = await fetch('/api/logs', {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch logs: ${res.status}`);
  }

  const data = (await res.json()) as LogsResponse;
  return data.lines;
}

// ============================================================================
// GATEWAY CONTROL ENDPOINTS
// ============================================================================

export async function startGateway(): Promise<void> {
  const res = await fetch('/api/gateway/start', {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Failed to start gateway: ${res.status}`);
  }
}

export async function stopGateway(): Promise<void> {
  const res = await fetch('/api/gateway/stop', {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Failed to stop gateway: ${res.status}`);
  }
}

export async function restartGateway(): Promise<void> {
  const res = await fetch('/api/gateway/restart', {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Failed to restart gateway: ${res.status}`);
  }
}

// ============================================================================
// BACKEND ENDPOINTS
// ============================================================================

export async function getBackend(): Promise<{ backend: 'picoclaw' | 'hermes' }> {
  const res = await fetch('/api/backend', {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch backend: ${res.status}`);
  }

  return res.json();
}

export async function setBackend(backend: 'picoclaw' | 'hermes'): Promise<void> {
  const res = await fetch('/api/backend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ backend }),
  });

  if (!res.ok) {
    throw new Error(`Failed to set backend: ${res.status}`);
  }
}

// ============================================================================
// HERMES PAIRING ENDPOINTS (4 functions)
// ============================================================================

export async function listPairings(): Promise<PairingList> {
  const res = await fetch('/api/hermes/pairing/list', {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Failed to list pairings: ${res.status}`);
  }

  return res.json();
}

export async function approvePairing(platform: string, code: string): Promise<void> {
  const res = await fetch('/api/hermes/pairing/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ platform, code }),
  });

  if (!res.ok) {
    throw new Error(`Failed to approve pairing: ${res.status}`);
  }
}

export async function revokePairing(platform: string, user_id: string): Promise<void> {
  const res = await fetch('/api/hermes/pairing/revoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ platform, user_id }),
  });

  if (!res.ok) {
    throw new Error(`Failed to revoke pairing: ${res.status}`);
  }
}

export async function clearPendingPairings(): Promise<void> {
  const res = await fetch('/api/hermes/pairing/clear-pending', {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Failed to clear pending pairings: ${res.status}`);
  }
}
