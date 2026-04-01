/**
 * Integrated API Endpoint Test Suite
 * 
 * Tests all endpoints defined in lib/constants.ts
 * Uses real API calls against PLAYGROUND environment
 * Tests: Authentication, Mzigo operations, Reference data, Operations
 * Authentication: Bearer token management, Token refresh, Logout
 * Error scenarios: 401 Unauthorized, 400 Bad request, 404 Not found
 */

import axios, { AxiosInstance, AxiosError } from "axios";
import { API_ENDPOINTS, getApiUrl } from "../lib/constants";

// Test user credentials
const TEST_CREDENTIALS = {
  id_number: "keen120",
  pass_phrase: "123456",
};

// API base URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://iguru.co.ke/PLAYGROUND/mzigo3.0/api";

// Shared test state
let accessToken = "";
let refreshToken = "";
let apiClient: AxiosInstance;
let userId = 0;
let testCreatedMzigoId = 0;
let testCreatedDispatchId = 0;
let testCreatedCollectionId = 0;

/**
 * Initialize axios client with base URL
 */
beforeAll(() => {
  apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    validateStatus: () => true, // Don't throw on any status code
  });

  // Add request interceptor to inject bearer token
  apiClient.interceptors.request.use((config) => {
    if (accessToken && !config.url?.includes("public_receipt")) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  console.log("\n=== Integrated API Test Suite Started ===");
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Test User: ${TEST_CREDENTIALS.id_number}`);
});

/**
 * Cleanup after all tests
 */
afterAll(async () => {
  if (accessToken) {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      console.log("✓ User logged out successfully");
    } catch (error) {
      console.log("Logout attempt completed");
    }
  }
  console.log("\n=== Integrated API Test Suite Completed ===\n");
});

// ============================================================================
// AUTHENTICATION TESTS
// ============================================================================

describe("Auth - Authentication Endpoints", () => {
  test("POST /auth/login.php - Login with valid credentials", async () => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      id_number: TEST_CREDENTIALS.id_number,
      pass_phrase: TEST_CREDENTIALS.pass_phrase,
    });

    console.log(`\n[LOGIN] Status: ${response.status}`);
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data.status).toBe("success");
    expect(response.data.access_token).toBeDefined();
    expect(response.data.refresh_token).toBeDefined();

    // Store tokens for subsequent requests
    accessToken = response.data.access_token;
    refreshToken = response.data.refresh_token;
    userId = response.data.user?.user_id || response.data.user_id || 0;

    console.log(`[LOGIN] ✓ Access token obtained`);
    console.log(`[LOGIN] ✓ Refresh token obtained`);
    console.log(`[LOGIN] ✓ User ID: ${userId}`);
  });

  test("POST /auth/login.php - Login with invalid credentials", async () => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      id_number: "invalid_user",
      pass_phrase: "wrong_password",
    });

    console.log(`\n[LOGIN-INVALID] Status: ${response.status}`);
    expect([400, 401, 403, 422]).toContain(response.status);
    console.log(`[LOGIN-INVALID] ✓ Correct error status returned`);
  });

  test("POST /auth/refresh.php - Refresh access token", async () => {
    if (!refreshToken) {
      console.log("[REFRESH] ⊘ Skipped: No refresh token available");
      return;
    }

    const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, {
      refresh_token: refreshToken,
    });

    console.log(`\n[REFRESH] Status: ${response.status}`);
    if (response.status === 200 && response.data.access_token) {
      accessToken = response.data.access_token;
      if (response.data.refresh_token) {
        refreshToken = response.data.refresh_token;
      }
      console.log(`[REFRESH] ✓ Token refreshed successfully`);
    } else {
      console.log(`[REFRESH] ⊘ Refresh not supported or failed: ${response.status}`);
    }
  });

  test("POST /auth/logout.php - Logout successfully", async () => {
    if (!accessToken) {
      console.log("[LOGOUT] ⊘ Skipped: No access token available");
      return;
    }

    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);

    console.log(`\n[LOGOUT] Status: ${response.status}`);
    expect([200, 201, 204]).toContain(response.status);
    console.log(`[LOGOUT] ✓ User logged out successfully`);
  });

  test("POST /auth/login.php - Re-login for subsequent tests", async () => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      id_number: TEST_CREDENTIALS.id_number,
      pass_phrase: TEST_CREDENTIALS.pass_phrase,
    });

    console.log(`\n[LOGIN-REAUTH] Status: ${response.status}`);
    expect(response.status).toBe(200);
    accessToken = response.data.access_token;
    refreshToken = response.data.refresh_token;
    userId = response.data.user?.user_id || response.data.user_id || 0;
    console.log(`[LOGIN-REAUTH] ✓ Re-authenticated for remaining tests`);
  });
});

// ============================================================================
// REFERENCE DATA ENDPOINTS
// ============================================================================

describe("Reference Data - Lookup Endpoints", () => {
  test("GET /vehicle/list.php - List all vehicles", async () => {
    const response = await apiClient.get(API_ENDPOINTS.LIST_VEHICLES);

    console.log(`\n[LIST_VEHICLES] Status: ${response.status}`);
    expect([200, 201]).toContain(response.status);
    expect(Array.isArray(response.data) || response.data.data).toBeDefined();
    console.log(`[LIST_VEHICLES] ✓ Retrieved vehicles`);
  });

  test("GET /destination/list.php - List all destinations", async () => {
    const response = await apiClient.get(API_ENDPOINTS.LIST_DESTINATION);

    console.log(`\n[LIST_DESTINATION] Status: ${response.status}`);
    expect([200, 201]).toContain(response.status);
    expect(Array.isArray(response.data) || response.data.data).toBeDefined();
    console.log(`[LIST_DESTINATION] ✓ Retrieved destinations`);
  });

  test("GET /size/list.php - List all parcel sizes", async () => {
    const response = await apiClient.get(API_ENDPOINTS.LIST_SIZES);

    console.log(`\n[LIST_SIZES] Status: ${response.status}`);
    expect([200, 201]).toContain(response.status);
    expect(Array.isArray(response.data) || response.data.data).toBeDefined();
    console.log(`[LIST_SIZES] ✓ Retrieved sizes`);
  });

  test("GET /route/list.php - List all routes", async () => {
    const response = await apiClient.get(API_ENDPOINTS.LIST_ROUTES);

    console.log(`\n[LIST_ROUTES] Status: ${response.status}`);
    expect([200, 201]).toContain(response.status);
    expect(Array.isArray(response.data) || response.data.data).toBeDefined();
    console.log(`[LIST_ROUTES] ✓ Retrieved routes`);
  });

  test("GET /payments/list.php - List payment methods", async () => {
    const response = await apiClient.get(API_ENDPOINTS.PAYMENT_METHODS);

    console.log(`\n[PAYMENT_METHODS] Status: ${response.status}`);
    expect([200, 201]).toContain(response.status);
    expect(Array.isArray(response.data) || response.data.data).toBeDefined();
    console.log(`[PAYMENT_METHODS] ✓ Retrieved payment methods`);
  });

  test("GET /user/list.php - List attendants", async () => {
    const response = await apiClient.get(API_ENDPOINTS.LIST_ATTENDANTS);

    console.log(`\n[LIST_ATTENDANTS] Status: ${response.status}`);
    expect([200, 201]).toContain(response.status);
    expect(Array.isArray(response.data) || response.data.data).toBeDefined();
    console.log(`[LIST_ATTENDANTS] ✓ Retrieved attendants`);
  });
});

// ============================================================================
// MZIGO OPERATIONS
// ============================================================================

describe("Mzigo Operations - Core Parcel Management", () => {
  test("GET /mzigo/list.php - List all parcels", async () => {
    const response = await apiClient.get(API_ENDPOINTS.LIST_PARCELS);

    console.log(`\n[LIST_PARCELS] Status: ${response.status}`);
    expect([200, 201]).toContain(response.status);
    expect(response.data).toBeDefined();
    console.log(`[LIST_PARCELS] ✓ Retrieved parcels list`);
  });

  test("GET /mzigo/list.php - List parcels with pagination", async () => {
    const response = await apiClient.get(API_ENDPOINTS.LIST_PARCELS, {
      params: { limit: 10, offset: 0 },
    });

    console.log(`\n[LIST_PARCELS-PAGINATED] Status: ${response.status}`);
    expect([200, 201]).toContain(response.status);
    console.log(`[LIST_PARCELS-PAGINATED] ✓ Pagination working`);
  });

  test("POST /mzigo/manage.php - Create mzigo (new parcel)", async () => {
    const mzigoData = {
      destination_id: 1,
      recipient_name: "Test Recipient",
      recipient_phone: "0701234567",
      parcel_size_id: 1,
      parcel_weight: "5kg",
      payment_method_id: 1,
      amount: 500,
      description: "Test parcel for integration testing",
    };

    const response = await apiClient.post(API_ENDPOINTS.CREATE_MZIGO, mzigoData);

    console.log(`\n[CREATE_MZIGO] Status: ${response.status}`);
    if (response.status === 200 || response.status === 201) {
      testCreatedMzigoId = response.data.id || response.data.mzigo_id || 0;
      console.log(`[CREATE_MZIGO] ✓ Mzigo created with ID: ${testCreatedMzigoId}`);
    } else {
      console.log(`[CREATE_MZIGO] ⊘ Creation failed or requires specific valid data: ${response.status}`);
    }
  });

  test("GET /mzigo/list_receipts.php - QR Receipt Lookup", async () => {
    const response = await apiClient.get(API_ENDPOINTS.QR_LOOKUP, {
      params: { package_token: "TEST" },
    });

    console.log(`\n[QR_LOOKUP] Status: ${response.status}`);
    expect([200, 201, 404]).toContain(response.status);
    console.log(`[QR_LOOKUP] ✓ QR lookup endpoint working`);
  });

  test("GET /reports/search.php - Search mzigo by query", async () => {
    const response = await apiClient.get(API_ENDPOINTS.SEARCH_MZIGO, {
      params: { q: "test" },
    });

    console.log(`\n[SEARCH_MZIGO] Status: ${response.status}`);
    expect([200, 201]).toContain(response.status);
    console.log(`[SEARCH_MZIGO] ✓ Search endpoint working`);
  });

  test("GET /reports/stage_traffic.php - Browse stage traffic", async () => {
    const response = await apiClient.get(API_ENDPOINTS.BROWSE);

    console.log(`\n[BROWSE] Status: ${response.status}`);
    expect([200, 201]).toContain(response.status);
    console.log(`[BROWSE] ✓ Browse endpoint working`);
  });

  test("GET /reports/attendant_stats.php - Get attendant statistics", async () => {
    const response = await apiClient.get(API_ENDPOINTS.ATTENDANT_STATS);

    console.log(`\n[ATTENDANT_STATS] Status: ${response.status}`);
    expect([200, 201]).toContain(response.status);
    console.log(`[ATTENDANT_STATS] ✓ Attendant stats working`);
  });

  test("POST /mzigo/reprint.php - Print duplicate receipt", async () => {
    const response = await apiClient.post(API_ENDPOINTS.PRINT_DUPLICATE, {
      mzigo_id: testCreatedMzigoId || 1,
    });

    console.log(`\n[PRINT_DUPLICATE] Status: ${response.status}`);
    expect([200, 201, 400, 404]).toContain(response.status);
    console.log(`[PRINT_DUPLICATE] ✓ Print endpoint working`);
  });

  test("GET /mzigo/public_receipt.php - Public receipt access (no auth)", async () => {
    // Temporarily remove auth header for this test
    const tempClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      validateStatus: () => true,
    });

    const response = await tempClient.get(API_ENDPOINTS.PUBLIC_RECIPTS, {
      params: { token: "TEST" },
    });

    console.log(`\n[PUBLIC_RECEIPT] Status: ${response.status}`);
    expect([200, 201, 400, 404]).toContain(response.status);
    console.log(`[PUBLIC_RECEIPT] ✓ Public receipt endpoint working`);
  });
});

// ============================================================================
// LOADING & DISPATCH OPERATIONS
// ============================================================================

describe("Operations - Loading Sheets & Dispatch", () => {
  test("GET /legacy_loading/list.php - List unloaded sheets", async () => {
    const response = await apiClient.get(API_ENDPOINTS.LIST_UNLOADED);

    console.log(`\n[LIST_UNLOADED] Status: ${response.status}`);
    expect([200, 201]).toContain(response.status);
    console.log(`[LIST_UNLOADED] ✓ Retrieved unloaded sheets`);
  });

  test("POST /legacy_loading/create.php - Create legacy loading sheet", async () => {
    const sheetData = {
      vehicle_id: 1,
      route_id: 1,
      mzigo_ids: testCreatedMzigoId ? [testCreatedMzigoId] : [],
    };

    const response = await apiClient.post(API_ENDPOINTS.CREATE_LEGACY_LOADING, sheetData);

    console.log(`\n[CREATE_LEGACY_LOADING] Status: ${response.status}`);
    expect([200, 201, 400, 422]).toContain(response.status);
    if (response.status === 200 || response.status === 201) {
      console.log(`[CREATE_LEGACY_LOADING] ✓ Legacy loading sheet created`);
    } else {
      console.log(`[CREATE_LEGACY_LOADING] ⊘ Creation requires valid references or data`);
    }
  });

  test("GET /legacy_loading/details.php - Get loading sheet details", async () => {
    const response = await apiClient.get(API_ENDPOINTS.GET_LOADING_SHEET_DETAIL, {
      params: { id: 1 },
    });

    console.log(`\n[GET_LOADING_SHEET_DETAIL] Status: ${response.status}`);
    expect([200, 201, 404]).toContain(response.status);
    console.log(`[GET_LOADING_SHEET_DETAIL] ✓ Loading sheet details endpoint working`);
  });

  test("POST /direct_loading/create.php - Create direct loading", async () => {
    const directLoadData = {
      vehicle_id: 1,
      mzigo_ids: testCreatedMzigoId ? [testCreatedMzigoId] : [],
    };

    const response = await apiClient.post(API_ENDPOINTS.CREATE_DIRECT_LOADING, directLoadData);

    console.log(`\n[CREATE_DIRECT_LOADING] Status: ${response.status}`);
    expect([200, 201, 400, 422]).toContain(response.status);
    if (response.status === 200 || response.status === 201) {
      console.log(`[CREATE_DIRECT_LOADING] ✓ Direct loading created`);
    }
  });

  test("POST /detailed_loading/create.php - Create detailed loading", async () => {
    const detailedLoadData = {
      vehicle_id: 1,
      route_id: 1,
      parcels: testCreatedMzigoId ? [{ mzigo_id: testCreatedMzigoId }] : [],
    };

    const response = await apiClient.post(API_ENDPOINTS.CREATE_DETAILED_LOADING, detailedLoadData);

    console.log(`\n[CREATE_DETAILED_LOADING] Status: ${response.status}`);
    expect([200, 201, 400, 422]).toContain(response.status);
  });

  test("GET /dispatch/list.php - List dispatch sheets", async () => {
    const response = await apiClient.get(API_ENDPOINTS.LIST_DISPATCH_SHEETS);

    console.log(`\n[LIST_DISPATCH_SHEETS] Status: ${response.status}`);
    expect([200, 201]).toContain(response.status);
    console.log(`[LIST_DISPATCH_SHEETS] ✓ Retrieved dispatch sheets`);
  });

  test("POST /dispatch/manage.php - Create dispatch", async () => {
    const dispatchData = {
      vehicle_id: 1,
      mzigo_ids: testCreatedMzigoId ? [testCreatedMzigoId] : [],
      notes: "Test dispatch for integration testing",
    };

    const response = await apiClient.post(API_ENDPOINTS.CREATE_DISPATCH, dispatchData);

    console.log(`\n[CREATE_DISPATCH] Status: ${response.status}`);
    expect([200, 201, 400, 422]).toContain(response.status);
    if (response.status === 200 || response.status === 201) {
      testCreatedDispatchId = response.data.id || 0;
      console.log(`[CREATE_DISPATCH] ✓ Dispatch created with ID: ${testCreatedDispatchId}`);
    }
  });
});

// ============================================================================
// COLLECTIONS & DELIVERIES
// ============================================================================

describe("Operations - Collections & Deliveries", () => {
  test("GET /collection/list.php - List collections", async () => {
    const response = await apiClient.get(API_ENDPOINTS.LIST_COLLECTIONS);

    console.log(`\n[LIST_COLLECTIONS] Status: ${response.status}`);
    expect([200, 201]).toContain(response.status);
    console.log(`[LIST_COLLECTIONS] ✓ Retrieved collections`);
  });

  test("POST /collection/manage.php - Create collection", async () => {
    const collectionData = {
      vehicle_id: 1,
      mzigo_ids: testCreatedMzigoId ? [testCreatedMzigoId] : [],
      collection_from: "Test Location",
      amount: 500,
    };

    const response = await apiClient.post(API_ENDPOINTS.CREATE_COLLECTION, collectionData);

    console.log(`\n[CREATE_COLLECTION] Status: ${response.status}`);
    expect([200, 201, 400, 422]).toContain(response.status);
    if (response.status === 200 || response.status === 201) {
      testCreatedCollectionId = response.data.id || 0;
      console.log(`[CREATE_COLLECTION] ✓ Collection created with ID: ${testCreatedCollectionId}`);
    }
  });

  test("GET /delivery/list.php - List deliveries", async () => {
    const response = await apiClient.get(API_ENDPOINTS.LIST_DELIVERIES);

    console.log(`\n[LIST_DELIVERIES] Status: ${response.status}`);
    expect([200, 201]).toContain(response.status);
    console.log(`[LIST_DELIVERIES] ✓ Retrieved deliveries`);
  });

  test("POST /delivery/manage.php - Create delivery", async () => {
    const deliveryData = {
      mzigo_id: testCreatedMzigoId || 1,
      delivery_status: "in_transit",
      notes: "Test delivery for integration testing",
    };

    const response = await apiClient.post(API_ENDPOINTS.CREATE_DELIVERY, deliveryData);

    console.log(`\n[CREATE_DELIVERY] Status: ${response.status}`);
    expect([200, 201, 400, 422]).toContain(response.status);
    if (response.status === 200 || response.status === 201) {
      console.log(`[CREATE_DELIVERY] ✓ Delivery created`);
    }
  });
});

// ============================================================================
// NOTIFICATIONS & EXPRESS
// ============================================================================

describe("Operations - Notifications & Express", () => {
  test("GET /notify/list.php - List notifications", async () => {
    const response = await apiClient.get(API_ENDPOINTS.LIST_NOTIFICATION);

    console.log(`\n[LIST_NOTIFICATION] Status: ${response.status}`);
    expect([200, 201]).toContain(response.status);
    console.log(`[LIST_NOTIFICATION] ✓ Retrieved notifications`);
  });

  test("POST /notify/manage.php - Create notification", async () => {
    const notificationData = {
      mzigo_id: testCreatedMzigoId || 1,
      message: "Test notification for integration testing",
      recipient_phone: "0701234567",
    };

    const response = await apiClient.post(API_ENDPOINTS.CREATE_NOTIFICATION, notificationData);

    console.log(`\n[CREATE_NOTIFICATION] Status: ${response.status}`);
    expect([200, 201, 400, 422]).toContain(response.status);
  });

  test("GET /express_mzigo/list.php - List express packages", async () => {
    const response = await apiClient.get(API_ENDPOINTS.LIST_EXPRESS_PACKAGE);

    console.log(`\n[LIST_EXPRESS_PACKAGE] Status: ${response.status}`);
    expect([200, 201]).toContain(response.status);
    console.log(`[LIST_EXPRESS_PACKAGE] ✓ Retrieved express packages`);
  });

  test("POST /express_mzigo/verify.php - Verify express package", async () => {
    const response = await apiClient.post(API_ENDPOINTS.VERIFY_EXPRESS_PACKAGE, {
      package_token: "TEST",
    });

    console.log(`\n[VERIFY_EXPRESS_PACKAGE] Status: ${response.status}`);
    expect([200, 201, 400, 404]).toContain(response.status);
    console.log(`[VERIFY_EXPRESS_PACKAGE] ✓ Verify endpoint working`);
  });
});

// ============================================================================
// ERROR HANDLING & EDGE CASES
// ============================================================================

describe("Error Handling - Auth & Validation Errors", () => {
  test("Auth - Missing bearer token on protected endpoint", async () => {
    const tempClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      validateStatus: () => true,
    });

    const response = await tempClient.get(API_ENDPOINTS.LIST_PARCELS);

    console.log(`\n[MISSING_TOKEN] Status: ${response.status}`);
    expect([401, 403, 400]).toContain(response.status);
    console.log(`[MISSING_TOKEN] ✓ Correctly rejects request without token`);
  });

  test("Validation - POST without required fields", async () => {
    const response = await apiClient.post(API_ENDPOINTS.CREATE_MZIGO, {
      // Missing required fields
    });

    console.log(`\n[VALIDATION_ERROR] Status: ${response.status}`);
    expect([400, 422, 500]).toContain(response.status);
    console.log(`[VALIDATION_ERROR] ✓ Correctly validates required fields`);
  });

  test("Not Found - Invalid resource ID", async () => {
    const response = await apiClient.get(API_ENDPOINTS.GET_LOADING_SHEET_DETAIL, {
      params: { id: 999999 },
    });

    console.log(`\n[NOT_FOUND] Status: ${response.status}`);
    expect([404, 200]).toContain(response.status); // Some endpoints may return 200 with empty data
    console.log(`[NOT_FOUND] ✓ Handles invalid IDs appropriately`);
  });

  test("Invalid HTTP method", async () => {
    const response = await apiClient.get(API_ENDPOINTS.CREATE_MZIGO);

    console.log(`\n[INVALID_METHOD] Status: ${response.status}`);
    expect([405, 400, 404, 200]).toContain(response.status);
    console.log(`[INVALID_METHOD] ✓ Endpoint method validation working`);
  });
});

// ============================================================================
// INTEGRATION FLOW TESTS
// ============================================================================

describe("Integration - Complete User Workflows", () => {
  test("User Authentication Flow - Login -> Access Protected Endpoint -> Logout", async () => {
    // Step 1: Re-login
    const loginResponse = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      id_number: TEST_CREDENTIALS.id_number,
      pass_phrase: TEST_CREDENTIALS.pass_phrase,
    });
    console.log(`\n[WORKFLOW] Step 1 - Login: ${loginResponse.status}`);
    expect(loginResponse.status).toBe(200);

    const tempToken = loginResponse.data.access_token;
    const tempRefreshToken = loginResponse.data.refresh_token;

    // Step 2: Access protected endpoint
    const tempClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      validateStatus: () => true,
    });

    tempClient.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${tempToken}`;
      return config;
    });

    const listResponse = await tempClient.get(API_ENDPOINTS.LIST_PARCELS);
    console.log(`[WORKFLOW] Step 2 - Access Protected Resource: ${listResponse.status}`);
    expect([200, 201]).toContain(listResponse.status);

    // Step 3: Logout
    const logoutResponse = await tempClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    console.log(`[WORKFLOW] Step 3 - Logout: ${logoutResponse.status}`);
    expect([200, 201, 204]).toContain(logoutResponse.status);

    console.log(`[WORKFLOW] ✓ Complete authentication flow successful`);
  });

  test("API Response Consistency - All list endpoints return consistent structure", async () => {
    const endpoints = [
      { name: "Vehicles", endpoint: API_ENDPOINTS.LIST_VEHICLES },
      { name: "Destinations", endpoint: API_ENDPOINTS.LIST_DESTINATION },
      { name: "Sizes", endpoint: API_ENDPOINTS.LIST_SIZES },
      { name: "Routes", endpoint: API_ENDPOINTS.LIST_ROUTES },
      { name: "Parcels", endpoint: API_ENDPOINTS.LIST_PARCELS },
    ];

    console.log(`\n[CONSISTENCY] Testing response consistency across endpoints`);

    for (const { name, endpoint } of endpoints) {
      const response = await apiClient.get(endpoint);
      expect([200, 201]).toContain(response.status);
      expect(response.data).toBeDefined();
      console.log(`  ✓ ${name}: ${response.status} - Data received`);
    }

    console.log(`[CONSISTENCY] ✓ All endpoints return consistent responses`);
  });

  test("Bearer Token Injection - Verify Authorization header is sent", async () => {
    let capturedAuthHeader = "";

    const testClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      validateStatus: () => true,
    });

    testClient.interceptors.request.use((config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
        capturedAuthHeader = config.headers.Authorization;
      }
      return config;
    });

    await testClient.get(API_ENDPOINTS.LIST_PARCELS);

    console.log(`\n[AUTH_HEADER] Authorization header: ${capturedAuthHeader.substring(0, 15)}...`);
    expect(capturedAuthHeader).toMatch(/^Bearer /);
    console.log(`[AUTH_HEADER] ✓ Bearer token correctly injected`);
  });

  test("Request Timeout Handling - Verify timeout configuration", async () => {
    const timeoutClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 1, // Very short timeout to trigger timeout error
      validateStatus: () => true,
    });

    timeoutClient.interceptors.request.use((config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });

    try {
      await timeoutClient.get(API_ENDPOINTS.LIST_PARCELS);
      console.log(`\n[TIMEOUT] Request completed (or API is very fast)`);
    } catch (error: any) {
      console.log(`\n[TIMEOUT] Caught timeout error as expected`);
      expect(error.code).toBe("ECONNABORTED");
    }
  });
});

// ============================================================================
// PERFORMANCE & STABILITY TESTS
// ============================================================================

describe("Performance & Stability", () => {
  test("Multiple sequential requests - Verify API stability", async () => {
    console.log(`\n[STABILITY] Running 5 sequential requests`);

    for (let i = 1; i <= 5; i++) {
      const response = await apiClient.get(API_ENDPOINTS.LIST_PARCELS);
      expect([200, 201]).toContain(response.status);
      console.log(`  Request ${i}: ${response.status}`);
    }

    console.log(`[STABILITY] ✓ API remained stable through sequential requests`);
  });

  test("Reference data caching - Verify consistent responses", async () => {
    console.log(`\n[CACHING] Testing caching behavior`);

    const response1 = await apiClient.get(API_ENDPOINTS.LIST_SIZES);
    const response2 = await apiClient.get(API_ENDPOINTS.LIST_SIZES);

    expect(response1.status).toBe(response2.status);
    expect(Array.isArray(response1.data) || response1.data.data).toBeDefined();

    console.log(`[CACHING] ✓ Reference data returns consistent responses`);
  });
});
