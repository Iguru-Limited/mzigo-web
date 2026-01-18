import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, getApiUrl } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");

    if (!type || !start_date || !end_date) {
      return NextResponse.json(
        { 
          message: "Missing required query parameters: type, start_date, end_date" 
        },
        { status: 400 }
      );
    }

    const upstreamUrl = new URL(getApiUrl(API_ENDPOINTS.LIST_DELIVERIES));
    upstreamUrl.searchParams.set("type", type);
    upstreamUrl.searchParams.set("start_date", start_date);
    upstreamUrl.searchParams.set("end_date", end_date);

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
    console.error("Error fetching deliveries:", error);
    return NextResponse.json(
      { message: "Failed to fetch deliveries" },
      { status: 500 }
    );
  }
}
