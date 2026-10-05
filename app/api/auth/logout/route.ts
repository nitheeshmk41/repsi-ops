import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });

  const expireOptions = { path: "/", maxAge: 0, expires: new Date(0) };
  response.cookies.set("repsi_session", "", expireOptions);
  response.cookies.set("repsi_role", "", expireOptions);
  response.cookies.set("repsi_user_email", "", expireOptions);
  response.cookies.set("appwrite-session", "", expireOptions);

  return response;
}
