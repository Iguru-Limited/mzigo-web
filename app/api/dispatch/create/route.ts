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
    const { sheet_number, courier, end_town, courier_contacts } = body;

    if (!sheet_number || !courier || !end_town || !courier_contacts) {
      return NextResponse.json(
        { message: "Missing required fields: sheet_number, courier, end_town, courier_contacts" },
        { status: 400 }
      );
    }

    const upstreamUrl = getApiUrl(API_ENDPOINTS.CREATE_DISPATCH);

    const response = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sheet_number, courier, end_town, courier_contacts }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error creating dispatch:", error);
    return NextResponse.json(
      { message: "Failed to create dispatch" },
      { status: 500 }
    );
  }
}
