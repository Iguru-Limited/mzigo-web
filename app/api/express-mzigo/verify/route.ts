import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { API_ENDPOINTS, getApiUrl } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const upstreamUrl = getApiUrl(API_ENDPOINTS.VERIFY_EXPRESS_PACKAGE);

    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.accessToken}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status });
    }

    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error("Express verify error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
