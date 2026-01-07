import type { PrintDuplicatePayload, PrintDuplicateResponse } from "@/types";

export function usePrintDuplicate() {
  const printDuplicate = async (payload: PrintDuplicatePayload): Promise<PrintDuplicateResponse> => {
    const response = await fetch("/api/duplicate/print", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to print duplicate receipt");
    }

    return response.json();
  };

  return { printDuplicate };
}
