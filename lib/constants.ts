/**
 * API Endpoints Constants
 * 
 * All API endpoint paths should be defined here.
 * The base URL is configured via NEXT_PUBLIC_API_URL environment variable.
 */

// Base URL from environment variable
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Authentication endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login.php",
    REFRESH: "/auth/refresh.php", // Add when refresh endpoint is available
    LOGOUT: "/auth/logout.php", // Add when logout endpoint is available
  },
  CREATE_MZIGO:'/mzigo/manage.php',
  LIST_VEHICLES:'vehicle/list.php',
  LIST_DESTINATION:'/destination/list.php',
  LIST_SIZES:'/size/list.php',
  LIST_ROUTES:'/route/list.php',
  PAYMENT_METHODS:'/payments/list.php',
  QR_LOOKUP:'/mzigo/list_receipts.php',
  SEARCH_MZIGO:'/reports/search.php',
} as const;

/**
 * Helper function to build full API URL
 */
export const getApiUrl = (endpoint: string): string => {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured. Please set it in your .env.local file.");
  }
  // Remove trailing slash from base URL if present
  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  // Ensure endpoint starts with /
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl}${path}`;
  return fullUrl;
};
