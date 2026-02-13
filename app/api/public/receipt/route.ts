import { API_BASE_URL, API_ENDPOINTS } from "@/lib/constants";
import type { PublicReceiptResponse } from "@/types/operations/public-receipt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { status: "error", message: "Token is required" },
        { status: 400 }
      );
    }

    const url = `${API_BASE_URL}${API_ENDPOINTS.PUBLIC_RECIPTS}?token=${encodeURIComponent(token)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { status: "error", message: error.message || "Failed to fetch receipt" },
        { status: response.status }
      );
    }

    const data: PublicReceiptResponse = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Public receipt fetch error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
