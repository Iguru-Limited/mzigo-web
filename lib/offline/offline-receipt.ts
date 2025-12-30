import { ReceiptData, ReceiptItem } from "@/types/receipt";

interface OfflineShipmentPayload {
  sender_name: string;
  sender_phone: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_town: string;
  parcel_description: string;
  parcel_value: string | number;
  package_size: string;
  amount_charged: string | number;
  payment_mode: string;
  p_vehicle: string;
  receiver_route: string;
  commission: string | number;
  special_instructions: string;
}

interface OfflineReceiptOptions {
  offlineId: string;
  payload: OfflineShipmentPayload;
  userName?: string;
  companyName?: string;
  companyPhone?: string;
}

/**
 * Generate a printable receipt for offline-created shipments
 * This mimics the format returned by the server API
 */
export function generateOfflineReceipt(options: OfflineReceiptOptions): ReceiptData {
  const { offlineId, payload, userName = "Agent", companyName = "MZIGO", companyPhone = "" } = options;
  
  const now = new Date();
  const receiptNumber = `OFFLINE-${offlineId.slice(-8).toUpperCase()}`;
  const packageToken = offlineId.slice(-6).toUpperCase();
  const date = now.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const createLine = (
    content: string,
    options: Partial<ReceiptItem> = {}
  ): ReceiptItem => ({
    text_size: options.text_size || "normal",
    content,
    "pre-text": options["pre-text"] || "",
    "end_1": options["end_1"] || "",
    is_variable: options.is_variable || false,
    is_bold: options.is_bold || false,
  });

  const divider = "--------------------------------";

  const receipt: ReceiptItem[] = [
    // Header
    createLine(companyName, { text_size: "big", is_bold: true }),
    createLine("SHIPMENT RECEIPT", { text_size: "normal", is_bold: true }),
    createLine(divider),
    
    // Receipt info
    createLine(receiptNumber, { "pre-text": "Receipt #: ", is_bold: true }),
    createLine(packageToken, { "pre-text": "Token: ", is_bold: true }),
    createLine(`${date} ${time}`, { "pre-text": "Date: " }),
    createLine(divider),
    
    // Offline indicator
    createLine("** OFFLINE RECEIPT **", { text_size: "small", is_bold: true }),
    createLine("Will sync when online", { text_size: "small" }),
    createLine(divider),
    
    // Sender details
    createLine("SENDER", { is_bold: true }),
    createLine(payload.sender_name, { "pre-text": "Name: " }),
    createLine(payload.sender_phone, { "pre-text": "Phone: " }),
    createLine(divider),
    
    // Receiver details  
    createLine("RECEIVER", { is_bold: true }),
    createLine(payload.receiver_name, { "pre-text": "Name: " }),
    createLine(payload.receiver_phone, { "pre-text": "Phone: " }),
    createLine(payload.receiver_town, { "pre-text": "Town: " }),
    createLine(payload.receiver_route, { "pre-text": "Route: " }),
    createLine(divider),
    
    // Parcel details
    createLine("PARCEL DETAILS", { is_bold: true }),
    createLine(payload.parcel_description, { "pre-text": "Desc: " }),
    createLine(`KES ${payload.parcel_value}`, { "pre-text": "Value: " }),
    createLine(payload.package_size, { "pre-text": "Size: " }),
    createLine(payload.p_vehicle, { "pre-text": "Vehicle: " }),
    createLine(divider),
    
    // Payment details
    createLine("PAYMENT", { is_bold: true }),
    createLine(`KES ${payload.amount_charged}`, { "pre-text": "Amount: ", is_bold: true }),
    createLine(payload.payment_mode, { "pre-text": "Mode: " }),
    createLine(divider),
    
    // Special instructions (if any)
    ...(payload.special_instructions ? [
      createLine("INSTRUCTIONS", { is_bold: true }),
      createLine(payload.special_instructions, { text_size: "small" }),
      createLine(divider),
    ] : []),
    
    // Agent info
    createLine(userName, { "pre-text": "Agent: ", text_size: "small" }),
    createLine(""),
    
    // Footer
    createLine("Thank you for using MZIGO!", { text_size: "small" }),
    createLine(companyPhone ? `Contact: ${companyPhone}` : "", { text_size: "small" }),
  ];

  return {
    id: offlineId,
    receipt_number: receiptNumber,
    package_token: packageToken,
    s_date: date,
    s_time: time,
    receipt,
  };
}

/**
 * Check if a receipt is from an offline shipment
 */
export function isOfflineReceipt(receiptNumber: string): boolean {
  return receiptNumber.startsWith("OFFLINE-");
}
