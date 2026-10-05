import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });

  response.cookies.set("repsi_session", "", { path: "/", maxAge: 0 });
  response.cookies.set("repsi_role", "", { path: "/", maxAge: 0 });
  response.cookies.set("repsi_user_email", "", { path: "/", maxAge: 0 });

  return response;
}
