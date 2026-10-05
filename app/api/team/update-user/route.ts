import { NextRequest, NextResponse } from "next/server";
import { Client, Users } from "node-appwrite";
import { opsStore } from "@/lib/services/ops-store";
import { roleToAppwriteLabel } from "@/lib/auth/rbac";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://syd.cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6ac3dc080031ce673bdf";
const apiKey = process.env.APPWRITE_API_KEY || "";

export async function PUT(req: NextRequest) {
  try {
    const callerRole = req.cookies.get("repsi_role")?.value;
    if (callerRole !== "ADMIN" && callerRole !== "FOUNDER") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Only Admins can modify team members." },
        { status: 403 }
      );
    }

    const { userId, name, roles, department, title, phone } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required." },
        { status: 400 }
      );
    }

    const assignedRoles: string[] = (
      roles && Array.isArray(roles) && roles.length > 0
        ? roles
        : ["DEVELOPER"]
    ).map((r: string) => r.toUpperCase());

    const adminClient = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);
    const usersService = new Users(adminClient);

    // 1. Update Name in Appwrite
    if (name) {
      await usersService.updateName(userId, name);
    }

    // 2. Update Labels (alphanumeric for Appwrite)
    const sanitizedLabels = assignedRoles.map(roleToAppwriteLabel);
    await usersService.updateLabels(userId, sanitizedLabels);

    // 3. Update Preferences
    const primaryRole = assignedRoles[0];
    await usersService.updatePrefs(userId, {
      role: primaryRole,
      roles: assignedRoles,
      department: department || "Operations",
      phone: phone || undefined,
      title: title || assignedRoles.join(" / "),
    });

    // 4. Update in opsStore if present
    const existing = opsStore.getUserById(userId);
    if (existing) {
      if (name) existing.name = name;
      existing.role = primaryRole as any;
      existing.roles = assignedRoles as any;
      if (department) existing.department = department;
      if (phone !== undefined) existing.phone = phone;
    }

    return NextResponse.json({
      success: true,
      message: `User updated successfully with ${assignedRoles.length} role(s).`,
      roles: assignedRoles,
    });
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update user." },
      { status: 500 }
    );
  }
}
