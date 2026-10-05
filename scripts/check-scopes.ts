import { Client, Databases, Users } from "node-appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://syd.cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6ac3dc080031ce673bdf";
const apiKey = process.env.APPWRITE_API_KEY || "";
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "repsi_ops_db";

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const databases = new Databases(client);
const users = new Users(client);

async function check() {
  console.log("Checking scopes for Appwrite key on project", projectId);
  
  try {
    const db = await databases.get(databaseId);
    console.log("[PASS] databases.read -> Database name:", db.name);
  } catch (e: any) {
    console.log("[FAIL] databases.read:", e.message);
  }

  try {
    const cols = await databases.listCollections(databaseId);
    console.log("[PASS] collections.read -> Total collections:", cols.total);
  } catch (e: any) {
    console.log("[FAIL] collections.read:", e.message);
  }

  try {
    const docs = await databases.listDocuments(databaseId, "gyms");
    console.log("[PASS] documents.read -> Total documents:", docs.total);
  } catch (e: any) {
    console.log("[FAIL] documents.read:", e.message);
  }

  try {
    const u = await users.list();
    console.log("[PASS] users.read -> Total users:", u.total);
  } catch (e: any) {
    console.log("[FAIL] users.read:", e.message);
  }
}

check();
