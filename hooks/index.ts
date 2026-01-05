/**
 * Centralized hook exports
 */

// Mzigo hooks
export { useCreateMzigo } from "./mzigo/use-create-mzigo";
export { useReceiptLookup } from "./mzigo/use-receipt-lookup";
export { useSearchMzigo } from "./mzigo/use-search-mzigo";
export { useBrowseMzigo } from "./mzigo/use-browse-mzigo";

// Data hooks (reference data)
export { useDestinations } from "./data/use-destinations";
export { usePaymentMethods } from "./data/use-payment-methods";
export { useRoutes } from "./data/use-routes";
export { useSizes } from "./data/use-sizes";
export { useVehicles } from "./data/use-vehicles";

// Offline hooks
export { useOfflineData } from "./offline/use-offline-data";
export { useOnlineStatus } from "./offline/use-online-status";
export { useServiceWorker } from "./offline/use-service-worker";

// UI hooks
export { useIsMobile } from "./ui/use-mobile";

// Re-export types
export type { UseDataListReturn, ApiListResponse } from "./types";
