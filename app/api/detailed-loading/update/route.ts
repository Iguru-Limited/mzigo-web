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
    const { sheet_number, parcel_ids } = body;

    if (!sheet_number || !parcel_ids || !Array.isArray(parcel_ids) || parcel_ids.length === 0) {
      return NextResponse.json({ message: "Missing or invalid: sheet_number, parcel_ids (array)" }, { status: 400 });
    }

    const url = getApiUrl(API_ENDPOINTS.UPDATE_DETAILED_LOADING);
    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.accessToken}`,
      },
      body: JSON.stringify({ sheet_number, parcel_ids }),
      cache: "no-store",
    });

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json({ message: "Failed to update detailed loading sheet" }, { status: 500 });
  }
}
