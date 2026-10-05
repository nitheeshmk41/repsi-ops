import { Client, Users, ID } from "node-appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://syd.cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6ac3dc080031ce673bdf";
const apiKey = process.env.APPWRITE_API_KEY || "";

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const users = new Users(client);

async function run() {
  console.log("Checking Appwrite Users for project:", projectId);
  try {
    const list = await users.list();
    console.log(`Found ${list.total} total users.`);
    for (const u of list.users) {
      console.log(`- ID: ${u.$id} | Email: ${u.email} | Name: ${u.name}`);
    }

    // Remove all users as requested: "remove all user"
    for (const u of list.users) {
      console.log(`Deleting user: ${u.email} (${u.$id})...`);
      await users.delete(u.$id);
      console.log(`Deleted user: ${u.email}`);
    }

    // Now create contact@repsi.app as admin with pass admin567
    console.log("Creating admin user: contact@repsi.app with password admin567...");
    const adminUser = await users.create(
      ID.unique(),
      "contact@repsi.app",
      undefined, // phone
      "admin567",
      "REPSI Admin"
    );
    console.log("Created admin user:", adminUser.$id, adminUser.email);

    // Update labels/prefs
    await users.updateLabels(adminUser.$id, ["ADMIN", "FOUNDER"]);
    await users.updatePrefs(adminUser.$id, { role: "ADMIN", title: "Operations Admin" });
    console.log("Updated admin user prefs with role: ADMIN");

  } catch (err: any) {
    console.error("Error managing users:", err.message);
  }
}

run();
