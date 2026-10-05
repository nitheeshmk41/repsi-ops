import { NextRequest, NextResponse } from "next/server";
import { Client, Account, Users } from "node-appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://syd.cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6ac3dc080031ce673bdf";
const apiKey = process.env.APPWRITE_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Initialize Admin client to check if user exists in Appwrite DB
    const adminClient = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);
    const usersService = new Users(adminClient);

    const userList = await usersService.list();
    const existingUser = userList.users.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    // If user not found in DB, return exact required message
    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found in system. Please contact your Admin to create your account.",
        },
        { status: 404 }
      );
    }

    // 2. Validate password via Appwrite Account session creation
    const userClient = new Client().setEndpoint(endpoint).setProject(projectId);
    const accountService = new Account(userClient);

    let session;
    try {
      session = await accountService.createEmailPasswordSession(cleanEmail, password);
    } catch (authErr: any) {
      const msg = authErr.message || "";
      if (msg.toLowerCase().includes("password") || authErr.code === 401) {
        return NextResponse.json(
          { success: false, error: "Invalid password for this account." },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { success: false, error: authErr.message || "Authentication failed." },
        { status: 401 }
      );
    }

    // Determine user roles from Appwrite user labels/prefs
    const roles: string[] = (
      (existingUser.labels && existingUser.labels.length > 0)
        ? existingUser.labels
        : (existingUser.prefs?.roles || [existingUser.prefs?.role || "ADMIN"])
    ).map((r: string) => r.toUpperCase());
    const primaryRole = roles[0] || "ADMIN";

    const userPayload = {
      id: existingUser.$id,
      name: existingUser.name || cleanEmail.split("@")[0].toUpperCase(),
      email: existingUser.email,
      role: primaryRole,
      roles: roles,
      department: existingUser.prefs?.department || "Internal Operations",
      title: existingUser.prefs?.title || `${primaryRole} Specialist`,
      created_at: existingUser.$createdAt,
    };

    const response = NextResponse.json({
      success: true,
      user: userPayload,
      sessionId: session.$id,
    });

    // Set secure authentication cookies
    response.cookies.set("repsi_session", session.secret || session.$id, {
      path: "/",
      httpOnly: false, // Accessible to client auth provider
      maxAge: 30 * 24 * 60 * 60, // 30 days
      sameSite: "lax",
    });

    response.cookies.set("repsi_role", primaryRole, {
      path: "/",
      httpOnly: false,
      maxAge: 30 * 24 * 60 * 60,
      sameSite: "lax",
    });

    response.cookies.set("repsi_user_email", cleanEmail, {
      path: "/",
      httpOnly: false,
      maxAge: 30 * 24 * 60 * 60,
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error during authentication." },
      { status: 500 }
    );
  }
}
