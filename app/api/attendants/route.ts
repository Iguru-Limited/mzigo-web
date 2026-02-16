import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { API_ENDPOINTS, getApiUrl } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const stageId = req.nextUrl.searchParams.get("stage_id");
    if (!stageId) {
      return NextResponse.json({ message: "Missing required parameter: stage_id" }, { status: 400 });
    }

    const baseUrl = getApiUrl(API_ENDPOINTS.LIST_ATTENDANTS);
    const upstreamUrl = new URL(baseUrl);
    upstreamUrl.searchParams.set("stage_id", stageId);

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
    return NextResponse.json({ message: "Failed to fetch attendants" }, { status: 500 });
  }
}
