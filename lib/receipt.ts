import { ReceiptData, ReceiptItem } from "@/types/operations/receipt";
import { generateQRCodeDataUrl } from "./qr-utils";

// Paper width options for thermal printers
export type PaperWidth = "58mm" | "80mm";

// Waits for all images in the print window (including the QR) to finish loading
// so they reliably show up in the printout.
async function waitForImages(printWindow: Window): Promise<void> {
  const images = Array.from(printWindow.document.images);
  if (images.length === 0) {
    console.log("No images found in print window");
    return;
  }

  console.log(`Waiting for ${images.length} image(s) to load...`);

  await Promise.all(
    images.map((img, idx) =>
      new Promise<void>((resolve) => {
        // Data URLs are typically already loaded, but check anyway
        if (img.complete && img.naturalHeight > 0) {
          console.log(`Image ${idx} already loaded (${img.src.substring(0, 50)}...)`);
          resolve();
          return;
        }

        const timeout = setTimeout(() => {
          console.warn(`Image ${idx} timeout (resolving anyway)`);
          img.removeEventListener("load", done);
          img.removeEventListener("error", done);
          resolve();
        }, 2000);

        const done = () => {
          clearTimeout(timeout);
          img.removeEventListener("load", done);
          img.removeEventListener("error", done);
          console.log(`Image ${idx} loaded successfully`);
          resolve();
        };

        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      })
    )
  );

  console.log("All images ready for print");
}

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
  console.log("openPrintWindow called:", { receipt_number: data.receipt_number, paperWidth, hasToken: !!data.package_token });
  
  const html = await generateReceiptHtml(data, paperWidth);
  console.log("HTML generated, length:", html.length, "contains QR:", html.includes("img src="));
  
  const w = window.open("", "PRINT", "height=600,width=300");
  if (!w) {
    console.error("Failed to open print window");
    return;
  }
  
  w.document.write(html);
  w.document.close();
  console.log("HTML written to print window, waiting for DOM ready...");

  const triggerPrint = async () => {
    console.log("Triggering print, waiting for images...");
    await waitForImages(w);
    console.log("Images ready, focusing window and calling print()");
    w.focus();
    w.print();
  };

  if (w.document.readyState === "complete") {
    console.log("Print window DOM already complete, triggering print immediately");
    void triggerPrint();
  } else {
    console.log("Waiting for print window 'load' event");
    w.addEventListener("load", () => {
      console.log("Print window 'load' event fired, triggering print");
      void triggerPrint();
    }, { once: true });
  }
}

/**
 * Generate receipt HTML for bridge app printing
 * This includes the QR code as a data URL inline for reliable rendering
 */
export async function generateBridgeReceiptHtml(
  data: ReceiptData & { qrCodeDataUrl?: string }
): Promise<string> {
  const width = "48mm";
  const lines = data.receipt.map(lineToHtml).join("");

  // QR codes are no longer included in receipt communications
  const qrCodeHtml = "";

  const css = `
    <style>
      * {
        box-sizing: border-box;
      }
      body { 
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 12px;
        line-height: 1.3;
        margin: 0;
        padding: 2mm;
        width: ${width};
      }
      .receipt { 
        width: ${width}; 
        max-width: 100%;
      }
      img {
        max-width: 100%;
        height: auto;
        display: block;
      }
    </style>
  `;

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipt ${data.receipt_number}</title>
        ${css}
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
