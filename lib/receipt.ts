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

  // Overall timeout for all images
  const overallTimeout = new Promise<void>((resolve) => {
    setTimeout(() => {
      console.warn("Overall image loading timeout - proceeding anyway");
      resolve();
    }, 3000);
  });

  const imagePromises = Promise.all(
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

  // Race between image loading and overall timeout
  await Promise.race([imagePromises, overallTimeout]);
  console.log("All images ready for print (or timed out)");
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

// Optimized for PDF - smaller fonts to fit on single page
function lineToHtmlPdf(item: ReceiptItem): string {
  const sizeMap: Record<string, string> = {
    small: "font-size:7px",
    normal: "font-size:9px",
    big: "font-size:10px",
  };
  const fontWeight = item.is_bold ? "font-weight:700" : "font-weight:400";
  const label = item["pre-text"] ?? "";
  const content = item.content ?? "";
  const end = item["end_1"] ?? ""; // includes line breaks
  const style = `${sizeMap[item.text_size] || sizeMap.normal}; ${fontWeight};`;
  return `<div style="${style}; white-space: pre-wrap; line-height: 1.15;">${label}${content}${end}</div>`;
}

export async function generateReceiptHtmlForPdf(data: ReceiptData): Promise<string> {
  const lines = data.receipt.map(lineToHtmlPdf).join("");
  
  // Generate QR code for package token (online only - not for offline receipts)
  let qrCodeHtml = "";
  const isOfflineReceipt = data.receipt_number?.startsWith("OFFLINE-");
  if (data.package_token && !isOfflineReceipt) {
    try {
      // Smaller QR code for PDF (70px - smaller to fit on one page)
      const qrDataUrl = await generateQRCodeDataUrl(data.package_token, 70);
      qrCodeHtml = `
        <div style="text-align: center; margin-top: 6px; padding-top: 4px; border-top: 1px dashed #000; page-break-inside: avoid; width: 100%; display: flex; justify-content: center;">
          <img src="${qrDataUrl}" alt="Package QR Code" style="width: 70px; height: 70px; display: block; image-rendering: crisp-edges;" />
        </div>
      `;
    } catch (error) {
      console.error("Failed to generate QR code for receipt:", error);
    }
  }

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Receipt ${data.receipt_number}</title>
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          html, body { 
            width: 100%;
            margin: 0;
            padding: 0;
          }
          body { 
            font-family: monospace;
            font-size: 9px;
            line-height: 1.15;
            padding: 3px;
            background-color: white;
            color: black;
            display: flex;
            justify-content: center;
            max-width: 180mm; /* Prevent stretching on different devices */
          }
          .receipt-container {
            width: 100%;
            max-width: 180mm;
            margin: 0 auto;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .receipt { 
            width: 100%;
            white-space: pre-wrap;
            word-wrap: break-word;
            overflow-wrap: break-word;
            text-align: center;
          }
          img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 0 auto;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="receipt">
            ${lines}
          </div>
          ${qrCodeHtml}
        </div>
      </body>
    </html>
  `;
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

export async function openPrintWindow(
  data: ReceiptData,
  paperWidth: PaperWidth = "58mm",
  copies: number = 1
) {
  console.log("openPrintWindow called:", { receipt_number: data.receipt_number, paperWidth, hasToken: !!data.package_token });
  const copyCount = Number.isFinite(copies) ? Math.max(1, Math.floor(copies)) : 1;
  
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
    for (let idx = 0; idx < copyCount; idx++) {
      console.log(`Printing copy ${idx + 1} of ${copyCount}`);
      w.focus();
      w.print();
    }
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

export async function downloadReceipt(data: ReceiptData): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const html2canvas = (await import("html2canvas")).default;
  
  // Use simplified HTML without external styles
  const html = await generateReceiptHtmlForPdf(data);
  
  // Create a temporary container isolated from page styles
  const container = document.createElement("div");
  container.innerHTML = html;
  
  // Isolate from Tailwind/global styles to avoid lab() color parsing errors
  // Use fixed width (80mm for A4-ish receipt width) so mobile doesn't add extra pages
  Object.assign(container.style, {
    position: "absolute",
    left: "-9999px",
    top: "0",
    width: "180mm", // Fixed A4 width to prevent mobile from creating extra pages
    backgroundColor: "white",
    color: "black",
    all: "initial",
    padding: "0",
    margin: "0",
    boxSizing: "border-box",
  });
  
  document.body.appendChild(container);
  
  try {
    // Wait for any images to load
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Convert HTML to canvas - capture full content height with high quality
    const canvas = await html2canvas(container, {
      scale: 2, // High quality for good output
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      allowTaint: true,
      removeContainer: false,
      ignoreElements: (el) => {
        return el.tagName === 'SCRIPT' || el.tagName === 'LINK';
      },
    });
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 5;
    const imgWidth = pageWidth - (margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const maxHeightPerPage = pageHeight - (margin * 2);
    
    // Convert canvas to JPEG for better quality (90% instead of 85%)
    const imgData = canvas.toDataURL("image/jpeg", 0.90);
    
    // Add image - it will fit on first page
    pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight);
    
    // Add additional pages if needed
    if (imgHeight > maxHeightPerPage) {
      const pagesNeeded = Math.ceil(imgHeight / maxHeightPerPage);
      for (let i = 1; i < pagesNeeded; i++) {
        pdf.addPage();
        // Position image so it continues from previous page
        const offsetY = margin - (i * maxHeightPerPage);
        pdf.addImage(imgData, "JPEG", margin, offsetY, imgWidth, imgHeight);
      }
    }
    
    // Trigger download
    pdf.save(`receipt-${data.receipt_number}.pdf`);
  } finally {
    // Clean up
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  }
}
