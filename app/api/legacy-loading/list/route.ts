import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { API_ENDPOINTS, getApiUrl } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const destinationId = searchParams.get("destination_id");

    if (!startDate || !endDate || !destinationId) {
      return NextResponse.json({ message: "Missing required params: start_date, end_date, destination_id" }, { status: 400 });
    }

    const base = getApiUrl(API_ENDPOINTS.LEGACY_LOADING_LIST);
    const upstreamUrl = `${base}?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}&destination_id=${encodeURIComponent(destinationId)}`;

    const upstream = await fetch(upstreamUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.accessToken}`,
      },
      cache: "no-store",
    });

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch (e) {
    return NextResponse.json({ message: "Failed to list unloaded parcels" }, { status: 500 });
  }
}
