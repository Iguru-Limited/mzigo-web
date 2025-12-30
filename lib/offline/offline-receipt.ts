import { ReceiptData, ReceiptItem } from "@/types/receipt";
import { ReceiptFormatJson } from "@/types/next-auth";

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
  /** Office/location name (from session.office.name) */
  officeName?: string;
  /** Company phone number */
  companyPhone?: string;
  /** Receipt format template from session.company.receipt_format_json */
  receiptFormatJson?: ReceiptFormatJson;
}

/** Map of variable names to their values */
type ReceiptVariables = Record<string, string>;

/**
 * Get the value for a receipt variable
 */
function getVariableValue(variableName: string, variables: ReceiptVariables): string {
  return variables[variableName] || variableName;
}

/**
 * Generate receipt using the template from receipt_format_json
 */
function generateFromTemplate(
  template: ReceiptFormatJson,
  variables: ReceiptVariables
): ReceiptItem[] {
  const receipt: ReceiptItem[] = [];
  
  // Get sorted keys (they are string indices "0", "1", "2", etc.)
  const sortedKeys = Object.keys(template).sort((a, b) => parseInt(a) - parseInt(b));
  
  for (const key of sortedKeys) {
    const item = template[key];
    
    // Resolve content - if it's a variable, get the value
    const content = item.is_variable 
      ? getVariableValue(item.content, variables)
      : item.content;
    
    receipt.push({
      text_size: item.text_size,
      content,
      "pre-text": item["pre-text"],
      "end_1": item.end_1,
      is_variable: item.is_variable,
      is_bold: item.is_bold,
    });
  }
  
  return receipt;
}

/**
 * Generate a printable receipt for offline-created shipments
 * Uses the receipt_format_json template from session if available
 */
export function generateOfflineReceipt(options: OfflineReceiptOptions): ReceiptData {
  const { 
    offlineId, 
    payload, 
    servedBy = "Agent", 
    companyName = "MZIGO", 
    officeName = "Nairobi",
    companyPhone = "",
    receiptFormatJson,
  } = options;
  
  const now = new Date();
  const receiptNumber = `${offlineId.slice(-8).toUpperCase()}`;
  const packageToken = offlineId.slice(-6).toUpperCase();
  const date = now.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-");
  const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const timestamp = `${date} ${time}`;

  // Create variables map for template substitution
  const variables: ReceiptVariables = {
    // Company info
    company: companyName,
    sacco_contacts: companyPhone,
    
    // Parcel details
    parcel_description: payload.parcel_description,
    receipt_number: receiptNumber,
    amount_charged: String(payload.amount_charged),
    payment_mode: payload.payment_mode,
    p_vehicle: payload.p_vehicle,
    
    // Sender details
    sender_name: payload.sender_name,
    sender_phone: payload.sender_phone,
    sender_town: payload.receiver_route, // Using route as sender town
    
    // Receiver details
    receiver_name: payload.receiver_name,
    receiver_phone: payload.receiver_phone,
    receiver_town: payload.receiver_town,
    
    // Footer
    logged_in_user: servedBy,
    timestamp: timestamp,
  };

  let receipt: ReceiptItem[];

  // Use template from session if available, otherwise use default format
  if (receiptFormatJson && Object.keys(receiptFormatJson).length > 0) {
    receipt = generateFromTemplate(receiptFormatJson, variables);
  } else {
    // Fallback to default format if no template provided
    receipt = generateDefaultReceipt(payload, {
      companyName,
      officeName,
      companyPhone,
      servedBy,
      receiptNumber,
      timestamp,
    });
  }

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
 * Generate default receipt format when no template is provided
 */
function generateDefaultReceipt(
  payload: OfflineShipmentPayload,
  info: {
    companyName: string;
    officeName: string;
    companyPhone: string;
    servedBy: string;
    receiptNumber: string;
    timestamp: string;
  }
): ReceiptItem[] {
  const createLine = (
    content: string,
    options: Partial<ReceiptItem> = {}
  ): ReceiptItem => ({
    text_size: options.text_size || "normal",
    content,
    "pre-text": options["pre-text"] || "",
    "end_1": options["end_1"] || "\n",
    is_variable: options.is_variable || false,
    is_bold: options.is_bold || false,
  });

  const divider = "------------------------------";

  return [
    // Header - Company info
    createLine(info.companyName, { text_size: "big", is_bold: true }),
    createLine(info.companyPhone),
    createLine(divider),
    
    // Parcel Details section
    createLine("Parcel Details", { text_size: "big" }),
    createLine(payload.parcel_description, { "pre-text": "Description:" }),
    createLine(info.receiptNumber, { "pre-text": "Waybill      :" }),
    createLine(String(payload.amount_charged), { "pre-text": "Amount      :" }),
    createLine(payload.payment_mode, { "pre-text": "Payment      :" }),
    createLine(payload.p_vehicle, { "pre-text": "Vehicle      :" }),
    createLine(divider),
    
    // Sender details
    createLine(payload.sender_name, { "pre-text": "Sender   Name : " }),
    createLine(payload.sender_phone, { "pre-text": "         Phone:" }),
    createLine(payload.receiver_route, { "pre-text": "         Town  :" }),
    
    // Receiver details  
    createLine(payload.receiver_name, { "pre-text": "Receiver Name: " }),
    createLine(payload.receiver_phone, { "pre-text": "         Phone:" }),
    createLine(payload.receiver_town, { "pre-text": "         Town:" }),
    createLine(divider),
    
    // Terms and conditions
    createLine("**Terms and Conditions Apply**"),
    createLine(info.servedBy, { "pre-text": "Served By:" }),
    createLine(info.timestamp),
    createLine("iGuru Limited|www.iguru.co.ke"),
    createLine(divider, { "end_1": "\n\n" }),
  ];
}

/**
 * Check if a receipt is from an offline shipment
 */
export function isOfflineReceipt(receiptNumber: string): boolean {
  return receiptNumber.startsWith("OFFLINE-");
}
