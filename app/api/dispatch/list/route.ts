import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, getApiUrl } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const upstreamUrl = getApiUrl(API_ENDPOINTS.LIST_DISPATCH_SHEETS);
    const finalUrl = type === "dispatched" ? `${upstreamUrl}?type=dispatched` : upstreamUrl;

    const response = await fetch(finalUrl, {
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
    console.error("Error fetching loading sheets:", error);
    return NextResponse.json(
      { message: "Failed to fetch loading sheets" },
      { status: 500 }
    );
  }
}
