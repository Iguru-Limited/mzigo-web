import { NextRequest, NextResponse } from "next/server";
import { getApiUrl, API_ENDPOINTS } from "@/lib/constants";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { parcel_ids } = body;

    if (!parcel_ids || !Array.isArray(parcel_ids) || parcel_ids.length === 0) {
      return NextResponse.json(
        { error: "parcel_ids array is required and must not be empty" },
        { status: 400 }
      );
    }

    const apiUrl = getApiUrl(API_ENDPOINTS.CREATE_NOTIFICATION);
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(session as any).accessToken}`,
      },
      body: JSON.stringify({
        parcel_ids,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to create notifications" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating notifications:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
