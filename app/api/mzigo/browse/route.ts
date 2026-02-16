import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getApiUrl, API_ENDPOINTS } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get company_id from token
    const companyId = (token.company as any)?.id;
    if (!companyId) {
      return NextResponse.json({ error: "Company ID not found in token" }, { status: 400 });
    }

    // Get query parameters from URL
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const startDate = url.searchParams.get("start_date");
    const endDate = url.searchParams.get("end_date");
    const destinationId = url.searchParams.get("destination_id");
    const userId = url.searchParams.get("user_id");

    // Validate required parameters
    if (!type || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required parameters: type, start_date, end_date" },
        { status: 400 }
      );
    }

    if (type !== "incoming" && type !== "outgoing") {
      return NextResponse.json(
        { error: "Invalid type. Must be 'incoming' or 'outgoing'" },
        { status: 400 }
      );
    }

    // Build the upstream URL with all parameters
    const upstreamUrl = new URL(getApiUrl(API_ENDPOINTS.BROWSE));
    upstreamUrl.searchParams.set("type", type);
    upstreamUrl.searchParams.set("start_date", startDate);
    upstreamUrl.searchParams.set("end_date", endDate);
    upstreamUrl.searchParams.set("company_id", companyId.toString());
    
    if (destinationId) {
      upstreamUrl.searchParams.set("stage_id", destinationId);
    }

    if (userId) {
      upstreamUrl.searchParams.set("user_id", userId);
    }

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
    console.error("Browse mzigo error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
