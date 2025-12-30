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
  /** Name of the user who served (from session.user.name) */
  servedBy?: string;
  /** Company name (from session.company.name) */
  companyName?: string;
  /** Branch/location name (from session.branch.name) */
  branchName?: string;
  /** Company phone number */
  companyPhone?: string;
  /** Company website */
  companyWebsite?: string;
}

/**
 * Generate a printable receipt for offline-created shipments
 * This mimics the format returned by the server API
 */
export function generateOfflineReceipt(options: OfflineReceiptOptions): ReceiptData {
  const { 
    offlineId, 
    payload, 
    servedBy = "Agent", 
    companyName = "MZIGO", 
    branchName = "Nairobi",
    companyPhone = "",
    companyWebsite = "www.iguru.co.ke",
  } = options;
  
  const now = new Date();
  const receiptNumber = `${offlineId.slice(-8).toUpperCase()}`;
  const packageToken = offlineId.slice(-6).toUpperCase();
  const date = now.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-");
  const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

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

  const divider = "------------------------------";

  const receipt: ReceiptItem[] = [
    // Header - Company info
    createLine(companyName, { text_size: "big", is_bold: true }),
    createLine(branchName),
    createLine(companyPhone),
    createLine(divider),
    
    // Parcel Details section
    createLine("Parcel Details", { text_size: "big", is_bold: false }),
    createLine(payload.parcel_description, { "pre-text": "Description:" }),
    createLine(receiptNumber, { "pre-text": "Waybill      :" }),
    createLine(String(payload.amount_charged), { "pre-text": "Amount       :" }),
    createLine(payload.payment_mode, { "pre-text": "Payment      :" }),
    createLine(payload.p_vehicle, { "pre-text": "Vehicle      :" }),
    createLine(divider),
    
    // Sender details
    createLine(payload.sender_name, { "pre-text": "Sender    Name : " }),
    createLine(payload.sender_phone, { "pre-text": "          Phone:" }),
    createLine(payload.receiver_route, { "pre-text": "          Town :" }),
    
    // Receiver details  
    createLine(payload.receiver_name, { "pre-text": "Receiver Name: " }),
    createLine(payload.receiver_phone, { "pre-text": "         Phone:" }),
    createLine(payload.receiver_town, { "pre-text": "         Town:" }),
    createLine(divider),
    
    // Terms and conditions
    createLine("**Terms and Conditions Apply**", { is_bold: true }),
    createLine(servedBy, { "pre-text": "Served By:" }),
    createLine(`${date} ${time}`),
    createLine(`iGuru Limited|${companyWebsite}`),
    createLine(divider),
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
