import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getApiUrl, API_ENDPOINTS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token?.accessToken) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized - Please log in again" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const url = getApiUrl(API_ENDPOINTS.CREATE_MZIGO);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    // Check if response is JSON or HTML
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      // Backend returned HTML (probably a 401 redirect or error page)
      return NextResponse.json(
        {
          status: "error",
          message: "Session expired - Please refresh the page and try again",
        },
        { status: 401 }
      );
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in mzigo API route:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
