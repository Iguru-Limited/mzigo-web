import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { API_ENDPOINTS, getApiUrl } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const baseUrl = getApiUrl(API_ENDPOINTS.LIST_LOADING_SHEETS);
    const upstreamUrl = new URL(baseUrl);
    
    // Forward query params (type, end_date, etc.)
    const type = req.nextUrl.searchParams.get("type");
    const endDate = req.nextUrl.searchParams.get("end_date");
    
    if (type) {
      upstreamUrl.searchParams.set("type", type);
    }
    if (endDate) {
      upstreamUrl.searchParams.set("end_date", endDate);
    }

    const upstream = await fetch(upstreamUrl.toString(), {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.accessToken}`,
      },
      cache: "no-store",
    });

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json({ message: "Failed to fetch loading sheets" }, { status: 500 });
  }
}
