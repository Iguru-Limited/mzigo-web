import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getApiUrl, API_ENDPOINTS } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters from URL
    const url = new URL(request.url);
    const startDate = url.searchParams.get("start_date");
    const endDate = url.searchParams.get("end_date");
    const userId = url.searchParams.get("user_id");

    // Validate required parameters
    if (!startDate || !endDate || !userId) {
      return NextResponse.json(
        { error: "Missing required parameters: start_date, end_date, user_id" },
        { status: 400 }
      );
    }

    // Build the upstream URL with all parameters
    const upstreamUrl = new URL(getApiUrl(API_ENDPOINTS.ATTENDANT_STATS));
    upstreamUrl.searchParams.set("start_date", startDate);
    upstreamUrl.searchParams.set("end_date", endDate);
    upstreamUrl.searchParams.set("user_id", userId);

    const response = await fetch(upstreamUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Attendant stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
