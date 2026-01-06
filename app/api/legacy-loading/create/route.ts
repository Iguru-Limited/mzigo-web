import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { API_ENDPOINTS, getApiUrl } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { parcel_ids, destination_id } = body;

    if (!parcel_ids || !Array.isArray(parcel_ids) || parcel_ids.length === 0 || !destination_id) {
      return NextResponse.json({ message: "Missing or invalid: parcel_ids (array), destination_id" }, { status: 400 });
    }

    const url = getApiUrl(API_ENDPOINTS.CREATE_LEGACY_LOADING);
    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.accessToken}`,
      },
      body: JSON.stringify({ parcel_ids, destination_id }),
      cache: "no-store",
    });

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json({ message: "Failed to create legacy loading sheet" }, { status: 500 });
  }
}
