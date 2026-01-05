/**
 * Shared hook types and utilities
 */

export interface UseDataListReturn<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;
  refetch: () => Promise<void>;
}

export interface ApiListResponse<T> {
  status: string;
  message?: string;
  data?: T[];
}
