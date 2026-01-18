import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, getApiUrl } from "@/lib/constants";
import type { CreateCollectionPayload } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body: CreateCollectionPayload = await request.json();
    const { parcel_ids, collector_name, collector_phone, national_id, collector_notes } = body;

    if (!parcel_ids || !collector_name || !collector_phone || !national_id || !collector_notes) {
      return NextResponse.json(
        { 
          message: "Missing required fields: parcel_ids, collector_name, collector_phone, national_id, collector_notes" 
        },
        { status: 400 }
      );
    }

    const upstreamUrl = getApiUrl(API_ENDPOINTS.CREATE_COLLECTION);

    const response = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parcel_ids,
        collector_name,
        collector_phone,
        national_id,
        collector_notes,
      }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json(
      { message: "Failed to create collection" },
      { status: 500 }
    );
  }
}
