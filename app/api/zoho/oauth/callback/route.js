import { NextResponse } from "next/server";
import { exchangeCodeForTokens } from "../../../../../lib/zoho";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) return new NextResponse(`Zoho returned an error: ${error}`, { status: 400 });
  if (!code) return new NextResponse("Missing authorization code", { status: 400 });

  try {
    await exchangeCodeForTokens(code);
    return new NextResponse(
      "<h2>Zoho Books connected ✅</h2><p>You can close this tab and go back to the admin dashboard.</p>",
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (err) {
    return new NextResponse(err.message || "Token exchange failed", { status: 500 });
  }
}
