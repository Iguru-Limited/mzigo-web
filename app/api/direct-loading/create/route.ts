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
    const { parcel_ids, vehicle } = body;

    if (!parcel_ids || !Array.isArray(parcel_ids) || parcel_ids.length === 0 || !vehicle) {
      return NextResponse.json({ message: "Missing or invalid: parcel_ids (array), vehicle (string)" }, { status: 400 });
    }

    const url = getApiUrl(API_ENDPOINTS.CREATE_DIRECT_LOADING);
    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.accessToken}`,
      },
      body: JSON.stringify({ parcel_ids, vehicle }),
      cache: "no-store",
    });

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json({ message: "Failed to create direct loading sheet" }, { status: 500 });
  }
}
