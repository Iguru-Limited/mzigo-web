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
  BROWSE:'/reports/stage_traffic.php',
  ATTENDANT_STATS:'/reports/attendant_stats.php',
  LIST_UNLOADED:'/legacy_loading/list.php',
  CREATE_LEGACY_LOADING:'/legacy_loading/create.php',
  CREATE_DIRECT_LOADING:'/direct_loading/create.php',
  CREATE_DETAILED_LOADING:'/detailed_loading/create.php',
  UPDATE_DETAILED_LOADING:'/detailed_loading/update.php',
  LIST_PARCELS:'/mzigo/list.php',
  PRINT_DUPLICATE:'/mzigo/reprint.php',
  LIST_DISPATCH_SHEETS:'/dispatch/list.php',
  CREATE_DISPATCH:'/dispatch/manage.php',
  LIST_LOADING_SHEETS:'/legacy_loading/details.php',
  GET_LOADING_SHEET_DETAIL:'/legacy_loading/details.php',
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

// Export individual constants for convenience
export const { 
  CREATE_MZIGO,
  LIST_VEHICLES,
  LIST_DESTINATION,
  LIST_SIZES,
  LIST_ROUTES,
  PAYMENT_METHODS,
  QR_LOOKUP,
  SEARCH_MZIGO,
  BROWSE,
  ATTENDANT_STATS,
  LIST_UNLOADED,
  CREATE_LEGACY_LOADING,
  CREATE_DIRECT_LOADING,
  CREATE_DETAILED_LOADING,
  UPDATE_DETAILED_LOADING,
  LIST_PARCELS,
  PRINT_DUPLICATE,
  LIST_DISPATCH_SHEETS,
  CREATE_DISPATCH,
  LIST_LOADING_SHEETS,
  GET_LOADING_SHEET_DETAIL,
} = API_ENDPOINTS;
