import { NextResponse } from "next/server";
import { Client, Users } from "node-appwrite";
import { appwriteLabelToRole } from "@/lib/auth/rbac";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://syd.cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6ac3dc080031ce673bdf";
const apiKey = process.env.APPWRITE_API_KEY || "";

export async function GET() {
  try {
    const adminClient = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);
    const usersService = new Users(adminClient);

    const list = await usersService.list();

    const users = list.users.map((u) => {
      const roles: string[] = (
        (u.prefs?.roles && Array.isArray(u.prefs.roles) && u.prefs.roles.length > 0)
          ? u.prefs.roles
          : (u.labels && u.labels.length > 0)
            ? u.labels.map(appwriteLabelToRole)
            : [u.prefs?.role || "ADMIN"]
      ).map((r: string) => r.toUpperCase());
      const primaryRole = roles[0] || "ADMIN";

      return {
        id: u.$id,
        name: u.name || u.email.split("@")[0].toUpperCase(),
        email: u.email,
        role: primaryRole,
        roles: roles,
        department: u.prefs?.department || "Internal Operations",
        title: u.prefs?.title || `${primaryRole} Specialist`,
        phone: u.phone || u.prefs?.phone || undefined,
        active_tasks_count: 0,
        completed_tasks_count: 0,
        open_bugs_count: 0,
        overdue_tasks_count: 0,
        avatar_url: `https://avatar.vercel.sh/${u.email}`,
        created_at: u.$createdAt,
      };
    });

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ success: false, users: [], error: error.message }, { status: 500 });
  }
}
