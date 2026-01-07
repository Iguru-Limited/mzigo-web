/**
 * Centralized type exports - organized by domain
 * Import types from this file for cleaner imports
 */

// Auth types
export type { LoginResponse, RefreshResponse } from "./auth/auth";

// Reference data types
export type { Destination, DestinationListResponse } from "./reference/destinations";
export type { PaymentMethod, PaymentMethodListResponse } from "./reference/payment-methods";
export type { RouteItem, RouteListResponse } from "./reference/routes";
export type { Size, SizeListResponse } from "./reference/sizes";
export type { Vehicle, VehicleListResponse } from "./reference/vehicles";

// Operations types (Mzigo, receipts, offline)
export type { CreateMzigoPayload, CreateMzigoResponse, LookupResponse } from "./operations/mzigo";
export type {
  TextSize,
  ReceiptItem,
  ReceiptData,
  OfflineMzigoPayload,
  OfflineReceiptOptions,
  ReceiptVariables,
  ReceiptFormatItem,
  ReceiptFormatJson,
} from "./operations/receipt";
export type {
  SyncQueueItem,
  OfflineMzigo,
  CachedData,
  ReferenceData,
  SyncOptions,
  OfflineState,
} from "./operations/offline";

// Loading operations
export type {
  UnloadedParcel,
  UnloadedParcelListResponse,
  CreateLegacyLoadingPayload,
  CreateLegacyLoadingData,
  CreateLegacyLoadingResponse,
  CreateDirectLoadingPayload,
  CreateDirectLoadingData,
  CreateDirectLoadingResponse,
  CreateDetailedLoadingPayload,
  CreateDetailedLoadingData,
  CreateDetailedLoadingResponse,
  UpdateDetailedLoadingPayload,
  UpdateDetailedLoadingData,
  UpdateDetailedLoadingResponse,
} from "./operations/loading";
