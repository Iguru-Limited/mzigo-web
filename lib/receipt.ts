import { ReceiptData, ReceiptItem } from "@/types/receipt";
import { generateQRCodeDataUrl } from "./qr-utils";

// Paper width options for thermal printers
export type PaperWidth = "58mm" | "80mm";

function lineToHtml(item: ReceiptItem): string {
  const sizeMap: Record<string, string> = {
    small: "font-size:10px",
    normal: "font-size:12px",
    big: "font-size:14px",
  };
  const fontWeight = item.is_bold ? "font-weight:700" : "font-weight:400";
  const label = item["pre-text"] ?? "";
  const content = item.content ?? "";
  const end = item["end_1"] ?? ""; // includes line breaks
  const style = `${sizeMap[item.text_size] || sizeMap.normal}; ${fontWeight};`;
  // preserve spaces in labels for alignment (API sometimes prefixes label with spaces)
  return `<div style="${style}; white-space: pre-wrap;">${label}${content}${end}</div>`;
}

export async function generateReceiptHtml(data: ReceiptData, paperWidth: PaperWidth = "58mm"): Promise<string> {
  const width = paperWidth === "58mm" ? "48mm" : "72mm";
  const pageSize = paperWidth === "58mm" ? "58mm auto" : "80mm auto";
  const margin = paperWidth === "58mm" ? "2mm" : "4mm";
  
  const lines = data.receipt.map(lineToHtml).join("");
  
  // Generate QR code for package token (online only - not for offline receipts)
  let qrCodeHtml = "";
  const isOfflineReceipt = data.receipt_number?.startsWith("OFFLINE-");
  if (data.package_token && !isOfflineReceipt) {
    try {
      console.log("Generating QR code for token:", data.package_token);
      const qrDataUrl = await generateQRCodeDataUrl(data.package_token, 140);
      console.log("QR code generated successfully, data URL length:", qrDataUrl.length);
      qrCodeHtml = `
        <div style="text-align: center; margin-top: 10px; padding-top: 8px; border-top: 1px dashed #000; page-break-inside: avoid;">
          <img src="${qrDataUrl}" alt="Package QR Code" style="width: 140px; height: 140px; display: block; margin: 0 auto; image-rendering: crisp-edges;" />
        </div>
      `;
    } catch (error) {
      console.error("Failed to generate QR code for receipt:", error);
      qrCodeHtml = `<div style="text-align: center; color: red; font-size: 10px;">QR code generation failed</div>`;
    }
  }

  const css = `
    <style>
      @page { 
        size: ${pageSize}; 
        margin: ${margin}; 
      }
      @media print {
        html, body {
          width: ${paperWidth};
          margin: 0;
          padding: 0;
        }
      }
      * {
        box-sizing: border-box;
      }
      body { 
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 12px;
        line-height: 1.3;
        margin: 0;
        padding: 2mm;
      }
      .receipt { 
        width: ${width}; 
        max-width: 100%;
      }
      .divider { 
        border-top: 1px dashed #000; 
        margin: 4px 0; 
      }
      img {
        max-width: 100%;
        height: auto;
      }
    </style>
  `;

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        ${css}
        <title>Receipt ${data.receipt_number}</title>
      </head>
      <body>
        <div class="receipt">
          ${lines}
          ${qrCodeHtml}
        </div>
      </body>
    </html>
  `;
}

export async function openPrintWindow(data: ReceiptData, paperWidth: PaperWidth = "58mm") {
  const html = await generateReceiptHtml(data, paperWidth);
  const w = window.open("", "PRINT", "height=600,width=300");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  // Wait for images (QR code) to load before printing
  setTimeout(() => {
    w.print();
  }, 500);
}
