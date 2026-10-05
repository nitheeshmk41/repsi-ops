import { NextRequest, NextResponse } from "next/server";
import { Client, Users } from "node-appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://syd.cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6ac3dc080031ce673bdf";
const apiKey = process.env.APPWRITE_API_KEY || "";

export async function GET(req: NextRequest) {
  try {
    const userEmail = req.cookies.get("repsi_user_email")?.value;
    const sessionToken = req.cookies.get("repsi_session")?.value;

    if (!userEmail || !sessionToken) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const adminClient = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);
    const usersService = new Users(adminClient);

    const userList = await usersService.list();
    const existingUser = userList.users.find(
      (u) => u.email.toLowerCase() === userEmail.toLowerCase()
    );

    if (!existingUser) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const roles: string[] = (
      (existingUser.labels && existingUser.labels.length > 0)
        ? existingUser.labels
        : (existingUser.prefs?.roles || [existingUser.prefs?.role || "ADMIN"])
    ).map((r: string) => r.toUpperCase());
    const primaryRole = roles[0] || "ADMIN";

    return NextResponse.json({
      authenticated: true,
      user: {
        id: existingUser.$id,
        name: existingUser.name || userEmail.split("@")[0].toUpperCase(),
        email: existingUser.email,
        role: primaryRole,
        roles: roles,
        department: existingUser.prefs?.department || "Internal Operations",
        title: existingUser.prefs?.title || `${primaryRole} Specialist`,
        created_at: existingUser.$createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false, user: null, error: error.message }, { status: 200 });
  }
}
