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
    const packageToken = searchParams.get("package_token");
    if (!packageToken) {
      return NextResponse.json({ message: "package_token is required" }, { status: 400 });
    }

    const base = getApiUrl(API_ENDPOINTS.QR_LOOKUP);
    const upstreamUrl = `${base}?package_token=${encodeURIComponent(packageToken)}`;

    const upstream = await fetch(upstreamUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.accessToken}`,
      },
      cache: "no-store",
    });

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json({ message: "Failed to look up receipt" }, { status: 500 });
  }
}
