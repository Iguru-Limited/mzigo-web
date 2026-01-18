import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, getApiUrl } from "@/lib/constants";
import type { ListCollectionsParams } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");
    const is_collected = searchParams.get("is_collected");

    if (!start_date || !end_date || is_collected === null) {
      return NextResponse.json(
        { 
          message: "Missing required query parameters: start_date, end_date, is_collected" 
        },
        { status: 400 }
      );
    }

    const upstreamUrl = new URL(getApiUrl(API_ENDPOINTS.LIST_COLLECTIONS));
    upstreamUrl.searchParams.set("start_date", start_date);
    upstreamUrl.searchParams.set("end_date", end_date);
    upstreamUrl.searchParams.set("is_collected", is_collected);

    const response = await fetch(upstreamUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { message: "Failed to fetch collections" },
      { status: 500 }
    );
  }
}
