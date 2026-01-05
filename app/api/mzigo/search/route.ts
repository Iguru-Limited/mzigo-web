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

    // Get search query from URL params
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    
    if (!q) {
      return NextResponse.json({ error: "Search query 'q' is required" }, { status: 400 });
    }

    // Build the upstream URL with both parameters
    const upstreamUrl = new URL(getApiUrl(API_ENDPOINTS.SEARCH_MZIGO));
    upstreamUrl.searchParams.set("q", q);
    upstreamUrl.searchParams.set("company_id", companyId.toString());

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
    console.error("Search mzigo error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
