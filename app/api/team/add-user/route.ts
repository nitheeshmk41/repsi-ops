import { NextRequest, NextResponse } from "next/server";
import { Client, Users, ID } from "node-appwrite";
import { opsStore } from "@/lib/services/ops-store";
import { roleToAppwriteLabel } from "@/lib/auth/rbac";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://syd.cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6ac3dc080031ce673bdf";
const apiKey = process.env.APPWRITE_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const callerRole = req.cookies.get("repsi_role")?.value;
    if (callerRole !== "ADMIN" && callerRole !== "FOUNDER") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Only Admins can add team members." },
        { status: 403 }
      );
    }

    const { name, email, role, roles, password, department, title, phone } = await req.json();

    const assignedRoles: string[] = (
      roles && Array.isArray(roles) && roles.length > 0
        ? roles
        : (role ? [role] : ["DEVELOPER"])
    ).map((r: string) => r.toUpperCase());

    if (!name || !email || !password || assignedRoles.length === 0) {
      return NextResponse.json(
        { success: false, error: "Name, email, password, and at least one role are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const primaryRole = assignedRoles[0];

    // 1. Create user in Appwrite Auth
    const adminClient = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);
    const usersService = new Users(adminClient);

    const newUser = await usersService.create(
      ID.unique(),
      cleanEmail,
      undefined,
      password,
      name
    );

    // 2. Set role labels (alphanumeric for Appwrite) and preferences
    const sanitizedLabels = assignedRoles.map(roleToAppwriteLabel);
    await usersService.updateLabels(newUser.$id, sanitizedLabels);
    await usersService.updatePrefs(newUser.$id, {
      role: primaryRole,
      roles: assignedRoles,
      department: department || "Operations",
      phone: phone || undefined,
      title: title || `${assignedRoles.join(" / ")}`,
    });

    // 3. Sync to opsStore
    const userProfile = {
      id: newUser.$id,
      name,
      email: cleanEmail,
      role: primaryRole,
      roles: assignedRoles,
      phone: phone || undefined,
      department: department || "Operations",
      title: title || `${assignedRoles.join(" / ")}`,
      avatar_url: `https://avatar.vercel.sh/${cleanEmail}`,
    };

    opsStore.createUser(userProfile as any);

    return NextResponse.json({
      success: true,
      user: userProfile,
      message: `User ${name} (${cleanEmail}) created with role(s): ${assignedRoles.join(", ")}.`,
    });
  } catch (error: any) {
    console.error("Add user error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create user in Appwrite." },
      { status: 500 }
    );
  }
}
