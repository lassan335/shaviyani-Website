import { NextResponse } from "next/server";
import { zohoOAuthStartUrl } from "../../../../../lib/zoho";

export async function GET() {
  return NextResponse.redirect(zohoOAuthStartUrl());
}
