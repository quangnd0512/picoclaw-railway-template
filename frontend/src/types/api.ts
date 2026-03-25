/**
 * Type definitions for API request/response payloads.
 */

import type { AppConfig } from './config';

export interface SaveConfigPayload extends AppConfig {
  _restartGateway: boolean;
}

export interface ApiErrorResponse {
  error: string;
  details?: Record<string, unknown>;
}

export interface ApiSuccessResponse<T = unknown> {
  data: T;
  message?: string;
}
