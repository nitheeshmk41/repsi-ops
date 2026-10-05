import { NextRequest, NextResponse } from "next/server";
import { Client, Users } from "node-appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://syd.cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6ac3dc080031ce673bdf";
const apiKey = process.env.APPWRITE_API_KEY || "";

export async function DELETE(req: NextRequest) {
  try {
    const callerRole = req.cookies.get("repsi_role")?.value;
    if (callerRole !== "ADMIN" && callerRole !== "FOUNDER") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Only Admins can remove team members." },
        { status: 403 }
      );
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required." },
        { status: 400 }
      );
    }

    const adminClient = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);
    const usersService = new Users(adminClient);

    // Protect the primary admin contact@repsi.app
    const targetUser = await usersService.get(userId);
    if (targetUser.email.toLowerCase() === "contact@repsi.app") {
      return NextResponse.json(
        { success: false, error: "Cannot delete the primary root Administrator account." },
        { status: 400 }
      );
    }

    // Delete from Appwrite Auth
    await usersService.delete(userId);

    return NextResponse.json({
      success: true,
      message: `User ${targetUser.name} (${targetUser.email}) removed from system.`,
    });
  } catch (error: any) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete user." },
      { status: 500 }
    );
  }
}
