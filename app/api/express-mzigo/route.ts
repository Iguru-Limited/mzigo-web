import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { API_ENDPOINTS, getApiUrl } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const q = url.searchParams.get("q");

    if (!q) {
      return NextResponse.json({ message: "Query parameter 'q' is required" }, { status: 400 });
    }

    const upstreamUrl = new URL(getApiUrl(API_ENDPOINTS.LIST_EXPRESS_PACKAGE));
    upstreamUrl.searchParams.set("q", q);

    const upstream = await fetch(upstreamUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.accessToken}`,
      },
      cache: "no-store",
    });

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status });
    }

    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error("Express mzigo lookup error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
