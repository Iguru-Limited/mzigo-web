import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, getApiUrl } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { parcel_id } = body;

    if (!parcel_id) {
      return NextResponse.json({ message: "Missing required field: parcel_id" }, { status: 400 });
    }

    const upstreamUrl = getApiUrl(API_ENDPOINTS.PRINT_DUPLICATE);

    const response = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ parcel_id }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error printing duplicate receipt:", error);
    return NextResponse.json(
      { message: "Failed to print duplicate receipt" },
      { status: 500 }
    );
  }
}
